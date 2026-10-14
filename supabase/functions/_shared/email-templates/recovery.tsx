/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { CtaWithFallback, Shell, h1, main, text } from './_brand.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Redefinir sua senha da Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos um pedido para redefinir a senha da sua conta na Orca.
          Use o botão abaixo para criar uma nova senha. O link expira em
          1 hora.
        </Text>
        <CtaWithFallback href={confirmationUrl} label="Redefinir senha" />
        <Text style={text}>
          Se você não solicitou essa alteração, pode ignorar este e-mail — sua
          senha continua a mesma.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default RecoveryEmail
