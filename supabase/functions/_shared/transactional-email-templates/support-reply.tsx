/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  categoryLabel?: string
  originalMessage?: string
  replyMessage?: string
  appUrl?: string
}

const Email = ({
  categoryLabel,
  originalMessage,
  replyMessage,
  appUrl = 'https://orca-mento.app',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Resposta da equipe Orca ao seu report</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Resposta da equipe Orca</Heading>
        <Text style={text}>
          Recebemos seu report{categoryLabel ? ` (${categoryLabel})` : ''} e aqui vai
          nossa resposta:
        </Text>
        <Text style={text}>{replyMessage ?? '—'}</Text>
        {originalMessage ? (
          <Text style={text}>
            <strong>Seu report original</strong><br />
            {originalMessage}
          </Text>
        ) : null}
        <CtaWithFallback href={`${appUrl}/dashboard`} label="Abrir a Orca" />
        <Text style={text}>
          Se precisar de mais alguma coisa, é só responder este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '[Orca-mento] Resposta ao seu report',
  displayName: 'Suporte — resposta',
  previewData: {
    categoryLabel: 'Bug',
    originalMessage: 'O botão de salvar não responde.',
    replyMessage: 'Corrigimos o problema, pode testar novamente.',
    appUrl: 'https://orca-mento.app',
  },
} satisfies TemplateEntry
