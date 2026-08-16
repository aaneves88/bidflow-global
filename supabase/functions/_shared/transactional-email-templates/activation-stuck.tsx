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
    <Preview>Travou em algo para criar sua primeira proposta?</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, travou em alguma coisa?` : 'Travou em alguma coisa?'}
        </Heading>
        <Text style={text}>
          Vi que sua conta na <strong>Orca</strong> já está criada, mas a
          primeira proposta ainda não saiu. Isso costuma acontecer por um
          detalhe bobo — e é rápido de resolver.
        </Text>
        <Text style={text}>
          Criar a primeira proposta leva uns 3 minutos:
        </Text>
        <Text style={text}>
          <strong>1.</strong> Cadastre o cliente (só nome e e-mail já bastam)<br />
          <strong>2.</strong> Adicione os itens e o valor<br />
          <strong>3.</strong> Compartilhe o link público
        </Text>
        <CtaWithFallback href={`${appUrl}/proposals/new`} label="Criar minha primeira proposta" />
        <Text style={text}>
          Se algo não ficou claro, é só <strong>responder este e-mail</strong>{' '}
          contando onde você parou. A gente responde pessoalmente e, se
          precisar, monta a primeira proposta junto com você.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Precisa de ajuda com sua primeira proposta? 🐋',
  displayName: 'Ativação 48h — sem proposta',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
