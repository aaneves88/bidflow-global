# Login com Google no celular: sessão nunca é gravada

## O que o diagnóstico mostrou

Os logs de autenticação confirmam que **o Google autenticou as duas contas com sucesso** hoje às 14:20 (`aaneves88@gmail.com` e `nvs.antonio5@gmail.com`, provider `google`, status 200). Ou seja: não é senha, não é conflito de conta, não é vinculação. O problema está no retorno para o app.

Lendo o SDK de autenticação (`@lovable.dev/cloud-auth-js`) e o código:

- No navegador do celular (fora do preview em iframe), o SDK **não abre popup**: ele faz um redirect de página inteira para o broker e retorna `{ redirected: true }`. O `GoogleSignInButton` simplesmente encerra nesse ponto.
- Nesse modo, os tokens (`access_token` / `refresh_token`) voltam **na URL de retorno** (`window.location.origin`). O SDK **não tem nenhum handler de callback** — quem tem que ler esses tokens e chamar `supabase.auth.setSession` é o app.
- **Nenhum lugar do app faz isso.** Pior: em mobile a Landing (`src/pages/Landing.tsx`) redireciona imediatamente para `/app` com `replace`, descartando os parâmetros da URL antes de qualquer leitura.

Resultado exato do relato: a tela pisca, volta pro login, sem erro nenhum — porque não houve erro; a sessão só nunca foi gravada. No desktop/preview funciona porque lá o fluxo é por popup e o `setSession` acontece dentro do `signInWithOAuth`.

## Correção

1. **Rota pública de callback `/auth/callback`**
   - Nova página que lê `access_token` / `refresh_token` (tanto da query quanto do hash), chama `supabase.auth.setSession`, limpa a URL e redireciona para `/dashboard` (ou para o destino guardado).
   - Se vier `error` / `error_description`, mostra o aviso já existente (`useOAuthErrorNotice`) e volta para o login.

2. **Apontar o `redirect_uri` para essa rota**
   - `GoogleSignInButton` passa `redirect_uri: ${window.location.origin}/auth/callback` — URL pública, same-origin, nunca rota protegida.
   - O caminho de destino pretendido (ex.: `next`) fica guardado em `sessionStorage`, aplicado só depois da sessão hidratada.

3. **Consumo dos tokens antes de qualquer redirect**
   - Rede de segurança para retornos que ainda caiam em `/`: consumir tokens/erro da URL no boot do app, antes do redirect mobile da Landing, para nunca mais perder os parâmetros.

4. **Documentação**
   - Atualizar `docs/AUTH.md` com o modo redirect vs. popup, a rota de callback e o novo checklist; registrar em `docs/BUGFIXES.md`.

## Detalhes técnicos

- Arquivos: novo `src/pages/auth/AuthCallback.tsx`, novo helper `src/lib/oauthCallback.ts`, edições em `src/App.tsx` (rota), `src/components/GoogleSignInButton.tsx`, `src/pages/Landing.tsx`, `src/lib/oauthError.ts` (leitura de hash já existe), traduções `auth.json` (pt-BR/en), `docs/AUTH.md`, `docs/BUGFIXES.md`.
- Sem mudanças de banco, de edge functions ou em `src/integrations/lovable/`.
- Validação: `tsc --noEmit` e teste real do fluxo no navegador mobile.
