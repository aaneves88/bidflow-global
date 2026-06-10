/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para a Orca</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Text style={brand}>Orca</Text></Section>
        <Heading style={h1}>Você foi convidado</Heading>
        <Text style={text}>
          Você foi convidado para participar da{' '}
          <Link href={siteUrl} style={link}><strong>Orca</strong></Link>.
          Clique no botão abaixo para aceitar o convite e criar sua conta.
        </Text>
        <Button style={button} href={confirmationUrl}>Aceitar convite</Button>
        <Text style={footer}>
          Se não estava esperando este convite, pode ignorar este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const header = { borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }
const brand = { fontSize: '20px', fontWeight: 'bold' as const, color: '#06B6D4', margin: 0, letterSpacing: '-0.02em' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0F172A', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: '#06B6D4', textDecoration: 'underline' }
const button = { backgroundColor: '#06B6D4', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0', lineHeight: '1.5' }
