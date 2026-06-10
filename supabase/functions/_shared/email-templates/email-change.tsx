/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { CtaWithFallback, ORCA, Shell, h1, main, text } from './_brand.tsx'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a alteração de e-mail na Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>Confirme a alteração de e-mail</Heading>
        <Text style={text}>
          Você pediu para alterar o e-mail da sua conta na Orca. Confirme
          abaixo para concluir a mudança.
        </Text>

        <Section
          style={{
            backgroundColor: ORCA.mint,
            border: `1px solid ${ORCA.mintEdge}`,
            borderRadius: '12px',
            padding: '16px 20px',
            margin: '16px 0',
          }}
        >
          <Text style={{ ...text, margin: '0 0 6px', fontSize: '13px', color: ORCA.slateMuted }}>
            De
          </Text>
          <Text style={{ ...text, margin: '0 0 12px', fontWeight: 'bold', color: ORCA.deep }}>
            {oldEmail}
          </Text>
          <Text style={{ ...text, margin: '0 0 6px', fontSize: '13px', color: ORCA.slateMuted }}>
            Para
          </Text>
          <Text style={{ ...text, margin: 0, fontWeight: 'bold', color: ORCA.deep }}>
            {newEmail}
          </Text>
        </Section>

        <CtaWithFallback href={confirmationUrl} label="Confirmar alteração" />
        <Text style={text}>
          Se você não solicitou essa alteração, proteja sua conta agora — pode
          ser uma tentativa de acesso indevido.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export default EmailChangeEmail
