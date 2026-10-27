# Onde os novos usuários estão parando (últimos 30 dias)

## O que os números mostram
```text
20 cadastros
19 terminaram o onboarding     (95%)
 6 criaram 1+ proposta         (30%)   <- maior queda
 3 cadastraram cliente         (15%)
 1 teve proposta aberta pelo cliente (5%) <- segunda queda
 3 abriram o pagamento, 0 pagaram
```
- Ninguém chegou ao limite grátis (3 propostas): o máximo foi 3, e só 1 pessoa. Ou seja, quase ninguém sente necessidade de pagar ainda.
- Canais: Instagram 7, Facebook/Meta 6, direto 7.
- 3 pessoas abriram o pagamento e desistiram.

## Diagnóstico
1. Gargalo principal: 70% terminam o cadastro e nunca criam proposta.
2. Quem cria quase não envia: só 1 proposta foi aberta por um cliente. Sem cliente abrindo, a pessoa não vê o valor.
3. Pagamento: o limite grátis é alcançado tarde demais, e quem tentou pagar desistiu (motivo desconhecido; a tela mostra "StateMatch").

## O que proponho (passo a passo, você aprova cada um)
1. Investigar mais (sem mudar nada): ver por canal e por usuário onde cada um parou, e os 3 que abriram o pagamento, para entender a desistência. Te entrego um resumo.
2. Primeira proposta guiada: logo após o onboarding, levar direto para "Criar minha primeira proposta" já preenchida com o nicho da pessoa.
3. Empurrar o envio: depois de salvar, destacar "Enviar no WhatsApp" e um lembrete se a proposta não for aberta em 24h.
4. E-mail de resgate para quem tentou pagar e não concluiu.
5. Rever o limite grátis (ex.: 1 proposta enviada com marca Orca) — só se você quiser; preço fica como está.

## Detalhes técnicos
- Passo 1: consultas em profiles, proposals, proposal_views, product_events, user_plans.
- Observação: os eventos de produto não estão gravando o usuário (contagem de usuários distintos = 0); vale corrigir para medir melhor.
