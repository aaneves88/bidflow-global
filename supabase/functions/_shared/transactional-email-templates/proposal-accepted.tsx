/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, ORCA, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  clientName?: string
  proposalTitle?: string
  proposalTotal?: string
  appProposalUrl?: string
}

const Email = ({ clientName, proposalTitle, proposalTotal, appProposalUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>
      🎉 {clientName || 'Seu cliente'} aceitou sua proposta
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>🎉 Proposta aceita!</Heading>
        <Text style={text}>
          Excelente notícia: <strong>{clientName || 'o cliente'}</strong>
          {' '}aceitou sua proposta{proposalTitle ? <> <strong>"{proposalTitle}"</strong></> : ''}.
        </Text>
        {proposalTotal ? (
          <Text style={{ ...text, fontSize: '20px', fontWeight: 'bold', color: ORCA.cyanDark, textAlign: 'center', margin: '16px 0' }}>
            {proposalTotal}
          </Text>
        ) : null}
        <Text style={text}>
          Hora de começar — combine os próximos passos diretamente com o
          cliente e atualize o status quando precisar.
        </Text>
        <CtaWithFallback href={appProposalUrl} label="Abrir proposta" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const client = (data as Props).clientName
    return client
      ? `🎉 ${client} aceitou sua proposta`
      : '🎉 Sua proposta foi aceita'
  },
  displayName: 'Proposta aceita',
  previewData: {
    clientName: 'Marina',
    proposalTitle: 'Identidade visual completa',
    proposalTotal: 'R$ 8.500,00',
    appProposalUrl: 'https://orca-mento.app/proposals/123',
  },
} satisfies TemplateEntry
