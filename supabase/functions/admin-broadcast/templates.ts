// Broadcast email templates for the admin "Envios" panel.
// Each template renders the full branded HTML + plain text given an
// unsubscribe URL. Custom messages reuse the same brand wrapper.

export const APP_URL = 'https://orca-mento.app'
const LOGO_URL =
  'https://orca-mento.app/__l5e/assets-v1/a11affce-f92c-41ef-8ff0-03f3191be367/orca-mark.png'

export interface BroadcastTemplate {
  id: string
  label: string
  subject: string
  renderHtml: (unsubscribeUrl: string) => string
  renderText: (unsubscribeUrl: string) => string
  // Fixed announcements are sent at most once per recipient.
  oncePerRecipient: boolean
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function brandWrapper(title: string, bodyHtml: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;margin:0;padding:32px 0;">
  <div style="background-color:#ffffff;border-radius:16px;border:1px solid #E2E8F0;padding:0;margin:0 auto;max-width:560px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#06B6D4 0%,#0891B2 100%);padding:24px;text-align:center;">
      <img src="${LOGO_URL}" alt="Orca" width="56" height="56" style="display:inline-block;" />
    </div>
    <div style="padding:32px 28px;">
      <h1 style="color:#0F172A;font-size:22px;line-height:1.3;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="color:#0F172A;font-size:15px;font-weight:600;margin:24px 0 0;">Equipe Orca</p>
    </div>
    <div style="border-top:1px solid #E2E8F0;padding:16px 28px;text-align:center;">
      <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:0;">
        Você recebeu este e-mail porque tem uma conta no <a href="${APP_URL}" style="color:#0891B2;text-decoration:none;">Orca</a>.
        <br /><a href="${unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Descadastrar-se destes e-mails</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

const p = (text: string) =>
  `<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">${text}</p>`

const featureBox = (title: string, body: string, last = false) =>
  `<div style="background-color:#F0FDFA;border:1px solid #CCFBF1;border-radius:12px;padding:16px 18px;margin:0 0 ${last ? 20 : 16}px;">
    <p style="color:#0F172A;font-size:15px;font-weight:700;margin:0 0 6px;">${title}</p>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">${body}</p>
  </div>`

const novidadesBody = [
  p('Oi!'),
  p('Duas novidades que podem facilitar seu dia a dia no Orca:'),
  featureBox(
    '💳 Pagamento por link direto na proposta',
    'Agora é possível adicionar um link de pagamento (cartão de crédito) em qualquer proposta — ele aparece tanto na página pública da proposta quanto no PDF, ao lado do QR Code do PIX. Seu cliente escolhe como prefere pagar, sem sair da proposta.',
  ),
  featureBox(
    '📚 Central de Ajuda e Tutoriais',
    'Criamos uma área com vídeos curtos mostrando como usar o Orca na prática: criar cliente, criar e gerenciar proposta, como abordar um cliente, precificação, dicas pra quem é MEI ou está no Simples. Está disponível direto no menu, em "Ajuda e tutoriais".',
    true,
  ),
  p('Qualquer dúvida, só responder este e-mail.'),
].join('\n')

const novidadesText = `Oi!

Duas novidades que podem facilitar seu dia a dia no Orca:

PAGAMENTO POR LINK DIRETO NA PROPOSTA
Agora é possível adicionar um link de pagamento (cartão de crédito) em qualquer proposta — ele aparece tanto na página pública da proposta quanto no PDF, ao lado do QR Code do PIX. Seu cliente escolhe como prefere pagar, sem sair da proposta.

CENTRAL DE AJUDA E TUTORIAIS
Criamos uma área com vídeos curtos mostrando como usar o Orca na prática: criar cliente, criar e gerenciar proposta, como abordar um cliente, precificação, dicas pra quem é MEI ou está no Simples. Está disponível direto no menu, em "Ajuda e tutoriais".

Qualquer dúvida, só responder este e-mail.

Equipe Orca`

export function renderCustomHtml(
  title: string,
  bodyText: string,
  unsubscribeUrl: string,
): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => p(escapeHtml(chunk).replace(/\n/g, '<br />')))
    .join('\n')
  return brandWrapper(escapeHtml(title), paragraphs, unsubscribeUrl)
}

export function renderCustomText(bodyText: string, unsubscribeUrl: string): string {
  return `${bodyText.trim()}

Equipe Orca

---
Para se descadastrar destes e-mails: ${unsubscribeUrl}`
}

export const TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'novidades-pagamento-ajuda',
    label: 'Novidades: pagamento por link + central de ajuda',
    subject: 'Novidades no Orca: pagamento por link e central de ajuda',
    oncePerRecipient: true,
    renderHtml: (unsubscribeUrl) =>
      brandWrapper('Novidades no Orca 🐋', novidadesBody, unsubscribeUrl),
    renderText: (unsubscribeUrl) =>
      `${novidadesText}

---
Para se descadastrar destes e-mails: ${unsubscribeUrl}`,
  },
]

export function getTemplate(id: string): BroadcastTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
