/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  appUrl?: string
}

const Email = ({ firstName, appUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Primeira proposta criada — veja o que vem agora</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `Parabéns, ${firstName}! 🎉` : 'Parabéns pela primeira proposta! 🎉'}
        </Heading>
        <Text style={text}>
          Sua primeira proposta na <strong>Orca</strong> já está no ar. Esse é o
          passo que a maioria adia — e você já fez.
        </Text>
        <Text style={text}>
          O que acontece a partir daqui:
        </Text>
        <Text style={text}>
          <strong>•</strong> Você é avisada quando o cliente <strong>abre</strong> a proposta<br />
          <strong>•</strong> Também avisamos quando ele <strong>aprova</strong> ou assina<br />
          <strong>•</strong> Tudo fica registrado no painel, com o status de cada proposta
        </Text>
        <CtaWithFallback href={`${appUrl}/proposals`} label="Acompanhar minhas propostas" />
        <Text style={text}>
          Ficou alguma dúvida sobre envio, PDF, PIX ou personalização da marca?
          É só <strong>responder este e-mail</strong> — a gente lê e responde
          todas.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Sua primeira proposta está no ar 🎉',
  displayName: 'Ativação 48h — com proposta',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
