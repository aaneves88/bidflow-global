# Identidade visual Orca — Logo símbolo + lockup

## O que vai ser entregue

Nesta rodada, **só os assets de logo**. Nada de aplicação no app, landing ou emails ainda — isso fica para uma rodada seguinte depois que você aprovar o símbolo.

## Direção de marca (fixada)

- **Nome:** Orca
- **Domínio:** orca-mento.app (URL só, marca falada é "Orca")
- **Estilo:** Geométrico minimalista (família Stripe / Linear / Vercel)
- **Personalidade:** Confiante e calma + esperta e ágil + amigável e acessível
- **Paleta oceano vibrante:**
  - `#0F172A` — slate quase preto (corpo da orca, texto)
  - `#0E7490` — teal profundo (sombra/profundidade)
  - `#06B6D4` — ciano vivo (acento, água, highlights)
  - `#F0FDFA` — branco com tom mint (barriga da orca, fundo claro)

## Conceito do símbolo

Orca estilizada em **formas geométricas puras** — silhueta lateral mergulhando, com a mancha branca característica formando uma curva que sugere movimento. Inspiração: ícone do Linear, mas com personalidade animal. Deve funcionar:

- Como **glifo** quadrado de 16×16px (favicon) até 512×512px (app icon)
- Em **preto sólido** sobre branco
- Em **branco sólido** sobre fundo escuro
- Em **versão colorida** (preto + ciano)

## Entregáveis (arquivos gerados)

Tudo em `src/assets/brand/`:

1. **`orca-mark.svg`** — símbolo isolado, quadrado, versão colorida (preto + ciano)
2. **`orca-mark-mono.svg`** — símbolo em uma cor só (para reverter/aplicar em qualquer fundo)
3. **`orca-lockup-horizontal.svg`** — símbolo + palavra "Orca" ao lado (uso em header, emails)
4. **`orca-lockup-vertical.svg`** — símbolo em cima, palavra "Orca" embaixo (uso em landing hero, splash)
5. **`favicon.png`** (32×32) e **`favicon-512.png`** (app icon PWA) — exportados do símbolo

Tipografia do lockup: **Geist** ou **Inter** em peso 600, letter-spacing levemente apertado.

## Processo de geração

1. Gerar 3 variações do **símbolo** via imagegen (premium quality, transparent background) com prompts diferentes:
   - V1: orca mergulhando, linhas geométricas duras
   - V2: orca em curva fluida, mais orgânica dentro da grade
   - V3: orca vista frontal estilizada (cabeça + barbatana)
2. Apresentar as 3 lado a lado para você escolher
3. Refinar a escolhida (ajustes de proporção, peso, cor)
4. Gerar lockup horizontal e vertical com tipografia
5. Exportar favicon e app icon

## O que NÃO está incluído (próximas rodadas)

- Trocar "CloseFlow" por "Orca" no código, i18n, manifest, emails
- Aplicar paleta oceano nos design tokens do app
- Mascote ilustrado com expressões
- Atualizar memory para refletir mudança de nome

Tudo isso vira um plano separado depois que o símbolo estiver aprovado.

## Pergunta antes de implementar

Quer que eu gere as 3 variações de símbolo já agora, ou prefere ajustar algum ponto do conceito acima primeiro?
