import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency, formatDate } from './format';

interface ProposalLike {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  terms?: string | null;
  currency: string;
  total_amount: number | string;
  valid_until?: string | null;
  public_code: string;
  clients?: {
    name?: string | null;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  proposal_statuses?: { name?: string | null; color?: string | null } | null;
}

interface ItemLike {
  description: string;
  quantity: number | string;
  unit_price: number | string;
  total: number | string;
  position?: number;
}

interface Options {
  companyName?: string;
  publicUrlBase?: string;
  logoDataUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  /** Free-tier proposals get a diagonal "Orca" watermark on every page. */
  watermark?: boolean;
  /** Small "Powered by Orca" line in the footer. Default on. */
  showPoweredBy?: boolean;
  labels?: {
    proposalFor?: string;
    description?: string;
    notes?: string;
    terms?: string;
    items?: string;
    qty?: string;
    unitPrice?: string;
    total?: string;
    grandTotal?: string;
    validUntil?: string;
    status?: string;
    publicLink?: string;
    generatedAt?: string;
    poweredBy?: string;
    watermark?: string;
  };
}

const DEFAULT_LABELS = {
  proposalFor: 'Cliente',
  description: 'Descrição',
  notes: 'Observações',
  terms: 'Termos e condições',
  items: 'Itens',
  qty: 'Qtd',
  unitPrice: 'Valor unit.',
  total: 'Total',
  grandTotal: 'Total geral',
  validUntil: 'Válida até',
  status: 'Status',
  publicLink: 'Link da proposta',
  generatedAt: 'Gerado em',
  poweredBy: 'Feito com Orca · orca-mento.app',
  watermark: 'Orca',
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Inject a hidden DOM node holding the hero markup so html2canvas can capture it. */
async function buildHeroCanvas(
  proposal: ProposalLike,
  options: Options,
  labels: typeof DEFAULT_LABELS,
  pxWidth: number,
): Promise<HTMLCanvasElement> {
  const primary = options.primaryColor || '#3B82F6';
  const secondary = options.secondaryColor || '#0F172A';
  const accent = options.accentColor || '#22C55E';
  const isFree = !!options.watermark;
  const companyName = options.companyName || '';

  const total = formatCurrency(Number(proposal.total_amount), proposal.currency);
  const status = proposal.proposal_statuses?.name || '';
  const validUntil = proposal.valid_until ? formatDate(proposal.valid_until) : '';
  const generatedAt = formatDate(new Date().toISOString());

  const client = proposal.clients;
  const clientLines: string[] = [];
  if (client?.name) clientLines.push(escapeHtml(client.name));
  if (client?.company) clientLines.push(escapeHtml(client.company));
  if (client?.email) clientLines.push(escapeHtml(client.email));
  if (client?.phone) clientLines.push(escapeHtml(client.phone));

  const brandHeader = isFree
    ? `
      <div style="display:flex;align-items:center;gap:12px;padding:18px 32px;background:${secondary};color:#fff;">
        <div style="width:36px;height:36px;border-radius:50%;background:${primary};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">O</div>
        <div>
          <div style="font-size:16px;font-weight:700;letter-spacing:-0.2px;">Orca</div>
          <div style="font-size:11px;opacity:0.7;">Proposta criada com Orca</div>
        </div>
      </div>
    `
    : `
      <div style="display:flex;align-items:center;gap:16px;padding:24px 32px;border-bottom:1px solid #e5e7eb;">
        ${options.logoDataUrl ? `<img src="${options.logoDataUrl}" alt="" style="height:52px;width:auto;max-width:200px;object-fit:contain;" crossorigin="anonymous" />` : ''}
        ${companyName ? `<div style="font-size:20px;font-weight:700;color:${secondary};letter-spacing:-0.3px;">${escapeHtml(companyName)}</div>` : ''}
      </div>
    `;

  const meta = [
    status && `${labels.status}: ${escapeHtml(status)}`,
    validUntil && `${labels.validUntil} ${escapeHtml(validUntil)}`,
    `${labels.generatedAt} ${escapeHtml(generatedAt)}`,
  ]
    .filter(Boolean)
    .join('  ·  ');

  const html = `
    <div style="background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
      <div style="height:6px;background:${primary};"></div>
      ${brandHeader}
      <div style="padding:32px 32px 24px 32px;">
        <h1 style="font-size:34px;font-weight:800;letter-spacing:-0.8px;line-height:1.15;margin:0 0 12px 0;color:#0f172a;">
          ${escapeHtml(proposal.title)}
        </h1>
        <div style="font-size:12px;color:#64748b;margin-bottom:24px;">${meta}</div>

        <div style="display:flex;gap:16px;align-items:stretch;">
          ${
            clientLines.length
              ? `
            <div style="flex:1;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${secondary};margin-bottom:8px;">
                ${escapeHtml(labels.proposalFor)}
              </div>
              <div style="font-size:14px;line-height:1.55;color:#1e293b;">
                ${clientLines.map((l, i) => `<div style="${i === 0 ? 'font-weight:600;' : 'color:#64748b;font-size:13px;'}">${l}</div>`).join('')}
              </div>
            </div>
          `
              : ''
          }
          <div style="min-width:200px;background:${accent}14;border:1px solid ${accent}55;border-radius:10px;padding:16px 20px;text-align:center;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${accent};margin-bottom:6px;">
              ${escapeHtml(labels.grandTotal)}
            </div>
            <div style="font-size:24px;font-weight:800;color:${accent};letter-spacing:-0.4px;">${escapeHtml(total)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${pxWidth}px`;
  wrapper.style.background = '#fff';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // Wait for logo to load if present
  const img = wrapper.querySelector('img') as HTMLImageElement | null;
  if (img) {
    try {
      if (img.complete && img.naturalWidth === 0) {
        // broken — ignore
      } else {
        await img.decode().catch(() => undefined);
      }
    } catch {
      /* noop */
    }
  }

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    return canvas;
  } finally {
    document.body.removeChild(wrapper);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function generateProposalPdf(
  proposal: ProposalLike,
  items: ItemLike[],
  options: Options = {},
) {
  const labels = { ...DEFAULT_LABELS, ...(options.labels || {}) };

  const primary = options.primaryColor || '#3B82F6';
  const secondary = options.secondaryColor || '#0F172A';
  const [pr, pg, pb] = hexToRgb(primary);
  const [sr, sg, sb] = hexToRgb(secondary);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const footerReserve = 36;

  // === Hero via html2canvas ===
  const heroPxWidth = 900; // virtual width; html2canvas scales x2
  const heroCanvas = await buildHeroCanvas(proposal, options, labels, heroPxWidth);
  const heroAspect = heroCanvas.height / heroCanvas.width;
  const heroHeightPt = contentWidth * heroAspect;
  const heroDataUrl = heroCanvas.toDataURL('image/jpeg', 0.92);

  let y = margin;
  doc.addImage(heroDataUrl, 'JPEG', margin, y, contentWidth, heroHeightPt, undefined, 'FAST');
  y += heroHeightPt + 18;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - footerReserve) {
      doc.addPage();
      y = margin;
    }
  };

  const renderTextSection = (label: string, text: string) => {
    ensureSpace(26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(sr, sg, sb);
    doc.text(label, margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(text, contentWidth);
    for (const line of wrapped) {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 13;
    }
    y += 10;
  };

  if (proposal.description) {
    renderTextSection(labels.description, proposal.description);
  }

  // === Items table — native text ===
  ensureSpace(80);
  ensureSpace(0);
  autoTable(doc, {
    startY: y,
    head: [[labels.description, labels.qty, labels.unitPrice, labels.total]],
    body: items.map((i) => [
      i.description,
      String(i.quantity),
      formatCurrency(Number(i.unit_price), proposal.currency),
      formatCurrency(Number(i.total), proposal.currency),
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontStyle: 'normal',
      fontSize: 10,
      cellPadding: 8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'helvetica',
      fontStyle: 'bold',
      fillColor: [pr, pg, pb],
      textColor: [255, 255, 255],
      fontSize: 10,
      cellPadding: { top: 10, right: 8, bottom: 10, left: 8 },
      halign: 'left',
    },
    bodyStyles: {
      font: 'helvetica',
      fontStyle: 'normal',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { font: 'helvetica', fontStyle: 'normal' },
      1: { halign: 'right', cellWidth: 50, font: 'helvetica', fontStyle: 'normal' },
      2: { halign: 'right', cellWidth: 95, font: 'helvetica', fontStyle: 'normal' },
      3: { halign: 'right', cellWidth: 100, font: 'helvetica', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: footerReserve },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 12;

  // Total line below table (mirrors hero card but native text, right-aligned)
  ensureSpace(28);
  const totalText = formatCurrency(Number(proposal.total_amount), proposal.currency);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(sr, sg, sb);
  const totalLabel = `${labels.grandTotal}:`;
  doc.text(totalLabel, pageWidth - margin - doc.getTextWidth(totalText) - 12, y, {
    align: 'right',
  });
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(totalText, pageWidth - margin, y, { align: 'right' });
  y += 24;

  if (proposal.notes) renderTextSection(labels.notes, proposal.notes);
  if (proposal.terms) renderTextSection(labels.terms, proposal.terms);

  // === Footer + watermark on every page ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    if (options.watermark) {
      // @ts-ignore
      const gs = (doc as any).GState ? new (doc as any).GState({ opacity: 0.07 }) : null;
      if (gs) (doc as any).setGState(gs);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(120);
      doc.setTextColor(15, 23, 42);
      doc.text(labels.watermark, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: -28,
      });
      // reset opacity
      // @ts-ignore
      const gs2 = (doc as any).GState ? new (doc as any).GState({ opacity: 1 }) : null;
      if (gs2) (doc as any).setGState(gs2);
    }

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);

    if (options.publicUrlBase) {
      const url = `${options.publicUrlBase}/p/${proposal.public_code}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(url, margin, pageHeight - 14);
    }

    if (options.showPoweredBy !== false) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(labels.poweredBy, pageWidth / 2, pageHeight - 14, { align: 'center' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
  }

  doc.save(`proposta-${proposal.public_code}.pdf`);
}
