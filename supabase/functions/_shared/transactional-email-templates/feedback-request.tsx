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
    <Preview>Uma semana de Orca — como está sendo?</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, como está sendo?` : 'Como está sendo?'}
        </Heading>
        <Text style={text}>
          Faz uma semana que você criou sua conta na <strong>Orca</strong> e a
          gente quer muito saber como tem sido a experiência.
        </Text>
        <Text style={text}>
          Está fácil de usar? Encontrou algum problema? Precisa de ajuda com
          alguma coisa? Tem alguma sugestão de melhoria?
        </Text>
        <Text style={text}>
          É só <strong>responder este e-mail</strong> contando pra gente — sua
          mensagem cai direto com a nossa equipe, que responde pessoalmente e
          resolve o que for preciso.
        </Text>
        <CtaWithFallback href={`${appUrl}/dashboard`} label="Abrir a Orca" />
        <Text style={text}>
          Obrigado por estar com a gente. 🐋
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Uma semana de Orca — como está sendo? 🐋',
  displayName: 'Feedback 7 dias',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
