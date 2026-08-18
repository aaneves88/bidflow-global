# Autenticação da Orca

Referência para humanos e agentes (Claude/Lovable). Atualizado em 2026-08-18.

## Provedores

- **E-mail + senha** — cadastro passa pela edge function `signup-guarded` (rate limit de 3 contas/24h por IP). Mínimo de 6 caracteres. A proteção HIBP (senha vazada) está **desativada** de propósito: barrava cadastros reais.
- **Google** — via `lovable.auth.signInWithOAuth('google', ...)` (Lovable Cloud managed OAuth).

## Regras invioláveis

- Nunca editar `src/integrations/lovable/` nem `src/integrations/supabase/client.ts` (arquivos gerados).
- Nunca usar `supabase.auth.signInWithOAuth` direto — sempre `lovable.auth.signInWithOAuth`.
- `redirect_uri` sempre uma URL pública same-origin (`window.location.origin`). Nunca uma rota protegida (`/dashboard`, `/onboarding`), porque o redirect acontece antes da sessão ser gravada.

## Vinculação de contas (conta criada com senha e depois login com Google)

Comportamento confirmado no banco em 2026-08-18: quando o e-mail da conta já existe e está **confirmado**, o Supabase vincula a identidade Google ao mesmo usuário (existe usuário com `providers = ["email","google"]`). Não são criadas duas contas.

Quando a vinculação **não** acontece (e-mail não confirmado, ou linking manual exigido), o provedor devolve erro na URL de retorno e o usuário deve entrar com e-mail e senha.

## Dois modos do SDK (essencial)

`@lovable.dev/cloud-auth-js` se comporta de forma diferente conforme o contexto:

- **Dentro de iframe (preview do Lovable / desktop):** abre popup, recebe os tokens por `web_message` e o wrapper chama `supabase.auth.setSession` sozinho. `signInWithOAuth` devolve `{ tokens }`.
- **Fora de iframe (navegador do celular, app publicado):** faz `window.location.href = /~oauth/initiate?...` e devolve `{ redirected: true }`. **Não existe handler de callback no SDK** — os tokens voltam na URL de retorno e o app é que precisa lê-los e chamar `setSession`. Foi exatamente isso que faltava e causava "carrega e volta pro login" no celular (corrigido em 2026-08-18).

## Fluxo de retorno do OAuth

1. Usuário clica em "Continuar com Google" (`src/components/GoogleSignInButton.tsx`). O destino pretendido vai para `sessionStorage` (`rememberOAuthNext`), nunca para a URL do provedor.
2. `redirect_uri` = `${window.location.origin}/auth/callback` (rota pública, `src/pages/auth/AuthCallback.tsx`).
3. O callback lê `access_token` / `refresh_token` da query **e** do hash (`src/lib/oauthCallback.ts`), chama `supabase.auth.setSession`, limpa a URL e só então navega para `takeOAuthNext()` (padrão `/dashboard`).
4. Rede de segurança: se o retorno cair em `/`, a Landing detecta (`hasOAuthReturn`) e reenvia os parâmetros para `/auth/callback` **antes** do redirect mobile para `/app` — senão os tokens seriam descartados.
5. `AuthContext` hidrata a sessão. O evento `INITIAL_SESSION` grava **sessão e usuário** — se gravar só a sessão, a tela de entrada acha que ninguém está logado e volta pro login.
6. Se veio erro na URL, o callback (e `useOAuthErrorNotice` nas telas de login) lê `error` / `error_code` / `error_description` da query e do hash, mostra toast e limpa a URL (`src/lib/oauthError.ts`).

Mensagens tratadas (namespace i18n `auth.oauth`):

| Situação | Chave |
| --- | --- |
| E-mail já cadastrado com senha / linking manual | `oauth.identityConflict` |
| Usuário cancelou no Google | `oauth.cancelled` |
| Qualquer outro erro | `oauth.generic` (ou a descrição do provedor) |
| Tela de espera do callback | `oauth.completing` |

O service worker (`public/sw.js`) já ignora `/~oauth` — não cachear esse caminho.

## Onde o botão do Google aparece

- `/app` — `src/pages/MobileEntry.tsx` (escondido no app nativo, que usa outro fluxo)
- `/login` — `src/pages/auth/Login.tsx`
- `/register` — `src/pages/auth/Register.tsx`

Todos usam o mesmo `GoogleSignInButton`. Ao adicionar uma nova tela de login, reaproveitar esse componente + `useOAuthErrorNotice`.

## Checklist de diagnóstico ("login com Google só carrega e volta")

1. Apareceu toast de erro? Se não, verificar se a tela chama `useOAuthErrorNotice`.
2. Conferir no banco: `select email, raw_app_meta_data->>'providers', email_confirmed_at from auth.users where email = '...'`.
3. Conferir `redirect_uri` — precisa ser rota pública.
4. Conferir se `AuthContext` está hidratando `user` no `INITIAL_SESSION`.
