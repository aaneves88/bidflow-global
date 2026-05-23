# Plano: Vídeo demo CloseFlow (~90s)

Demo de produto estilo SaaS moderno (Linear/Vercel), renderizado via Remotion como MP4 1080p/30fps, sem áudio, com legendas em pt-BR e UI reproduzida em código (mockups fiéis ao produto real).

## Estilo visual

- Paleta: fundo grafite quase preto (`#0B0D10`), superfície (`#14171C`), primário azul CloseFlow (`#3B82F6`), accent verde sucesso (`#22C55E`), texto cremoso (`#F5F5F4`).
- Tipografia: Inter (UI) + Space Grotesk (display) via `@remotion/google-fonts`.
- Motion system: entrada padrão = blur-to-sharp + leve translate Y (spring damping 20). Accent = scale-up com overshoot. Transições entre cenas = wipe direcional + crossfade curto.
- Mockups das telas reconstruídos em JSX/Tailwind imitando o design real (sidebar, cards de KPI, tabelas, dialog de proposta, página pública). Ponteiro do mouse animado para indicar interação.

## Roteiro (9 cenas, ~90s total @ 30fps = 2700 frames)

| # | Cena | Frames | Legenda pt-BR |
|---|------|--------|---------------|
| 1 | Hook — caos: WhatsApp + Word + planilha flutuando, riscados | 180 (6s) | "Propostas perdidas no WhatsApp, Word, planilhas..." |
| 2 | Logo CloseFlow + tagline | 120 (4s) | "CloseFlow — CRM de propostas para pequenos negócios" |
| 3 | Dashboard: KPIs animando (pipeline, receita, conversão) + lista recente | 360 (12s) | "Acompanhe seu funil em tempo real" |
| 4 | Clientes: lista → dialog "Novo cliente" preenchendo | 240 (8s) | "Cadastre clientes em segundos" |
| 5 | Nova proposta: form, itens sendo adicionados, total calculando | 360 (12s) | "Crie propostas com cálculo automático" |
| 6 | Compartilhamento: link copiado → WhatsApp → PDF | 270 (9s) | "Envie por link, WhatsApp ou PDF" |
| 7 | Página pública: cliente clica "Aceitar proposta", check verde | 240 (8s) | "Seu cliente aceita com um clique" |
| 8 | Dashboard atualizando: receita sobe, conversão sobe (counter animado) | 240 (8s) | "Resultados visíveis na hora" |
| 9 | CTA final: logo + tagline EN | 210 (7s) | "Create proposals. Track deals. Close more business." |

Transições entre cenas (~15 frames cada) sobrepostas — duração final ajustada para ~90s.

## Estrutura do projeto

```
remotion/
  src/
    index.ts
    Root.tsx
    MainVideo.tsx
    scenes/
      01_Hook.tsx
      02_Intro.tsx
      03_Dashboard.tsx
      04_Clients.tsx
      05_NewProposal.tsx
      06_Share.tsx
      07_Accept.tsx
      08_DashboardUpdate.tsx
      09_CTA.tsx
    components/
      AppFrame.tsx        # sidebar + topbar reutilizável
      Cursor.tsx          # ponteiro animado
      KpiCard.tsx
      Caption.tsx         # legenda inferior
  scripts/render-remotion.mjs
  public/
```

## Execução

1. Scaffold `remotion/` + bun install + fix do compositor (musl→gnu) + symlink ffmpeg/ffprobe.
2. Carregar Inter e Space Grotesk via `@remotion/google-fonts`.
3. Construir componentes base (`AppFrame`, `Cursor`, `KpiCard`, `Caption`).
4. Implementar 9 cenas com mockups fiéis ao CloseFlow (sidebar com itens em pt-BR: Dashboard, Clientes, Propostas, Configurações).
5. Encadear via `<TransitionSeries>` com wipe + fade.
6. Spot-check de frames-chave com `remotion still`.
7. Render final via `scripts/render-remotion.mjs` (chrome-for-testing, muted, concurrency 1) → `/mnt/documents/closeflow-demo.mp4`.
8. QA: extrair 6-8 frames distribuídos e revisar (overflow, contraste, alinhamento). Iterar até limpo.

## Entregável

`/mnt/documents/closeflow-demo.mp4` (~90s, 1920×1080, H.264, mudo) pronto para o sweepstake e reuso comercial. Tag `<presentation-artifact>` no final.
