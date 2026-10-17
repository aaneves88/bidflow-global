import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Execute the actual Edge Function and shared logging helper with isolated
// dependencies: no real accounts, credentials, database writes or email sends.
function loadFunction(path: string, dependencies: Record<string, unknown>) {
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const withoutImports = ts.factory.updateSourceFile(
    source,
    source.statements.filter(statement => !ts.isImportDeclaration(statement)),
  );
  const { outputText } = ts.transpileModule(ts.createPrinter().printFile(withoutImports), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const exports: Record<string, unknown> = {};
  new Function('exports', ...Object.keys(dependencies), outputText)(exports, ...Object.values(dependencies));
  return exports;
}

const NOW = Date.parse('2026-10-17T09:00:00Z');
const DAY = 86_400_000;
const USER_ID = '00000000-0000-4000-8000-000000000001';
const EMAIL = 'feedback-test@example.invalid';
type Row = Record<string, unknown>;
type Result = { data?: Row[] | Row | null; error?: { code: string } | null; count?: number };
type Handler = (request: Request) => Promise<Response>;

function fixture(ageDays = 7) {
  const profiles: Row[] = [{
    id: USER_ID, email: EMAIL, full_name: 'Ana Teste',
    created_at: new Date(NOW - ageDays * DAY).toISOString(),
  }];
  const claims = new Set<string>();
  const claimAttempts: string[] = [];
  const emailLog: Row[] = [];
  const tickets: Row[] = [];
  const sendTemplateEmail = vi.fn().mockResolvedValue({ sent: true });

  const admin = {
    from(table: string) {
      let operation = 'select';
      let inserted: Row = {};
      let head = false;
      const filters: Array<(row: Row) => boolean> = [];
      const builder = {
        select(_columns: string, options?: { head?: boolean }) {
          head = options?.head ?? false;
          return builder;
        },
        insert(row: Row) { operation = 'insert'; inserted = row; return builder; },
        delete() { operation = 'delete'; return builder; },
        eq(key: string, value: unknown) { filters.push(row => row[key] === value); return builder; },
        gte(key: string, value: string) { filters.push(row => String(row[key]) >= value); return builder; },
        lte(key: string, value: string) { filters.push(row => String(row[key]) <= value); return builder; },
        limit(_limit: number) { return builder; },
        maybeSingle() { return builder; },
        then(resolve: (result: Result) => unknown, reject?: (error: unknown) => unknown) {
          return Promise.resolve().then((): Result => {
            if (table === 'internal_secrets') return { data: { value: 'isolated-test-token' }, error: null };
            if (table === 'feedback_email_log') {
              if (operation === 'insert') {
                const id = String(inserted.user_id);
                claimAttempts.push(id);
                if (claims.has(id)) return { error: { code: '23505' } };
                claims.add(id);
              } else if (operation === 'delete') {
                for (const id of claims) {
                  if (filters.every(filter => filter({ user_id: id }))) claims.delete(id);
                }
              }
              return { error: null };
            }
            if (table === 'email_send_log' && operation === 'insert') {
              emailLog.push(inserted);
              return { error: null };
            }
            const rows = table === 'profiles' ? profiles : table === 'support_tickets' ? tickets : null;
            if (!rows) throw new Error(`Unexpected table: ${table}`);
            const matches = rows.filter(row => filters.every(filter => filter(row)));
            return head ? { count: matches.length, error: null } : { data: matches, error: null };
          }).then(resolve, reject);
        },
      };
      return builder;
    },
  };

  const { sendAppEmail } = loadFunction('supabase/functions/_shared/app-email.ts', { sendTemplateEmail });
  let handler: Handler | undefined;
  loadFunction('supabase/functions/send-feedback-emails/index.ts', {
    createClient: () => admin,
    corsHeaders: {},
    sendAppEmail,
    Deno: {
      env: { get: () => 'isolated-test-value' },
      serve: (callback: Handler) => { handler = callback; },
    },
  });

  async function run() {
    if (!handler) throw new Error('The Edge Function did not register its handler');
    const response = await handler(new Request('https://example.invalid/feedback-job', {
      method: 'POST', headers: { Authorization: 'Bearer isolated-test-token' },
    }));
    const body = await response.json();
    expect(response.status).toBe(200);
    return body;
  }

  return { run, claims, claimAttempts, emailLog, tickets, sendTemplateEmail };
}

describe('feedback email job — actual handler and shared attempt logger', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('does not send or claim before seven complete days', async () => {
    const job = fixture(7 - 1 / DAY);
    expect(await job.run()).toEqual({ success: true, sent: 0, skipped: 0 });
    expect(job.sendTemplateEmail).not.toHaveBeenCalled();
    expect(job.claimAttempts).toEqual([]);
    expect(job.emailLog).toEqual([]);
  });

  it('sends at seven days and records the sent attempt and duplicate-prevention claim', async () => {
    const job = fixture(7);
    expect(await job.run()).toEqual({ success: true, sent: 1, skipped: 0 });
    expect(job.sendTemplateEmail).toHaveBeenCalledExactlyOnceWith('feedback-request', EMAIL, {
      idempotencyKey: `feedback-7d-${USER_ID}`,
      replyTo: 'statematch@statematch.global',
      templateData: { firstName: 'Ana', appUrl: 'https://orca-mento.app' },
    });
    expect(job.claims.has(USER_ID)).toBe(true);
    expect(job.emailLog).toEqual([{
      message_id: null, template_name: 'feedback-request', recipient_email: EMAIL,
      status: 'sent', error_message: null,
    }]);
  });

  it('does not send again when the daily job runs a second time', async () => {
    const job = fixture();
    await job.run();
    expect(await job.run()).toEqual({ success: true, sent: 0, skipped: 1 });
    expect(job.claimAttempts).toEqual([USER_ID, USER_ID]);
    expect(job.sendTemplateEmail).toHaveBeenCalledTimes(1);
    expect(job.emailLog).toHaveLength(1);
  });

  it('allows only one send when two job runs claim the same user concurrently', async () => {
    const job = fixture();
    const results = await Promise.all([job.run(), job.run()]);
    expect(results.map(result => result.sent).sort()).toEqual([0, 1]);
    expect(job.sendTemplateEmail).toHaveBeenCalledTimes(1);
    expect(job.emailLog).toHaveLength(1);
    expect(job.claims.size).toBe(1);
  });

  it('records a failed attempt, releases its claim, and logs a successful retry without a third send', async () => {
    const job = fixture();
    job.sendTemplateEmail.mockRejectedValueOnce(new Error('Temporary delivery failure'));
    expect(await job.run()).toEqual({ success: true, sent: 0, skipped: 1 });
    expect(job.claims.has(USER_ID)).toBe(false);
    expect(job.emailLog[0]).toMatchObject({
      recipient_email: EMAIL, template_name: 'feedback-request',
      status: 'failed', error_message: 'Temporary delivery failure',
    });
    expect(await job.run()).toEqual({ success: true, sent: 1, skipped: 0 });
    expect(job.claims.has(USER_ID)).toBe(true);
    expect(job.emailLog.map(row => row.status)).toEqual(['failed', 'sent']);
    expect(await job.run()).toEqual({ success: true, sent: 0, skipped: 1 });
    expect(job.sendTemplateEmail).toHaveBeenCalledTimes(2);
    expect(job.sendTemplateEmail.mock.calls.map(call => call[2].idempotencyKey))
      .toEqual([`feedback-7d-${USER_ID}`, `feedback-7d-${USER_ID}`]);
  });

  it('does not request feedback again from someone who already submitted it', async () => {
    const job = fixture();
    job.tickets.push({ id: 'existing-feedback', user_id: USER_ID, category: 'feedback' });
    expect(await job.run()).toEqual({ success: true, sent: 0, skipped: 1 });
    expect(job.sendTemplateEmail).not.toHaveBeenCalled();
    expect(job.emailLog).toEqual([]);
  });
});