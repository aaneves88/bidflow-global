# Correções na tela de Configurações

## Diagnóstico

### 1. "Não consigo alterar nada" (bug crítico)
Nos três tabs (`GeneralTab`, `IntegrationsTab`, `BrandingTab`) de `src/pages/settings/SettingsPage.tsx` o `useEffect` que carrega valores do banco depende de `getSetting` — uma função recriada a cada render do hook `useAppSettings`. Resultado: o efeito roda em **todo render** e sobrescreve o que o usuário digita com o valor original do banco. Os campos parecem "não aceitar" alterações.

**Correção:** trocar a dependência por `query.data` (ou por valores derivados estáveis) e ler os settings dentro do efeito uma única vez quando os dados chegam. Alternativamente, memoizar `getSetting` no `useAppSettings` com `useCallback` dependendo de `query.data`.

### 2. Upload de logo falha ("Logo too large – 367KB")
O `LogoUpload` está com `maxKb=300` e a logo do usuário tem 367KB depois do resize. Como o arquivo é salvo como data URL em `app_settings.value` (texto), podemos relaxar com segurança:
- Aumentar `maxKb` para **600** (ainda confortável para JSONB do Postgres).
- Reduzir `maxSize` padrão de 512px para **384px** e baixar a qualidade JPEG de 0.85 → **0.8** para que a maioria das logos passe sem aviso.
- Mensagem de erro traduzida via i18n em vez de string fixa em inglês.

### 3. Tab "Integrações" em Configurações vs página `/admin/integrations`
Hoje existem **duas** UIs de integração:
- `/settings` → aba *Integrações* com toggles soltos de Stripe e WhatsApp (sem efeito real).
- `/admin/integrations` → card completo do Stripe (com chaves) + "Em breve" para WhatsApp, Resend, PIX, etc.

A aba em Configurações confunde porque promete configurar coisas que não configuram nada. **Remover a aba "Integrações" de `/settings`** e deixar apenas General + Branding. Adicionar um pequeno link/CTA no topo dizendo "Gerencie integrações em Administração → Integrações" (visível só para admin).

### 4. Mobile: conteúdo cortado
- `AppLayout` usa `<main className="flex-1 p-6">`. Em telas estreitas, `p-6` (24px) + sidebar trigger + título no header espreme demais. Trocar para `p-4 md:p-6`.
- `SettingsPage` `<h1 className="text-3xl">` quebra mal no mobile → `text-2xl md:text-3xl`.
- `TabsList` do shadcn não rola horizontalmente; com 2 abas após remover Integrações cabe, mas garantir `w-full` e `grid grid-cols-2 md:inline-flex`.
- `BrandingTab` grid `lg:grid-cols-[1fr_360px]` já empilha no mobile — ok. Mas o `ColorField` tem `<input type="color">` de `h-9 w-12` + `Input` `flex-1` que estoura em telas <360px. Adicionar `min-w-0` no Input e `flex-wrap` no container.
- `LogoUpload`: o bloco de preview + botões pode estourar. Trocar `flex items-center gap-3` por `flex flex-wrap items-center gap-3`.

## Arquivos a alterar

- `src/hooks/useAppSettings.ts` — memoizar `getSetting` com `useCallback([query.data])`.
- `src/pages/settings/SettingsPage.tsx` — corrigir deps do `useEffect` nos 3 tabs (usar `query.data` via hook ajustado), remover aba Integrações, ajustes responsivos (`text-2xl md:text-3xl`, tabs `grid grid-cols-2 md:inline-flex`), adicionar link para `/admin/integrations` para admins.
- `src/components/LogoUpload.tsx` — `maxKb=600`, `maxSize=384`, qualidade 0.8, mensagem via `t()`, `flex-wrap` no container.
- `src/components/AppLayout.tsx` — `p-4 md:p-6` no `<main>`.
- `src/i18n/locales/{pt-BR,en}/settings.json` — remover chaves do tab `integrations`, adicionar string "Gerencie integrações em Administração".
- `src/i18n/locales/{pt-BR,en}/common.json` — chaves de erro de upload (`logoTooLarge`, `invalidImage`).

## Fora de escopo
- Refazer fluxo de onboarding (já tratado em mensagens anteriores).
- Mexer em lógica de Stripe/integrações reais.

## Verificação
- Abrir `/settings` em viewport mobile (375px) e desktop, alterar nome da empresa, idioma, cores, salvar e recarregar para confirmar persistência.
- Fazer upload de uma logo ~400KB e confirmar sucesso.
- Confirmar que aba "Integrações" desapareceu de `/settings` e o link leva para `/admin/integrations`.
