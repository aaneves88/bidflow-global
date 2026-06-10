/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { CtaWithFallback, Shell, h1, main, text } from './_brand.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail para começar a usar a Orca 🐋</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Bem-vinda à Orca 🐋</Heading>
        <Text style={text}>
          Que bom ter você por aqui. Estamos quase prontos — falta só confirmar
          que <strong>{recipient}</strong> é mesmo seu e-mail.
        </Text>
        <Text style={text}>
          Depois disso, você cria sua primeira proposta em poucos minutos,
          compartilha um link bonito com o cliente e acompanha cada visualização.
        </Text>
        <CtaWithFallback href={confirmationUrl} label="Confirmar meu e-mail" />
        <Text style={text}>
          Se você não criou esta conta, pode ignorar este e-mail com segurança.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default SignupEmail
