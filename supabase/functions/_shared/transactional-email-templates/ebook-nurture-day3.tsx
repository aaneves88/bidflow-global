/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  appUrl?: string
}

const formulaBox = {
  margin: '20px 0',
  padding: '18px 20px',
  borderRadius: '12px',
  backgroundColor: '#F0FDFA',
  border: '1px solid #CCFBF1',
}

const formulaText = {
  margin: '0',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#0F172A',
}

const Email = ({ firstName, appUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>A fórmula de precificação do capítulo 1, com um exemplo real</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, a fórmula na prática` : 'A fórmula de precificação, na prática'}
        </Heading>
        <Text style={text}>
          O capítulo 1 do e-book é o que mais muda o preço de quem aplica. Em
          uma linha:
        </Text>
        <Section style={formulaBox}>
          <Text style={formulaText}>
            preço/hora = (custo fixo ÷ horas produtivas) + custo direto + margem
          </Text>
        </Section>
        <Text style={text}>
          O detalhe que quase todo mundo erra: <strong>horas produtivas não são
          160 por mês</strong>. Entre orçamento, reunião, retrabalho e
          administração, o real fica entre <strong>90 e 110 horas</strong>.
        </Text>
        <Text style={text}>
          Exemplo rápido: custo fixo de R$ 3.000 ÷ 100 horas = R$ 30/h só pra
          empatar. Some R$ 5/h de custo direto e 30% de margem → <strong>R$ 45,50
          a hora</strong>. Quem divide por 160 cobra R$ 30 e acha que está
          lucrando.
        </Text>
        <Text style={text}>
          Na Orca você monta o orçamento já com esse preço, envia por link e
          acompanha quando o cliente abre.
        </Text>
        <CtaWithFallback
          href={`${appUrl}/register`}
          label="Criar minha conta grátis e já montar meu primeiro orçamento"
        />
        <Text style={text}>
          Dúvida em algum ponto da fórmula? É só responder este e-mail.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'A fórmula de precificação, aplicada',
  displayName: 'E-book — dia 3 (reforço capítulo 1)',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
