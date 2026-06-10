/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { Shell, code, h1, main, text } from './_brand.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Seu código de verificação da Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Seu código de verificação</Heading>
        <Text style={text}>
          Use o código abaixo para confirmar sua identidade na Orca:
        </Text>
        <Text style={code}>{token}</Text>
        <Text style={text}>
          O código expira em poucos minutos. Se você não solicitou esta
          verificação, pode ignorar este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default ReauthenticationEmail
