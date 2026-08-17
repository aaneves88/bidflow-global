/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import {
  CtaWithFallback,
  Shell,
  h1,
  main,
  text,
} from '../email-templates/_brand.tsx'

interface Props {
  firstName?: string
  downloadUrl?: string
  appUrl?: string
}

const Email = ({
  firstName,
  downloadUrl = 'https://orca-mento.app/ebook',
  appUrl = 'https://orca-mento.app',
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head><meta charSet="utf-8" /></Head>
    <Preview>Seu e-book: Como Parar de Perder Clientes no Orçamento 🐋</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `${firstName}, seu e-book chegou!` : 'Seu e-book chegou!'}
        </Heading>
        <Text style={text}>
          Aqui está o <strong>Como Parar de Perder Clientes no Orçamento</strong>,
          o guia gratuito da Orca com a fórmula de precificação, os 6 itens que
          toda proposta precisa ter, os 4 tipos de cliente e como fazer
          follow-up sem parecer chato.
        </Text>
        <CtaWithFallback href={downloadUrl} label="Baixar o e-book (PDF)" />
        <Text style={text}>
          Dica: depois de ler, coloque em prática direto na Orca — dá para
          montar uma proposta profissional em poucos minutos e acompanhar
          quando o cliente abre o link.
        </Text>
        <CtaWithFallback href={appUrl} label="Conhecer a Orca" />
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu e-book gratuito: Como Parar de Perder Clientes no Orçamento 🐋',
  displayName: 'Entrega do e-book',
  previewData: {
    firstName: 'Marina',
    downloadUrl: 'https://orca-mento.app/ebook',
    appUrl: 'https://orca-mento.app',
  },
} satisfies TemplateEntry
