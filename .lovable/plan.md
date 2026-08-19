# Páginas extras da proposta: Capa + "Por que eu"

Duas seções opcionais, ligadas por toggle na hora de montar a proposta. Nenhuma alonga o documento por padrão: se o dado não existe no perfil, o toggle nem aparece.

## 1. Campos novos — onde encaixar

**No perfil (`profiles`), aba Marca de `/settings`** — junto de `company_name`, `logo_url` e `tagline`, que a capa e o "Por que eu" já reaproveitam:

| Coluna | Tipo | Uso |
| --- | --- | --- |
| `photo_url` | text | Foto de rosto (não é o logo). Upload via `LogoUpload` já existente (base64, redimensionado, max ~200px) |
| `credential_note` | text | 1-2 linhas de credencial/certificação. Limite 120 caracteres |
| `trust_note` | text | Depoimento curto de cliente. Limite 200 caracteres |

Ficam num bloco próprio "Por que eu" dentro da aba Marca, abaixo do bloco de cores, com contador de caracteres. Como é conteúdo de prova social e não identidade visual, **não** fica sob o bloqueio `canBrand` — free também preenche e usa (o que free não tem é logo/cores próprias, que já é tratado hoje).

**Na proposta (`proposals`)** — dois booleans, default `false`:

| Coluna | Uso |
| --- | --- |
| `show_cover` | Renderiza a capa |
| `show_why_me` | Renderiza a seção "Por que eu" |

## 2. Conteúdo das seções

**Capa** (dados já existentes, nada novo): logo, nome da empresa, tagline, título da proposta, nome/empresa do cliente, data de emissão, validade se houver. Uma página, sem texto institucional.

**"Por que eu"**: foto (`photo_url`) + credencial (`credential_note`) + depoimento entre aspas (`trust_note`). Cada um é opcional — renderiza só o que estiver preenchido. Se os três estiverem vazios, o toggle fica escondido no formulário.

## 3. Onde aparece

- **`ProposalForm.tsx`**: bloco "Páginas extras" com dois switches, perto de Observações/Termos. Cada switch só aparece se houver dado para ele (capa exige `company_name` ou `logo_url`; "Por que eu" exige pelo menos um dos três campos novos). Texto de ajuda curto: proposta boa é curta, use só se ajudar a fechar.
- **`PublicProposal.tsx`**: capa como bloco de topo antes do cabeçalho atual; "Por que eu" como card discreto antes das Observações.
- **`proposalPdf.ts`**: capa como primeira página (canvas, seguindo o hero híbrido atual); "Por que eu" como bloco compacto antes de Observações, sem forçar quebra de página se couber.

## 4. Backend

- Migração: colunas novas em `profiles` e `proposals` (nullable / default false).
- `get_proposal_branding` ganha `photo_url`, `credential_note`, `trust_note` no retorno (mesma RPC segura já usada pelo link público); `get_public_proposal` ganha `show_cover` e `show_why_me`.
- `useBranding.ts` e `fetchPublicBranding` passam os campos novos adiante; `ORCA_BRANDING` recebe strings vazias para eles.

## 5. i18n

Chaves novas em `settings.json` (bloco "Por que eu") e `proposals.json` (`form.extraPages.*`, `view.whyMe.*`, `pdf.whyMe`) nos dois idiomas.
