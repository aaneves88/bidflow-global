/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  couponCode?: string
  appUrl?: string
}

const codeBox = {
  margin: '20px 0',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: '#F0FDFA',
  border: '1px dashed #06B6D4',
  textAlign: 'center' as const,
}

const codeText = {
  margin: '0',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '24px',
  letterSpacing: '2px',
  fontWeight: 700,
  color: '#0F172A',
}

const Email = ({
  firstName,
  couponCode = 'PROMOORCA20',
  appUrl = 'https://orca-mento.app',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>20% de desconto por 6 meses no Premium da Orca</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, um desconto pra continuar` : 'Um desconto pra continuar'}
        </Heading>
        <Text style={text}>
          Você já testou a <strong>Orca</strong> na prática. Para seguir sem
          limites, use o cupom abaixo no checkout do Premium:
        </Text>
        <Section style={codeBox}>
          <Text style={codeText}>{couponCode}</Text>
        </Section>
        <Text style={text}>
          <strong>20% de desconto por 6 meses</strong> — propostas e clientes
          ilimitados, PDF sem marca d'água e sua marca no link público.
        </Text>
        <CtaWithFallback href={`${appUrl}/pricing`} label="Assinar com desconto" />
        <Text style={text}>
          Dúvidas? É só responder este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu cupom de 20% no Premium da Orca 🐋',
  displayName: 'Cupom — 10 dias ou limite atingido',
  previewData: { firstName: 'Marina', couponCode: 'PROMOORCA20', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
