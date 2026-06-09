## Onda 1.5 — PDF híbrido (canvas + texto)

Problemas no PDF atual (confirmados pelo upload):
- Título "Consultoria (cópia)" sobrepõe "Statematch Global" no topo
- Cabeçalho da tabela com letras espaçadas ("D escrição", "Q td", "V a l o r u n i t.")
- "Total geral" sai como texto verde corrido em vez da caixa accent prevista
- Sem bloco do cliente, sem "Powered by Orca" visível, página vazia abaixo da tabela

### Abordagem escolhida: híbrido

**Hero/cabeçalho via html2canvas** (logo grande, nome da empresa, título, status, validade, bloco cliente, total destacado) — fica visualmente idêntico à página pública, com a marca do usuário aplicada.

**Tabela + descrição + notas + termos em texto nativo jsPDF** — selecionável, copiável, pesquisável, leve.

### Implementação

1. Criar `src/components/pdf/PdfHero.tsx` — componente React off-screen renderizado num portal invisível (posição absoluta, -9999px), com:
   - Faixa superior na cor primária da marca
   - Logo grande + nome da empresa (ou logo Orca + "Orca" para free)
   - Título da proposta, status, validade, data
   - Card do cliente (nome, empresa, email, telefone)
   - Card "Total" destacado com a cor accent
   - Para free: faixa "Criada com Orca" no topo em vez do logo do cliente

2. Reescrever `src/lib/proposalPdf.ts`:
   - Receber `heroElement: HTMLElement` (renderizado pelo chamador)
   - `html2canvas(heroElement, { scale: 2, useCORS: true, backgroundColor: '#fff' })`
   - `addImage` do hero no topo
   - Continuar com `autoTable` para itens — corrigir kerning forçando `font: 'helvetica'` no `styles` (o espaçamento estranho vem de fallback para fonte sem métricas)
   - Caixa de total nativa (corrigir o bug de medida) ou pular pois já está no hero
   - Descrição/Notas/Termos com `splitTextToSize` + paginação que já existe
   - Watermark "Orca" diagonal no free continua igual
   - Rodapé "Feito com Orca" pequeno em todas as páginas (não-Business)

3. Atualizar `ProposalView.tsx` e `PublicProposal.tsx`:
   - Renderizar `<PdfHero ref={...} />` invisível
   - Passar o ref ao gerador
   - Aguardar logo carregar antes de capturar (`img.decode()`)

### Por que não jsPDF puro
A caixa accent e o cabeçalho ficam frágeis em jsPDF (já quebraram). Canvas para o hero garante fidelidade visual à marca; texto nativo na tabela mantém PDF leve e selecionável onde importa.

---

## Onda 2 — Auditoria de Segurança

Entregue como **relatório em chat** + correções aplicadas onde for crítico.

### 2.1 Banco — RLS e GRANTs
- Rodar `supabase--linter` e anexar resultado
- Para cada tabela (`app_settings`, `clients`, `plans`, `profiles`, `proposal_items`, `proposal_signatures`, `proposal_status_history`, `proposal_statuses`, `proposal_views`, `proposals`, `user_plans`, `user_roles`):
  - Listar políticas via `supabase--read_query`
  - Verificar: RLS habilitado, GRANT correto por role, sem `anon` desnecessário
  - Risco especial: `get_proposal_branding` expõe email/telefone? (não — só branding, OK). `proposal_views` permite tracking anônimo? (esperado)
- SECURITY DEFINER: revisar `handle_new_user`, `accept_proposal`, `sign_proposal`, `get_proposal_branding`, `get_proposal_signature`, `has_role` — confirmar `search_path = public` (já estão) e que não vazam dados

### 2.2 Edge functions
- `stripe-webhook` (`verify_jwt = false`): confirmar validação de assinatura via `STRIPE_WEBHOOK_SECRET`, CORS, sem retorno de dados sensíveis em erro
- `stripe-create-checkout`: validar JWT do usuário, validar `price_id` contra tabela `plans` (não confiar no client), CORS

### 2.3 Auth hardening
- Ativar **HIBP** (senhas vazadas) via `supabase--configure_auth`
- Confirmar `external_anonymous_users_enabled = false`
- Confirmar `auto_confirm_email` conforme intenção (hoje provavelmente true para facilitar onboarding — decidir)
- Documentar política de senha atual

### 2.4 Storage e dados sensíveis
- Sem buckets hoje → quando subir upload de logo, criar bucket `branding` público com path por user_id e policy de write restrita ao dono
- Revisar RPCs que retornam dados de outros usuários (só `get_proposal_branding` e `get_proposal_signature` — ambos limitados ao mínimo necessário, OK)
- Verificar que `clients.email` / `clients.phone` nunca vazam em RPCs públicas

### 2.5 Entregáveis
- Tabela "Achados" com severidade (crítico / médio / baixo / informativo)
- Correções aplicadas em migration única para findings críticos
- Atualização da `security--update_memory` com postura aceita
- Lista do que ficou em aberto para você decidir

---

## Ordem de execução
1. PDF híbrido (Onda 1.5) — você vê resultado visual rápido
2. Auditoria Onda 2 — relatório + correções críticas em uma migration

## Fora de escopo nesta rodada
- Onda 3 (emails transacionais) e Onda 4 (admin de verdade) — próximas iterações
