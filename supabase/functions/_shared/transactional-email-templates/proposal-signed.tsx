/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, ORCA, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  signerName?: string
  proposalTitle?: string
  proposalTotal?: string
  signedAt?: string
  appProposalUrl?: string
}

const Email = ({ signerName, proposalTitle, proposalTotal, signedAt, appProposalUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>
      ✍️ {signerName || 'Seu cliente'} assinou a proposta
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>✍️ Proposta assinada</Heading>
        <Text style={text}>
          <strong>{signerName || 'O cliente'}</strong> assinou digitalmente a
          proposta {proposalTitle ? <strong>"{proposalTitle}"</strong> : ''}
          {signedAt ? <> em <strong>{signedAt}</strong></> : ''}.
        </Text>
        {proposalTotal ? (
          <Text style={{ ...text, fontSize: '20px', fontWeight: 'bold', color: ORCA.cyanDark, textAlign: 'center', margin: '16px 0' }}>
            {proposalTotal}
          </Text>
        ) : null}
        <Text style={text}>
          O comprovante de assinatura fica disponível na proposta e no PDF
          gerado.
        </Text>
        <CtaWithFallback href={appProposalUrl} label="Ver proposta assinada" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const signer = (data as Props).signerName
    return signer
      ? `✍️ ${signer} assinou sua proposta`
      : '✍️ Sua proposta foi assinada'
  },
  displayName: 'Proposta assinada',
  previewData: {
    signerName: 'Marina Souza',
    proposalTitle: 'Identidade visual completa',
    proposalTotal: 'R$ 8.500,00',
    signedAt: '10/06/2026 às 14:32',
    appProposalUrl: 'https://orca-mento.app/proposals/123',
  },
} satisfies TemplateEntry
