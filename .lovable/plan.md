# Sprint de Lançamento — CloseFlow

Plano focado nos **5 itens críticos** para tornar o app vendável. Os outros 5 (emails, recuperação de senha, landing, billing fim-a-fim, legal) ficam para o sprint seguinte.

Ordem de execução é importante: cada passo destrava o próximo.

---

## 1. Fix Configurações (Settings travado)

**Problema:** página `/settings` não salva nada.

**Causa provável:** mesmo padrão do bug de login — `useAppSettings` faz query no Supabase que pode estar bloqueada por RLS ou retornando vazio sem feedback. Vou:
- Inspecionar policies da tabela `app_settings` (hoje só admin pode escrever?)
- Validar que o usuário admin consegue dar `upsert`
- Adicionar tratamento de erro visível no toast (hoje engole o erro)
- Verificar que `getSetting` retorna o valor após salvar (invalidação de cache)

**Entregável:** as 3 abas (Geral, Integrações, Marca) salvam e relêem corretamente.

---

## 2. Branding aplicado de verdade (cores + logo)

Hoje os campos existem mas **não são usados em lugar nenhum**.

**Mudanças no schema (`app_settings`):**
- Adicionar chaves: `secondary_color`, `accent_color` (mantém `primary_color` e `logo_url` existentes)

**Mudanças no app:**
- Criar hook `useBranding()` que lê as cores e injeta como CSS variables (`--brand-primary`, `--brand-secondary`, `--brand-accent`) no `:root` via `<style>` dinâmico no `AppLayout`
- Aba "Marca" em Settings ganha 3 color pickers + preview ao vivo
- Logo aparece no `AppSidebar` (substituindo/complementando o nome)

**Mudanças na proposta pública e PDF (onde o branding importa de verdade):**
- `PublicProposal.tsx`: barra colorida no topo (primary), logo da empresa à esquerda, total destacado com cor accent, botão "Aceitar" com primary
- `proposalPdf.ts`: header com faixa colorida + logo, total com cor primary, rodapé com cor secondary

---

## 3. Cadastro de cliente mais completo

**Migration:** adicionar à tabela `clients`:
- `logo_url` (text)
- `tax_id` (text) — CPF/CNPJ/EIN genérico
- `address_line` (text)
- `city`, `state`, `postal_code`, `country` (text)
- `notes` (text) — observações internas

**UI (`ClientDialog.tsx`):**
- Reorganizar em seções: "Identificação" / "Contato" / "Endereço" / "Notas"
- Upload de logo (usa o bucket criado no passo 4)
- Mostrar logo na lista de clientes (`Clients.tsx`) e no header da proposta

**i18n:** novas chaves em `clients.json` (pt-BR e en).

---

## 4. Storage para logos

**Bucket único `branding`** (público) para:
- Logo da empresa (`company/logo.{ext}`)
- Logo de clientes (`clients/{client_id}/logo.{ext}`)

**RLS em `storage.objects`:**
- SELECT público (logos precisam aparecer em propostas públicas)
- INSERT/UPDATE/DELETE: apenas usuários autenticados, e para `clients/{client_id}/*` validar via subquery que o client pertence ao user

**Componente reutilizável:** `<LogoUpload value={url} onChange={...} folder="company" />` usado em Settings e ClientDialog.

---

## 5. Conceito de "valor fechado" (deal finalizado)

**Migration em `proposals`:**
- `closed_amount` numeric — valor real fechado (pode diferir do `total_amount`)
- `closed_at` timestamptz — quando foi marcado como final
- `closed_notes` text — observação opcional (ex: "10% desconto negociado")

**Trigger:** quando `status_id` muda para um status `is_final=true` e `is_won=true` (nova coluna em `proposal_statuses` para distinguir aprovado vs rejeitado), preencher `closed_at = now()` e `closed_amount = total_amount` por padrão.

**UI:**
- Em `ProposalView.tsx`, ao mover manualmente para "Aprovada", abrir dialog: "Valor fechado: [R$ X] Observação: [...]"
- Aceitação via link público continua usando `total_amount` (cliente aceita o que viu)

**Dashboard:**
- KPI "Receita aprovada" passa a somar `closed_amount` (não `total_amount`) das propostas finais ganhas
- Conversão = propostas ganhas / propostas enviadas (já existe, mas garantir que usa o flag `is_won`)

---

## Ordem de implementação (1 entregável por vez)

```text
1. Fix Settings           → destrava todo o resto (precisamos salvar branding)
2. Storage bucket         → destrava upload de logos
3. Branding aplicado      → vitrine do produto
4. Cliente completo       → completa o cadastro
5. Valor fechado          → fecha o ciclo comercial
```

---

## Fora deste sprint (próximo)

- Recuperação de senha + verificação de email
- Emails transacionais (proposta visualizada/aceita)
- Landing page comercial + pricing público
- Customer portal Stripe + enforcement de limites de plano
- Páginas legais (Privacidade, Termos) + consentimento LGPD

---

## Detalhes técnicos

- **Migrations:** 3 no total (clients, proposals, proposal_statuses com `is_won` + nova chave em app_settings se preciso)
- **Bucket:** 1 (`branding`, público) via `storage_create_bucket`
- **i18n:** atualizar `clients.json`, `settings.json`, `proposals.json` em pt-BR + en
- **Nenhum breaking change** em dados existentes — todos os novos campos são nullable
- **Sem novas dependências** — usa shadcn, jsPDF e Supabase Storage já presentes

Pronto para começar pelo passo 1 (fix Settings) assim que aprovar.

