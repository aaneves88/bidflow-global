/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  clientName?: string
  proposalTitle?: string
  proposalTotal?: string
  daysWaiting?: number
  wasViewed?: boolean
  appProposalUrl?: string
  whatsappUrl?: string
}

const Email = ({
  firstName,
  clientName,
  proposalTitle,
  proposalTotal,
  daysWaiting = 2,
  wasViewed = false,
  appProposalUrl = 'https://orca-mento.app',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>
      {`${proposalTitle || 'Sua proposta'} está há ${daysWaiting} dias sem resposta`}
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, hora do follow-up` : 'Hora do follow-up'}
        </Heading>
        <Text style={text}>
          A proposta <strong>"{proposalTitle || 'sem título'}"</strong>
          {clientName ? <> para <strong>{clientName}</strong></> : null}
          {proposalTotal ? <> ({proposalTotal})</> : null} está há{' '}
          <strong>{daysWaiting} dias</strong> sem resposta.
        </Text>
        <Text style={text}>
          {wasViewed
            ? 'O cliente já abriu o link — ou seja, tem interesse. Uma mensagem curta agora costuma destravar a decisão.'
            : 'O cliente ainda não abriu o link. Vale reenviar pelo WhatsApp: muita proposta simplesmente se perde na caixa de entrada.'}
        </Text>
        <Text style={text}>
          Sugestão de mensagem:<br />
          <em>
            "Oi{clientName ? ` ${clientName}` : ''}! Passando pra saber se você
            conseguiu ver a proposta e se ficou alguma dúvida. Posso ajustar o
            que precisar."
          </em>
        </Text>
        <CtaWithFallback href={appProposalUrl} label="Abrir proposta na Orca" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const d = data as Props
    return d.clientName
      ? `⏰ ${d.clientName} ainda não respondeu sua proposta`
      : '⏰ Sua proposta está sem resposta'
  },
  displayName: 'Follow-up de proposta sem resposta',
  previewData: {
    firstName: 'Antonio',
    clientName: 'Marina',
    proposalTitle: 'Identidade visual completa',
    proposalTotal: 'R$ 4.500,00',
    daysWaiting: 2,
    wasViewed: true,
    appProposalUrl: 'https://orca-mento.app/proposals/123',
  },
} satisfies TemplateEntry
