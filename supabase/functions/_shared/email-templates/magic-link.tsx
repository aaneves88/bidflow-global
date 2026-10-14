/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { CtaWithFallback, Shell, h1, main, text } from './_brand.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Seu link de acesso à Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Seu link de acesso</Heading>
        <Text style={text}>
          Clique no botão abaixo para entrar na Orca. Por segurança, este link
          expira em alguns minutos e só pode ser usado uma vez.
        </Text>
        <CtaWithFallback href={confirmationUrl} label="Entrar na Orca" />
        <Text style={text}>
          Se você não solicitou este link, pode ignorar este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default MagicLinkEmail
