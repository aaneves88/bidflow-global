# Diagnóstico e correção do login com Google

## O que o diagnóstico mostrou

Consultei os usuários reais e o código de autenticação:

- A **vinculação automática de contas funciona** no backend: existe um usuário com os dois provedores (`email` + `google`) no mesmo cadastro, e todos os usuários estão com e-mail confirmado. Ou seja, quem criou conta por e-mail/senha e depois entra com Google normalmente cai na mesma conta.
- O botão "Continuar com Google" **só existe na tela `/app`** (`src/pages/MobileEntry.tsx`). As telas `/login` e `/register` (usadas no desktop) não têm opção de Google.
- **Nenhum lugar do app lê o erro devolvido pelo provedor**. Depois do Google, o retorno cai em `/` (`redirect_uri: window.location.origin`); no mobile a Landing redireciona pra `/app`, e se veio erro na URL (`error`, `error_description`) ele é simplesmente ignorado — a pessoa vê a tela carregar e voltar pro login, sem nenhuma mensagem. É exatamente o sintoma relatado.
- No `AuthContext`, o evento `INITIAL_SESSION` só grava a sessão e **não grava o usuário**. Após o retorno do OAuth há uma corrida entre esse evento e o `getSession()`: dependendo da ordem, a tela de entrada continua achando que ninguém está logado e não redireciona pro dashboard.

Conclusão: não é "senha errada" nem conflito de conta — é falta de tratamento do retorno do OAuth (erro silencioso) somada a uma hidratação de sessão incompleta.

## O que vou corrigir

1. **Mostrar o erro do provedor em vez de voltar calado pro login**
   - Ler `error` / `error_description` da query e do hash da URL na volta do OAuth e exibir um toast/aviso claro em português, limpando os parâmetros da URL depois.
   - Mensagens amigáveis para os casos comuns: provedor cancelado, e-mail já cadastrado com senha, e erro genérico.

2. **Corrigir a hidratação da sessão no `AuthContext`**
   - No `INITIAL_SESSION`, gravar também `user` (e o id corrente) além da sessão, mantendo o comportamento atual de ignorar `TOKEN_REFRESHED`/`USER_UPDATED` para não reiniciar wizards.

3. **Aviso quando a conta já existe com senha**
   - Se o retorno indicar conflito de identidade, mostrar aviso explicando que a conta já foi criada com e-mail e senha e oferecendo entrar por senha (ou recuperar a senha), em vez de deixar a tela em branco.

4. **Google também no desktop**
   - Adicionar o mesmo botão "Continuar com Google" em `/login` e `/register`, reaproveitando a lógica de `MobileEntry`.

5. **Documentar pro Claude**
   - Novo arquivo `docs/AUTH.md` com: como funciona o login social hoje, o comportamento de vinculação de contas por e-mail, o fluxo de redirect, os erros tratados e as regras (nunca editar `src/integrations/lovable/`, `redirect_uri` sempre público).
   - Referência a esse doc no `CLAUDE.md` e registro da correção em `docs/BUGFIXES.md`.

## Detalhes técnicos

- Arquivos tocados: `src/contexts/AuthContext.tsx`, `src/pages/MobileEntry.tsx`, `src/pages/auth/Login.tsx`, `src/pages/auth/Register.tsx`, um helper novo para ler/limpar o erro do OAuth, traduções em `src/i18n/locales/pt-BR/auth.json` e `en/auth.json`, mais `docs/AUTH.md`, `docs/BUGFIXES.md` e `CLAUDE.md`.
- Sem mudanças de banco, sem mudanças em edge functions, sem alterar `src/integrations/lovable/`.
- Validação final com `tsc --noEmit`.
