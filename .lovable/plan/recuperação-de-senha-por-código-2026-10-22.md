# Recuperação de senha por código

## Como está hoje
- O e-mail "Redefinir sua senha" com a marca Orca existe, mas o app não tem "Esqueci minha senha" nem tela para criar a nova senha. Quem esquece fica travado.

## Como vai funcionar
1. Link "Esqueci minha senha" em /login e /app.
2. Tela /esqueci-senha, passo 1: a pessoa digita o e-mail. Mensagem sempre igual ("se o e-mail tiver conta, enviamos um código"), para não revelar quem é cadastrado.
3. Ela recebe um e-mail da Orca com um **código de 6 dígitos** (sem link para clicar).
4. Passo 2, na mesma tela: digita o código + nova senha + confirmação (mínimo 6 caracteres). Troca na hora e já entra no Painel.
5. Botão "Reenviar código" (com espera de 60s) e aviso claro se o código estiver errado ou vencido (vale 1 hora).
6. Em Minha conta: "Alterar senha" para quem já está logado (pede a senha atual).
7. Textos em português e inglês.
8. Teste completo: pedir código, digitar, trocar senha, entrar com a nova.

## Por que assim
- Tudo acontece dentro do Orca; não depende de clicar em link (que às vezes abre no navegador errado do celular ou é bloqueado pelo app de e-mail).
- Usa o mesmo sistema de login que já guarda as senhas com segurança — não vou criar um armazenamento de senhas próprio, porque isso seria menos seguro.

## Detalhes técnicos
- `supabase.auth.resetPasswordForEmail(email)` dispara o hook `auth-email-hook`; o template `recovery.tsx` passa a mostrar o `token` (código) em destaque em vez do botão.
- Validação: `supabase.auth.verifyOtp({ email, token, type: 'recovery' })` e em seguida `supabase.auth.updateUser({ password })`.
- Logado: `updateUser({ password, current_password })`.
- Garantir login por e-mail habilitado; redeploy de `auth-email-hook`; i18n em `auth.json`; atualizar `docs/AUTH.md` e `roadmap.md`.
