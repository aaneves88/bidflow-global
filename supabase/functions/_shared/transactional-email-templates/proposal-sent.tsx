/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import {
  CtaWithFallback,
  ORCA,
  Shell,
  h1,
  main,
  text,
} from '../email-templates/_brand.tsx'

interface Props {
  clientName?: string
  senderName?: string
  proposalTitle?: string
  proposalTotal?: string
  publicUrl?: string
  validUntil?: string
}

const Email = ({
  clientName,
  senderName,
  proposalTitle,
  proposalTotal,
  publicUrl = 'https://orca-mento.app',
  validUntil,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>
      {senderName ? `${senderName} ` : ''}
      enviou uma proposta para você
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {clientName ? `Olá, ${clientName}` : 'Olá!'}
        </Heading>
        <Text style={text}>
          {senderName ? <strong>{senderName}</strong> : 'Sua proposta'} preparou
          uma proposta para você. Você pode ver os detalhes, aceitar e até
          assinar digitalmente direto pelo link abaixo.
        </Text>

        <Section
          style={{
            backgroundColor: '#F8FAFC',
            border: `1px solid ${ORCA.border}`,
            borderRadius: '12px',
            padding: '16px 20px',
            margin: '16px 0',
          }}
        >
          <Text style={{ ...text, margin: '0 0 6px', fontSize: '13px', color: ORCA.slateMuted }}>
            Proposta
          </Text>
          <Text style={{ ...text, margin: '0 0 12px', fontWeight: 'bold', color: ORCA.deep, fontSize: '16px' }}>
            {proposalTitle || 'Sua proposta'}
          </Text>
          {proposalTotal ? (
            <>
              <Text style={{ ...text, margin: '0 0 4px', fontSize: '13px', color: ORCA.slateMuted }}>
                Valor total
              </Text>
              <Text style={{ ...text, margin: 0, fontWeight: 'bold', color: ORCA.cyanDark, fontSize: '18px' }}>
                {proposalTotal}
              </Text>
            </>
          ) : null}
          {validUntil ? (
            <Text style={{ ...text, margin: '12px 0 0', fontSize: '13px', color: ORCA.slateMuted }}>
              Válida até <strong style={{ color: ORCA.slateText }}>{validUntil}</strong>
            </Text>
          ) : null}
        </Section>

        <CtaWithFallback href={publicUrl} label="Ver proposta" />

        <Text style={text}>
          Qualquer dúvida, é só responder este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const sender = (data as Props).senderName
    return sender
      ? `${sender} enviou uma proposta para você`
      : 'Você recebeu uma nova proposta'
  },
  displayName: 'Proposta enviada (para o cliente)',
  previewData: {
    clientName: 'Marina',
    senderName: 'Studio Onda',
    proposalTitle: 'Identidade visual completa',
    proposalTotal: 'R$ 8.500,00',
    publicUrl: 'https://orca-mento.app/p/abc123',
    validUntil: '30/06/2026',
  },
} satisfies TemplateEntry
