/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { Shell, code, h1, main, text } from './_brand.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const RecoveryEmail = ({ token }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Seu código para redefinir a senha da Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos um pedido para redefinir a senha da sua conta na Orca.
          Digite o código abaixo na tela "Esqueci minha senha" do app:
        </Text>
        <Text style={code}>{token ?? ''}</Text>
        <Text style={text}>
          O código vale por 1 hora. Se você não solicitou essa alteração, pode
          ignorar este e-mail — sua senha continua a mesma.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default RecoveryEmail
