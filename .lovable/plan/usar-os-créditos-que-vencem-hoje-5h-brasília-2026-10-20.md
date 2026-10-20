# Usar os créditos que vencem hoje (~5h Brasília)

Ordem de prioridade. Se o tempo ou os créditos acabarem, o que vier por último fica para depois.

## 1. Corrigir a falha de e-mail (segurança)
- Hoje qualquer pessoa consegue usar o Orca para disparar e-mails transacionais para qualquer destinatário.
- Correção: só usuários logados (ou rotinas internas) disparam e-mails, e só para destinatários ligados à conta deles (o próprio e-mail ou o do cliente da proposta).
- Os fluxos atuais continuam funcionando: aviso "cliente abriu", boas-vindas, lembretes.
- Depois, rodar uma nova varredura de segurança.

## 2. Corrigir os criativos com erro
- `acompanhar_propostas_square_v2`: refazer a partir da versão aprovada, mantendo os dados da tela iguais aos originais.
- Vídeo "criar propostas": trocar a cena de aceite que sugere pagamento garantido por um status neutro ("Proposta enviada").
- As versões corrigidas substituem as antigas na aba Materiais e na seção Anúncios. Os arquivos antigos continuam guardados em Arquivos.

## 3. Novos criativos (mesmo estilo "Proposta em destaque")
- 2 temas novos × 3 formatos (quadrado, retrato, vertical) = 6 imagens.
- Temas sugeridos: "Envie pelo WhatsApp" e "Saiba quando o cliente abriu". Os dois mostram coisas que o app já faz.
- Os textos seguem as regras já aprovadas: no máximo 30 caracteres e convite "Comece grátis".

## 4. Mais vídeos curtos
- 2 vídeos verticais de 13 a 16s, em motion graphics, nos mesmos temas do item 3.
- Entram na seção Anúncios da aba Vídeos.

## Fora do escopo
- Preços, planos e anúncios no ar. Nada vai ao ar sem você pedir para publicar.

## Detalhes técnicos
- Item 1: exigir JWT ou token interno (`internal_secrets`) na função de envio transacional e checar se o destinatário pertence à conta. Deploy e nova varredura.
- Itens 2 e 3: `imagegen--edit_image` usando os criativos aprovados como base, em arquivos novos em `/mnt/documents/ads/creatives/`, copiados depois para `public/marketing/`.
- Item 4: `acp_subagent--animate_video`, saída em `/mnt/documents/ads/videos/`, copiada para `public/ads/videos/`, e registro em `tutorialVideos.ts` com i18n.
- Todos os arquivos novos entram na coleção "Orca — criativos e vídeos outubro".
