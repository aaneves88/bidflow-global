/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  clientName?: string
  proposalTitle?: string
  reason?: string
  appProposalUrl?: string
}

const Email = ({ clientName, proposalTitle, reason, appProposalUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Atualização sobre a proposta {proposalTitle || ''}</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Proposta recusada</Heading>
        <Text style={text}>
          <strong>{clientName || 'O cliente'}</strong> não seguiu adiante com a
          proposta {proposalTitle ? <strong>"{proposalTitle}"</strong> : ''}
          {' '}por enquanto.
        </Text>
        {reason ? (
          <Text style={text}>
            Motivo informado: <em>{reason}</em>
          </Text>
        ) : null}
        <Text style={text}>
          Sem drama — registramos como referência. Você pode reabrir, ajustar
          escopo e enviar uma nova versão a qualquer momento.
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
      ? `${client} recusou sua proposta`
      : 'Atualização sobre sua proposta'
  },
  displayName: 'Proposta recusada',
  previewData: {
    clientName: 'Marina',
    proposalTitle: 'Identidade visual completa',
    reason: 'Orçamento fora do esperado neste momento.',
    appProposalUrl: 'https://orca-mento.app/proposals/123',
  },
} satisfies TemplateEntry
