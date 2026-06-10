/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  clientName?: string
  proposalTitle?: string
  appProposalUrl?: string
  viewedAt?: string
}

const Email = ({ clientName, proposalTitle, appProposalUrl = 'https://orca-mento.app', viewedAt }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>
      {clientName || 'Seu cliente'} acabou de visualizar sua proposta
    </Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>👀 Sua proposta foi vista</Heading>
        <Text style={text}>
          <strong>{clientName || 'O cliente'}</strong> acabou de abrir a
          proposta <strong>"{proposalTitle || 'sem título'}"</strong>
          {viewedAt ? ` em ${viewedAt}` : ''}.
        </Text>
        <Text style={text}>
          É um bom momento para fazer um follow-up — talvez uma mensagem rápida
          perguntando se ficou alguma dúvida.
        </Text>
        <CtaWithFallback href={appProposalUrl} label="Ver proposta na Orca" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => {
    const client = (data as Props).clientName
    return client
      ? `👀 ${client} visualizou sua proposta`
      : '👀 Sua proposta foi visualizada'
  },
  displayName: 'Proposta visualizada',
  previewData: {
    clientName: 'Marina',
    proposalTitle: 'Identidade visual completa',
    appProposalUrl: 'https://orca-mento.app/proposals/123',
    viewedAt: 'há instantes',
  },
} satisfies TemplateEntry
