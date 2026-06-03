import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './format';

interface ProposalLike {
  id: string;
  title: string;
  description?: string | null;
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
  labels?: {
    proposalFor?: string;
    description?: string;
    items?: string;
    qty?: string;
    unitPrice?: string;
    total?: string;
    grandTotal?: string;
    validUntil?: string;
    status?: string;
    publicLink?: string;
    generatedAt?: string;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function generateProposalPdf(
  proposal: ProposalLike,
  items: ItemLike[],
  options: Options = {}
) {
  const labels = {
    proposalFor: 'Cliente',
    description: 'Descrição',
    items: 'Itens',
    qty: 'Qtd',
    unitPrice: 'Valor unit.',
    total: 'Total',
    grandTotal: 'Total geral',
    validUntil: 'Válida até',
    status: 'Status',
    publicLink: 'Link da proposta',
    generatedAt: 'Gerado em',
    ...(options.labels || {}),
  };

  const primary = options.primaryColor || '#3B82F6';
  const secondary = options.secondaryColor || '#1F2937';
  const accent = options.accentColor || '#22C55E';
  const [pr, pg, pb] = hexToRgb(primary);
  const [sr, sg, sb] = hexToRgb(secondary);
  const [ar, ag, ab] = hexToRgb(accent);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Top brand bar
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 8, 'F');

  let y = margin;

  // Logo + company name
  if (options.logoDataUrl) {
    try {
      const fmt = options.logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(options.logoDataUrl, fmt, margin, y - 5, 60, 30, undefined, 'FAST');
      if (options.companyName) {
        doc.setFontSize(11);
        doc.setTextColor(sr, sg, sb);
        doc.text(options.companyName, margin + 70, y + 12);
      }
      y += 36;
    } catch {
      // ignore bad image
    }
  } else if (options.companyName) {
    doc.setFontSize(11);
    doc.setTextColor(sr, sg, sb);
    doc.text(options.companyName, margin, y);
    y += 18;
  }

  // Title
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text(proposal.title, margin, y);
  y += 24;

  // Meta line
  doc.setFontSize(10);
  doc.setTextColor(110);
  const metaParts: string[] = [];
  if (proposal.proposal_statuses?.name) metaParts.push(`${labels.status}: ${proposal.proposal_statuses.name}`);
  if (proposal.valid_until) metaParts.push(`${labels.validUntil} ${formatDate(proposal.valid_until)}`);
  metaParts.push(`${labels.generatedAt} ${formatDate(new Date().toISOString())}`);
  doc.text(metaParts.join('  ·  '), margin, y);
  y += 20;

  // Client block
  if (proposal.clients) {
    doc.setFontSize(11);
    doc.setTextColor(sr, sg, sb);
    doc.text(labels.proposalFor, margin, y);
    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(80);
    const c = proposal.clients;
    const lines = [c.name, c.company, c.email, c.phone].filter(Boolean) as string[];
    lines.forEach((l) => {
      doc.text(l, margin, y);
      y += 13;
    });
    y += 6;
  }

  // Description
  if (proposal.description) {
    doc.setFontSize(11);
    doc.setTextColor(sr, sg, sb);
    doc.text(labels.description, margin, y);
    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(60);
    const wrapped = doc.splitTextToSize(proposal.description, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 13 + 10;
  }

  // Items table
  autoTable(doc, {
    startY: y,
    head: [[labels.description, labels.qty, labels.unitPrice, labels.total]],
    body: items.map((i) => [
      i.description,
      String(i.quantity),
      formatCurrency(Number(i.unit_price), proposal.currency),
      formatCurrency(Number(i.total), proposal.currency),
    ]),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [pr, pg, pb], textColor: 255 },
    columnStyles: {
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 90 },
      3: { halign: 'right', cellWidth: 90 },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore - lastAutoTable injected by autotable
  y = doc.lastAutoTable.finalY + 18;

  // Total (in accent color)
  doc.setFontSize(13);
  doc.setTextColor(ar, ag, ab);
  const totalText = `${labels.grandTotal}: ${formatCurrency(Number(proposal.total_amount), proposal.currency)}`;
  doc.text(totalText, pageWidth - margin, y, { align: 'right' });
  y += 24;

  // Brand footer bar
  doc.setFillColor(sr, sg, sb);
  doc.rect(0, pageHeight - 18, pageWidth, 4, 'F');

  // Public link footer
  if (options.publicUrlBase) {
    const url = `${options.publicUrlBase}/p/${proposal.public_code}`;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${labels.publicLink}: ${url}`, margin, pageHeight - 24);
  }

  doc.save(`proposta-${proposal.public_code}.pdf`);
}
