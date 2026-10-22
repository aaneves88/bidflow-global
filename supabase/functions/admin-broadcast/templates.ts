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

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

function brandWrapper(title: string, bodyHtml: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light only" /></head>
<body style="background-color:#ffffff;margin:0;padding:0;font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF2F6;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;">
  <tr><td style="background-color:#0F172A;background-image:linear-gradient(160deg,#0F172A 0%,#0B2A3A 55%,#0F172A 100%);padding:0;">
    <div style="height:3px;line-height:3px;font-size:0;background-image:linear-gradient(90deg,rgba(6,182,212,0) 0%,#06B6D4 35%,#5EEAD4 65%,rgba(94,234,212,0) 100%);background-color:#06B6D4;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:30px 28px 10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background-color:#F0FDFA;border-radius:14px;padding:8px;"><img src="${LOGO_URL}" alt="Orca" width="40" height="40" style="display:block;border:0;" /></td>
        <td style="padding-left:12px;color:#F8FAFC;font-size:24px;font-weight:800;letter-spacing:-0.5px;font-family:${FONT};">Orca</td>
      </tr></table>
    </td></tr>
    <tr><td align="center" style="padding:14px 28px 34px;">
      <h1 style="margin:0;color:#F8FAFC;font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-0.5px;font-family:${FONT};">${title}</h1>
      <div style="width:56px;height:3px;line-height:3px;font-size:0;margin:16px auto 0;background-color:#06B6D4;border-radius:2px;">&nbsp;</div>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:34px 32px 8px;">
    ${bodyHtml}
    <p style="color:#0F172A;font-size:15px;font-weight:700;margin:24px 0 28px;font-family:${FONT};">Equipe Orca</p>
  </td></tr>
  <tr><td align="center" style="background-color:#0F172A;padding:22px 28px;">
    <a href="${APP_URL}" style="color:#5EEAD4;font-size:14px;font-weight:700;text-decoration:none;font-family:${FONT};">orca-mento.app</a>
    <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:10px 0 0;font-family:${FONT};">
      Você recebeu este e-mail porque tem uma conta no Orca.<br />
      <a href="${unsubscribeUrl}" style="color:#94A3B8;text-decoration:underline;">Descadastrar-se destes e-mails</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`
}

const p = (text: string) =>
  `<p style="color:#334155;font-size:16px;line-height:1.65;margin:0 0 18px;font-family:${FONT};">${text}</p>`

const featureBox = (
  label: string,
  title: string,
  body: string,
  cta: { text: string; href: string },
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border:1px solid #E2E8F0;border-left:4px solid #06B6D4;border-radius:12px;background-color:#F8FAFC;">
    <tr><td style="padding:20px 22px;">
      <p style="margin:0 0 6px;color:#0891B2;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;font-family:${FONT};">${label}</p>
      <p style="margin:0 0 8px;color:#0F172A;font-size:17px;font-weight:800;line-height:1.35;font-family:${FONT};">${title}</p>
      <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.65;font-family:${FONT};">${body}</p>
      <a href="${cta.href}" style="display:inline-block;background-color:#06B6D4;color:#0F172A;font-size:14px;font-weight:700;text-decoration:none;padding:11px 20px;border-radius:10px;font-family:${FONT};">${cta.text} &rarr;</a>
    </td></tr>
  </table>`

const novidadesBody = [
  p('Oi!'),
  p('Duas novidades que podem facilitar seu dia a dia no Orca:'),
  featureBox(
    'Novidade 1',
    'Pagamento por link direto na proposta',
    'Agora é possível adicionar um link de pagamento (cartão de crédito) em qualquer proposta — ele aparece tanto na página pública da proposta quanto no PDF, ao lado do QR Code do PIX. Seu cliente escolhe como prefere pagar, sem sair da proposta.',
    { text: 'Configurar meu link', href: `${APP_URL}/account` },
  ),
  featureBox(
    'Novidade 2',
    'Central de Ajuda e Tutoriais',
    'Criamos uma área com vídeos curtos mostrando como usar o Orca na prática: criar cliente, criar e gerenciar proposta, como abordar um cliente, precificação, dicas pra quem é MEI ou está no Simples. Está disponível direto no menu, em "Ajuda e tutoriais".',
    { text: 'Ver tutoriais', href: `${APP_URL}/ajuda` },
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
      brandWrapper('Novidades no Orca', novidadesBody, unsubscribeUrl),
    renderText: (unsubscribeUrl) =>
      `${novidadesText}

---
Para se descadastrar destes e-mails: ${unsubscribeUrl}`,
  },
]

export function getTemplate(id: string): BroadcastTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
