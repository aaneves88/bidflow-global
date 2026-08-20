# Roadmap da Orca

Status atualizado em cada release. Documento vivo.

| Onda | Versão | Tema | Status |
|------|--------|------|--------|
| 1    | v0.1.0 | CRM base (clientes, propostas, status, link público) | ✅ Lançada |
| 2    | v0.2.0 | i18n pt-BR + branding visual (Orca, mascote, paleta) | ✅ Lançada |
| 3    | v0.3.0 | Planos (Free/Pro/Business), limites, watermark, PDF | ✅ Lançada |
| 3.5  | v0.3.1 | PDF híbrido (canvas + texto), branding completo no PDF | ✅ Lançada |
| 4    | v0.4.0 | Hardening de segurança (RLS, RPC público, realtime, HIBP) | ✅ Lançada |
| 5    | v0.5.0 | E-mails transacionais (auth + notificações de propostas) | ✅ Lançada |
| 6    | v0.6.0 | Mobile Android (Play Store) + RevenueCat | ✅ Lançada |
| 6.1  | v0.6.1 | Fechamento técnico Play Store (ícones, splash, assetlinks) | 🚧 Em desenvolvimento |
| 7    | v0.7.0 | Templates de proposta + onboarding simplificado | ✅ Lançada |
| 7.1  | v0.7.1 | Marca própria + trava anti-abuso (Tax ID) | ✅ Lançada |
| 8    | v0.8.0 | **Programa de indicação** | ✅ Lançada |
| 8.1  | v0.8.1 | Automação de conversão no Stripe + créditos de indicação | 🚧 Em desenvolvimento |
| 9    | v0.9.0 | SEO + landing institucional + páginas de nicho | ⏳ Planejada |
| 10   | v0.10.0 | LGPD + termos + consentimento + ajustes pré-lançamento | ⏳ Planejada |
| 11   | v1.0.0 | Observabilidade + lançamento comercial 🚀 | ⏳ Planejada |

## Convenções

- Cada onda concluída gera um arquivo em [`releases/`](./releases/) seguindo o [template](./releases/_TEMPLATE.md).
- `package.json` `version` é incrementada junto com cada release.
- Releases também alimentam material de marketing em [`marketing/`](./marketing/).

## Visão de produto

Orca é um CRM leve de propostas comerciais para pequenos negócios brasileiros. Foco em:
- **Simplicidade**: criar e enviar proposta em menos de 2 minutos
- **Aparência profissional**: PDF e link público com a marca do cliente
- **Mobile-first**: usável no celular durante a reunião com o cliente
- **Self-serve**: cadastro → primeira proposta sem suporte humano

Persona principal: prestador de serviço autônomo ou microempresa (consultor, agência pequena, freelancer técnico) que hoje usa Word/Google Docs para fazer propostas.
