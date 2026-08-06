/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  reporterEmail?: string
  categoryLabel?: string
  description?: string
  pagePath?: string
  userAgent?: string
  createdAt?: string
  ticketId?: string
}

const Email = ({
  reporterEmail,
  categoryLabel,
  description,
  pagePath,
  userAgent,
  createdAt,
  ticketId,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>{`Novo report no Orca: ${categoryLabel ?? 'suporte'}`}</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Novo report de suporte</Heading>
        <Text style={text}>
          <strong>Categoria:</strong> {categoryLabel ?? '—'}<br />
          <strong>Usuário:</strong> {reporterEmail ?? '—'}<br />
          <strong>Página:</strong> {pagePath ?? '—'}<br />
          <strong>Data:</strong> {createdAt ?? '—'}<br />
          <strong>Navegador:</strong> {userAgent ?? '—'}<br />
          <strong>Ticket:</strong> {ticketId ?? '—'}
        </Text>
        <Text style={text}>
          <strong>Descrição</strong><br />
          {description ?? '—'}
        </Text>
        <Text style={text}>
          Responda pelo painel administrativo do Orca (Admin → Suporte).
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `[Orca-mento] Novo report: ${(data?.categoryLabel as string) || 'suporte'}`,
  displayName: 'Suporte — novo report',
  previewData: {
    reporterEmail: 'usuaria@exemplo.com',
    categoryLabel: 'Bug',
    description: 'O botão de salvar não responde.',
    pagePath: '/proposals/new',
    userAgent: 'Chrome 120 / macOS',
    createdAt: '06/08/2026 10:32',
    ticketId: '5f2c…',
  },
} satisfies TemplateEntry
