// Sends a registered app email and records the outcome in email_send_log
// (same status strings the app has always stored: sent / suppressed / failed).
// The log row never decides the send result.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './transactional-email-templates/send-email.ts'

export async function sendAppEmail(
  admin: SupabaseClient,
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const log = async (status: 'sent' | 'suppressed' | 'failed', error_message?: string) => {
    const { error } = await admin.from('email_send_log').insert({
      message_id: null,
      template_name: templateName,
      recipient_email: to,
      status,
      error_message: error_message ?? null,
    })
    if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }

  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await log(result.sent ? 'sent' : 'suppressed')
    return result
  } catch (err) {
    await log('failed', err instanceof Error ? err.message : String(err))
    throw err
  }
}
