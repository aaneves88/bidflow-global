## Testar as 5 mudanças antes de publicar

Até agora só foi verificado que tudo compila. Nada foi testado clicando de verdade. Este plano testa tudo de ponta a ponta no painel de visualização, logado na conta aaneves.

1. **Admin agrupado:** abrir cada um dos 5 grupos e cada aba. Confirmar que todas carregam e que, ao recarregar, a página volta para a mesma aba.
2. **Planos e Indique:** abrir pelo menu do usuário. Confirmar que o menu lateral continua aparecendo e que os botões funcionam.
3. **Minha conta:** confirmar que aparece "Administrador — acesso total".
4. **Blocos de texto:** confirmar que o quadro explicativo aparece, que dá para fechar e que continua fechado ao recarregar. Abrir o ícone de ajuda dentro da proposta.
5. **Imagens dos produtos (o teste mais importante):**
   - cadastrar um produto de teste com 3 imagens; tentar uma 4ª e um arquivo inválido (deve recusar)
   - remover uma imagem e salvar
   - criar uma proposta usando esse produto
   - abrir o link público sem estar logado: o "Anexo — Produtos" deve mostrar nome, descrição e imagens
   - baixar o PDF pela tela da proposta e pela página pública: o anexo deve ter as imagens
6. **Limpeza:** apagar o produto, a proposta e as imagens de teste.
7. **Correções:** se algo falhar, corrijo na hora e testo de novo.
8. **Relatório:** te mostro prints de cada passo e o que precisou ser corrigido.

### Detalhes técnicos
- Playwright com sessão injetada, viewport 1280x1800, e o link público em um contexto anônimo.
- Conferir o PDF gerado (páginas e imagens embutidas) e os logs de erro do console.
- Conferir se as signed URLs do bucket privado `product-images` funcionam para anon.
