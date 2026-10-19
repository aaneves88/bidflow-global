# Biblioteca de vídeos educativos + vídeo de parceiros

## Vídeos (motion graphics, verticais 9:16, ~30–45s, pt-BR com legendas e música, sem narração)
Educativos, que vão além do sistema e terminam com uma chamada leve para o Orca:
1. **Como abordar um cliente**: primeiro contato, ouvir a necessidade, passar confiança.
2. **Enviar e cobrar a proposta**: quando enviar, como acompanhar, como cobrar a resposta sem ser chato.
3. **Precificação**: custo + tempo + margem = preço justo, com um exemplo simples.
4. **Dicas para MEI**: limite de faturamento, emissão de nota, organizar as propostas.
5. **Dicas para empresas no Simples**: imposto sobre o preço, margem, formalidade na proposta.

Propaganda:
6. **Seja nosso parceiro**: indique o Orca e ofereça **10% de desconto** com cupom exclusivo para seus clientes. Os cupons reais continuam sendo criados na aba Parceiros.

As dicas fiscais (MEI/Simples) ficam genéricas, sem prometer números exatos de imposto, e com o aviso "consulte seu contador".

## Aba Vídeos
- A aba ganha seções: **Tutoriais do app** (os 3 atuais), **Educativos** e **Parceiros**.
- Cada vídeo continua com player e botão Baixar, e todos ficam numa lista única para depois linkar em outras partes do site/app.
- Textos em pt-BR e en.

## Detalhes técnicos
- Um sub-agente animate_video por vídeo, em paralelo; saída `/mnt/documents/videos/`; marca em `src/assets/brand/`.
- Registrar cada MP4 com `lovable-assets` em `src/assets/videos/*.mp4.asset.json`.
- `src/content/tutorialVideos.ts` ganha o campo `category`; `AdminVideos.tsx` agrupa por categoria; novas chaves i18n em `admin.json`.
- Salvar na memória: cupom de parceiro anunciado = 10%.
