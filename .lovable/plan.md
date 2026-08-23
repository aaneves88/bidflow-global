# Notificações com histórico

Hoje o sino só mostra visualizações mais recentes que o "último visto". Ao fechar o popover, tudo desaparece e a lista fica vazia. A mudança: manter o histórico visível e usar a leitura apenas para apagar o alerta (badge).

## Comportamento novo

- O sino lista as últimas visualizações das propostas do usuário (histórico), independente de já terem sido lidas.
- O contador vermelho (badge) conta apenas as visualizações posteriores à última leitura.
- Ao abrir e fechar o sino, o badge zera, mas a lista continua mostrando o histórico.
- Itens não lidos ganham destaque (ponto/fundo sutil); itens já lidos ficam em estilo normal.
- Limite do histórico: 30 itens mais recentes, dos últimos 60 dias.
- Estado vazio só aparece quando realmente nunca houve visualização.

## Detalhes técnicos

- `src/hooks/useUnseenViews.ts`:
  - Renomear a consulta para retornar histórico: remover o filtro `.gt('viewed_at', since)` e aplicar `.gte('viewed_at', now-60d)` + `.limit(30)`.
  - Cada item passa a ter `seen: boolean` calculado contra `getLastSeenViewsAt()`.
  - Expor também `unseenCount` (derivado) mantendo `markViewsAsSeen()` como está (localStorage).
- `src/components/NotificationsBell.tsx`:
  - Badge usa `unseenCount` em vez de `list.length`.
  - Renderiza a lista completa; item não lido recebe `bg-primary/5` e um ponto indicador; item lido sem destaque.
  - Ao fechar (ou clicar em um item) chama `markViewsAsSeen()` e invalida a query — a lista permanece, só o badge some.
- Traduções em `src/i18n/locales/{pt-BR,en}/common.json`: manter `notifications.empty`, adicionar rótulo de "novo"/"new".

Sem mudanças no banco de dados.
