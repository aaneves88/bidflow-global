import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const footerReserve = 40;

  // Top brand bar
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 6, 'F');

  let y = margin + 4;

  /** Ensure there's enough vertical room before drawing the next block; add a new page if not. */
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - footerReserve) {
      doc.addPage();
      // Top bar on subsequent pages too
      doc.setFillColor(pr, pg, pb);
      doc.rect(0, 0, pageWidth, 6, 'F');
      y = margin + 4;
    }
  };

  // Header: logo + company name
  if (options.logoDataUrl) {
    try {
      const fmt = options.logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(options.logoDataUrl, fmt, margin, y, 56, 36, undefined, 'FAST');
      if (options.companyName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(sr, sg, sb);
        doc.text(options.companyName, margin + 68, y + 22);
      }
      y += 50;
    } catch {
      // ignore bad image
    }
  } else if (options.companyName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(sr, sg, sb);
    doc.text(options.companyName, margin, y + 14);
    y += 32;
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(20);
  doc.text(proposal.title, margin, y + 6);
  y += 30;

  // Meta line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(115);
  const metaParts: string[] = [];
  if (proposal.proposal_statuses?.name) metaParts.push(`${labels.status}: ${proposal.proposal_statuses.name}`);
  if (proposal.valid_until) metaParts.push(`${labels.validUntil} ${formatDate(proposal.valid_until)}`);
  metaParts.push(`${labels.generatedAt} ${formatDate(new Date().toISOString())}`);
  doc.text(metaParts.join('  ·  '), margin, y);
  y += 22;

  // Client block — light grey panel
  if (proposal.clients) {
    const c = proposal.clients;
    const lines = [c.name, c.company, c.email, c.phone].filter(Boolean) as string[];
    const blockHeight = 26 + lines.length * 13 + 10;
    ensureSpace(blockHeight);

    doc.setFillColor(247, 248, 250);
    doc.roundedRect(margin, y, contentWidth, blockHeight - 4, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(sr, sg, sb);
    doc.text(labels.proposalFor.toUpperCase(), margin + 14, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40);
    let ly = y + 30;
    lines.forEach((l) => {
      doc.text(l, margin + 14, ly);
      ly += 13;
    });
    y += blockHeight + 4;
  }

  /** Render a labeled wrapped text block with pagination support. */
  const renderTextSection = (label: string, text: string) => {
    const wrapped = doc.splitTextToSize(text, contentWidth);
    // Label first
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(sr, sg, sb);
    doc.text(label, margin, y);
    y += 14;

    // Body — render line by line so we can paginate
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60);
    for (const line of wrapped) {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 13;
    }
    y += 10;
  };

  // Description
  if (proposal.description) {
    renderTextSection(labels.description, proposal.description);
  }

  // Items table
  ensureSpace(60);
  autoTable(doc, {
    startY: y,
    head: [[labels.description, labels.qty, labels.unitPrice, labels.total]],
    body: items.map((i) => [
      i.description,
      String(i.quantity),
      formatCurrency(Number(i.unit_price), proposal.currency),
      formatCurrency(Number(i.total), proposal.currency),
    ]),
    styles: { fontSize: 10, cellPadding: 8, textColor: [40, 40, 40] },
    headStyles: {
      fillColor: [pr, pg, pb],
      textColor: 255,
      fontStyle: 'bold',
      cellPadding: 9,
    },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: {
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 100 },
      3: { halign: 'right', cellWidth: 100 },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore - lastAutoTable injected by autotable
  y = doc.lastAutoTable.finalY + 16;

  // Total — accent box right-aligned
  ensureSpace(46);
  const totalText = formatCurrency(Number(proposal.total_amount), proposal.currency);
  const totalLabelText = labels.grandTotal;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const totalValueWidth = doc.getTextWidth(totalText);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const totalLabelWidth = doc.getTextWidth(totalLabelText);
  const boxWidth = Math.max(totalValueWidth, totalLabelWidth) + 36;
  const boxX = pageWidth - margin - boxWidth;

  doc.setFillColor(ar, ag, ab);
  doc.roundedRect(boxX, y, boxWidth, 42, 6, 6, 'F');
  doc.setTextColor(255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(totalLabelText.toUpperCase(), boxX + boxWidth / 2, y + 14, { align: 'center' });
  doc.setFontSize(15);
  doc.text(totalText, boxX + boxWidth / 2, y + 32, { align: 'center' });
  y += 56;

  // Notes
  if (proposal.notes) {
    renderTextSection(labels.notes, proposal.notes);
  }

  // Terms
  if (proposal.terms) {
    renderTextSection(labels.terms, proposal.terms);
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer bar
    doc.setFillColor(sr, sg, sb);
    doc.rect(0, pageHeight - 14, pageWidth, 3, 'F');

    if (options.publicUrlBase) {
      const url = `${options.publicUrlBase}/p/${proposal.public_code}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(135);
      doc.text(`${labels.publicLink}: ${url}`, margin, pageHeight - 22);
    }
    doc.setFontSize(8);
    doc.setTextColor(135);
    doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }

  doc.save(`proposta-${proposal.public_code}.pdf`);
}
