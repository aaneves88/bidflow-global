# 3 vídeos de orientação + aba "Vídeos" no Admin

## O que será entregue
Três vídeos curtos animados (estilo do tutorial já feito: verticais 9:16, ~20–30s, marca Orca, música, sem narração, legendas em pt-BR):
1. **Criar cliente**: abrir Clientes, "+ Novo cliente", preencher nome/contato, salvar.
2. **Criar proposta**: "Criar proposta", escolher/criar cliente pelo seletor, adicionar itens, salvar, cair na tela de compartilhar.
3. **Gerenciar proposta**: copiar link / WhatsApp / e-mail, acompanhar visualização, mudar status (Enviada, Aceita), quadro Kanban.

Os vídeos ficam em Arquivos (`videos/`) e aparecem no app.

## Aba nova no Admin
- Nova aba **"Vídeos"** ao lado de Marketing e Marca (onde já ficam os materiais).
- Cada vídeo aparece num cartão com player, título, descrição curta, duração e botão **Baixar**.
- A lista fica num único lugar no código, então dá pra liberar esses vídeos para os usuários mais tarde.
- Textos em pt-BR e en.

## Detalhes técnicos
- Gerar com o fluxo de animação (sub-agente animate_video), uma chamada por vídeo, usando prints em `public/marketing/` e marca em `src/assets/brand/`; saída em `/mnt/documents/videos/`.
- Registrar cada MP4 com `lovable-assets` → `src/assets/videos/*.mp4.asset.json` (nada de MP4 no repositório).
- `src/pages/admin/AdminVideos.tsx` + `src/content/tutorialVideos.ts` (lista); aba `videos` em `Admin.tsx`; chaves i18n em `admin.json`.
- Download via fetch → blob, igual ao padrão de `AdminMarketing.tsx`.
