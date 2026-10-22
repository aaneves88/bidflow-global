# Recuperação de senha

## Como está hoje
- O e-mail "Redefinir sua senha" com a marca Orca já existe e está pronto para sair.
- Mas não existe nenhum caminho no app para usá-lo: as telas de entrada (/login, /app) não têm "Esqueci minha senha", e não existe a tela para criar a nova senha.
- Resultado: quem esquece a senha fica travado (só entra se usar Google com o mesmo e-mail) ou precisa pedir ajuda.

## O que vou fazer
1. Link "Esqueci minha senha" em /login e /app (abaixo do campo de senha).
2. Tela /esqueci-senha: pessoa digita o e-mail e recebe o link. Mensagem sempre igual ("se o e-mail tiver conta, enviamos o link"), para não revelar quem é cadastrado.
3. Tela /redefinir-senha (aberta pelo link do e-mail): nova senha + confirmação (mínimo 6 caracteres, igual ao cadastro), depois leva ao Painel.
4. Em Minha conta: opção "Alterar senha" para quem já está logado.
5. Textos em português (e inglês), seguindo o padrão atual.
6. Teste completo: pedir o link, abrir, trocar a senha e entrar com a nova.

## Detalhes técnicos
- `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/redefinir-senha' })`; rota pública.
- `/redefinir-senha` aguarda evento `PASSWORD_RECOVERY`/sessão e chama `supabase.auth.updateUser({ password })`.
- Chaves i18n em `auth.json` (pt-BR/en); atualizar `docs/AUTH.md`.
