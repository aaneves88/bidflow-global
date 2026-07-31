/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, ORCA, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  clientName?: string
  proposalTitle?: string
  proposalTotal?: string
  vendorName?: string
  signedAt?: string
  publicUrl?: string
}

const Email = ({
  clientName,
  proposalTitle,
  proposalTotal,
  vendorName,
  signedAt,
  publicUrl = 'https://orca-mento.app',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>
      Cópia da sua proposta aceita{proposalTitle ? ` - ${proposalTitle}` : ''}
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Cópia da sua proposta aceita</Heading>
        <Text style={text}>
          Olá{clientName ? <> <strong>{clientName}</strong></> : ''}, confirmamos
          que você aceitou a proposta
          {proposalTitle ? <> <strong>"{proposalTitle}"</strong></> : ''}
          {vendorName ? <> de <strong>{vendorName}</strong></> : ''}
          {signedAt ? <> em <strong>{signedAt}</strong></> : ''}.
        </Text>
        {proposalTotal ? (
          <Text style={{ ...text, fontSize: '20px', fontWeight: 'bold', color: ORCA.cyanDark, textAlign: 'center', margin: '16px 0' }}>
            {proposalTotal}
          </Text>
        ) : null}
        <Text style={text}>
          Guarde este email como comprovante. Você pode consultar a proposta
          completa a qualquer momento pelo link abaixo.
        </Text>
        <CtaWithFallback href={publicUrl} label="Ver proposta" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const title = (data as Props).proposalTitle
    return title
      ? `Cópia da sua proposta aceita - ${title}`
      : 'Cópia da sua proposta aceita'
  },
  displayName: 'Cópia para o cliente',
  previewData: {
    clientName: 'Marina',
    proposalTitle: 'Identidade visual completa',
    proposalTotal: 'R$ 8.500,00',
    vendorName: 'Studio Azul',
    signedAt: '10/06/2026 às 14:32',
    publicUrl: 'https://orca-mento.app/p/abc123',
  },
} satisfies TemplateEntry
