import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import orcaMark from '@/assets/brand/orca-mark.png';

type State =
  | { kind: 'loading' }
  | { kind: 'confirm' }
  | { kind: 'already' }
  | { kind: 'invalid' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({ kind: 'invalid' });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
        );
        const data = await res.json();
        if (data.valid === true) setState({ kind: 'confirm' });
        else if (data.reason === 'already_unsubscribed') setState({ kind: 'already' });
        else setState({ kind: 'invalid' });
      } catch (e: any) {
        setState({ kind: 'error', message: e?.message || 'Erro inesperado' });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ token }),
        },
      );
      const data = await res.json();
      if (data.success) setState({ kind: 'success' });
      else if (data.reason === 'already_unsubscribed') setState({ kind: 'already' });
      else setState({ kind: 'error', message: data.error || 'Falha ao processar.' });
    } catch (e: any) {
      setState({ kind: 'error', message: e?.message || 'Erro inesperado' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={orcaMark} alt="Orca" className="h-12 w-auto object-contain mx-auto mb-2" />
          <CardTitle className="text-xl">Preferências de e-mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {state.kind === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Verificando link…</p>
            </div>
          )}
          {state.kind === 'confirm' && (
            <>
              <MailX className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Confirma que você quer parar de receber e-mails da Orca neste endereço?
              </p>
              <Button onClick={confirm} disabled={submitting} className="w-full">
                {submitting ? 'Processando…' : 'Confirmar cancelamento'}
              </Button>
            </>
          )}
          {state.kind === 'success' && (
            <>
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
              <p className="text-sm">
                Pronto. Você não vai mais receber e-mails da Orca neste endereço.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Voltar ao site</Link>
              </Button>
            </>
          )}
          {state.kind === 'already' && (
            <>
              <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Este e-mail já está descadastrado.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Voltar ao site</Link>
              </Button>
            </>
          )}
          {state.kind === 'invalid' && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">
                Link inválido ou expirado.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Voltar ao site</Link>
              </Button>
            </>
          )}
          {state.kind === 'error' && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm text-destructive">{state.message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
