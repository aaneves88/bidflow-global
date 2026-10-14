/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { CtaWithFallback, Shell, h1, main, text } from './_brand.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Você foi convidada para a Orca 🐋</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Você foi convidada</Heading>
        <Text style={text}>
          Alguém convidou você para usar a <strong>Orca</strong> — o CRM de
          propostas que ajuda pequenos negócios a fechar mais clientes com
          menos esforço.
        </Text>
        <Text style={text}>
          Aceite o convite abaixo para criar sua conta e começar.
        </Text>
        <CtaWithFallback href={confirmationUrl} label="Aceitar convite" />
        <Text style={text}>
          Se você não estava esperando este convite, pode ignorar este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default InviteEmail
