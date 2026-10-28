/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { CtaWithFallback, Shell, h1, main, text } from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  appUrl?: string
}

const Email = ({ firstName, appUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Seu Premium da Orca ficou pela metade</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, faltou só um passo` : 'Faltou só um passo'}
        </Heading>
        <Text style={text}>
          Você começou a assinar o <strong>Premium da Orca</strong>, mas o pagamento não foi concluído.
        </Text>
        <Text style={text}>
          Com o Premium você tem propostas e clientes ilimitados, PDF sem marca d'água e a sua marca no link que o cliente abre.
        </Text>
        <CtaWithFallback href={`${appUrl}/pricing`} label="Concluir minha assinatura" />
        <Text style={text}>
          Teve algum problema no pagamento? Escreva para statematch@statematch.global que a gente ajuda (este endereço não recebe respostas).
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu Premium da Orca ficou pela metade',
  displayName: 'Resgate — pagamento não concluído',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
