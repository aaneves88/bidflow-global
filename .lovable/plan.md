# Sprint de evolução — CloseFlow

Vamos avançar com 7 frentes priorizadas. Tudo respeitando o estilo enxuto do app e os tokens do design system.

## 1. Ajuste de bugs na Configurações
Hoje a aba Configurações às vezes não salva (problema reportado anteriormente). Vou:
- Revalidar `useAppSettings.upsert` (conflito em `key`, RLS de admin vs user).
- Garantir que campos vazios não sobrescrevam outras categorias.
- Mostrar feedback de erro real (toast com mensagem do Postgres).
- Confirmar que `BrandingTab`, `GeneralTab` e `IntegrationsTab` recarregam após salvar (invalidação de cache).

## 2. Páginas legais
Criar páginas públicas (sem auth):
- `/legal/terms` — Termos de Uso
- `/legal/privacy` — Política de Privacidade
- `/legal/cookies` — Aviso de cookies (curto)

Conteúdo em pt-BR + en, com placeholders editáveis em `app_settings` (`legal_company_name`, `legal_contact_email`) para o admin personalizar sem mexer em código. Links no rodapé do Landing, Login, Register e na proposta pública.

## 3. Assinatura digital na proposta
No `PublicProposal`, ao clicar "Aceitar":
- Modal pedindo **nome completo** + **checkbox** "Li e concordo com os termos".
- Captura: nome, email (se houver no cliente), IP (via edge function), user agent, timestamp.
- Renderiza assinatura tipográfica (fonte cursiva) sobre uma linha.
- Persistir em nova tabela `proposal_signatures` (proposal_id, signer_name, signer_email, ip, user_agent, signed_at).
- Mostrar bloco "Assinada por X em DD/MM/YYYY" no PublicProposal e no PDF.
- Trigger continua chamando `accept_proposal(code)` para mudar status.

## 4. Duplicar proposta
- Botão "Duplicar" no `ProposalView` e no menu da linha em `Proposals`.
- Cria nova proposta copiando: cliente, título, descrição, itens, validade (recalculada), moeda, branding.
- Reset: status volta para o inicial, `public_code` novo, `closed_at/closed_amount` nulos, `accepted_at` nulo.
- Respeita o limite freemium (`canCreateProposal`).

## 5. Notificação de proposta vista
- Já existe `proposal_views`. Vou:
  - Criar hook `useUnseenViews` que detecta views novas desde o último `last_seen_at` (em `profiles` ou localStorage por proposta).
  - Badge no sidebar "Propostas" com contador de propostas com novas visualizações.
  - Toast/notificação no Dashboard: "Cliente X visualizou sua proposta agora".
  - Email opcional via Lovable Cloud (apenas se domínio de email configurado — caso contrário, só in-app).

## 6. Métricas avançadas no Dashboard
Hoje o dashboard tem KPIs básicos. Vou adicionar:
- **Taxa de conversão** (propostas ganhas / enviadas).
- **Ticket médio** (closed_amount médio).
- **Tempo médio até fechar** (created_at → closed_at).
- **Funil** (count por status, barras horizontais).
- **Evolução mensal** (line chart de propostas criadas vs ganhas — usando Recharts já instalado).
- Filtro de período (7d / 30d / 90d / ano).

## 7. Onboarding melhor
Hoje o `Onboarding.tsx` tem 3 passos básicos. Vou redesenhar:
- Step 1: Boas-vindas com nome do usuário + escolha de "Como você cobra?" (por hora / por projeto / mensalidade) — guarda como dica.
- Step 2: Dados do negócio (nome + logo + cor primária) — alimenta branding direto.
- Step 3: Primeiro cliente (opcional, pula fácil).
- Step 4: Tour rápido (3 cards) explicando: criar proposta → compartilhar link → acompanhar status.
- Progress bar visual, animações sutis, ilustrações simples (ícones lucide grandes).
- Skip global em qualquer momento.

## Ordem de execução
1. Migrations (assinatura digital, app_settings legais).
2. Fix bugs configurações.
3. Páginas legais + links rodapé.
4. Duplicar proposta.
5. Assinatura digital.
6. Notificação de visualização.
7. Dashboard com métricas.
8. Onboarding redesenhado.
9. Atualizar roadmap markdown no admin + QA checklist + i18n pt-BR/en.

## Detalhes técnicos
- Nova tabela `proposal_signatures` com RLS (owner pode ver, público pode insert via RPC `sign_proposal(code, name, email)`).
- Edge function `capture-signature` para registrar IP/user-agent (não exposto ao client).
- Hook `useDashboardMetrics` centraliza queries agregadas.
- Componentes novos: `LegalPage`, `SignatureDialog`, `DuplicateProposalButton`, `MetricsCards`, `ConversionFunnel`, `OnboardingV2` (substitui).
- Sem mudanças no AuthContext ou na estrutura de roles.

Posso começar pela ordem listada — me confirma se quer ajustar algo (priorizar, remover frente, etc) ou se já posso executar tudo.