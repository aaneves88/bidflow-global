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
  appUrl?: string
}

const Email = ({ firstName, appUrl = 'https://orca-mento.app' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Bem-vinda à Orca — vamos criar sua primeira proposta 🐋</Preview>
    <Body style={main}>
      <Shell>
        <Heading style={h1}>
          {firstName ? `Que bom ter você, ${firstName}!` : 'Que bom ter você por aqui!'}
        </Heading>
        <Text style={text}>
          Sua conta na <strong>Orca</strong> está pronta. Daqui, você cria
          propostas profissionais em minutos, envia um link bonito para o
          cliente e acompanha cada visualização em tempo real.
        </Text>
        <Text style={text}>
          Para começar, sugerimos três passos rápidos:
        </Text>
        <Text style={text}>
          <strong>1.</strong> Cadastre seu primeiro cliente<br />
          <strong>2.</strong> Crie sua primeira proposta<br />
          <strong>3.</strong> Compartilhe o link público com o cliente
        </Text>
        <CtaWithFallback href={`${appUrl}/dashboard`} label="Abrir a Orca" />
        <Text style={text}>
          Qualquer dúvida, é só responder este e-mail — a gente lê todas.
        </Text>
      </Shell>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Bem-vinda à Orca 🐋',
  displayName: 'Boas-vindas',
  previewData: { firstName: 'Marina', appUrl: 'https://orca-mento.app' },
} satisfies TemplateEntry
