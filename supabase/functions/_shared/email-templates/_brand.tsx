/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Container,
  Hr,
  Img,
  Link,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

// Shared brand kit for ALL Orca emails (auth + transactional).
// Keep tokens here in sync with src/index.css and src/assets/brand/.

export const ORCA = {
  name: 'Orca',
  tagline: 'CRM de propostas',
  url: 'https://orca-mento.app',
  // CDN URL of the orca mascot, served from Lovable Assets.
  logoUrl:
    'https://orca-mento.app/__l5e/assets-v1/a11affce-f92c-41ef-8ff0-03f3191be367/orca-mark.png',
  // Ocean palette
  deep: '#0F172A',
  cyan: '#06B6D4',
  cyanDark: '#0891B2',
  mint: '#F0FDFA',
  mintEdge: '#CCFBF1',
  slateText: '#475569',
  slateMuted: '#94A3B8',
  border: '#E2E8F0',
}

// ------- Reusable style objects -------

export const main = {
  backgroundColor: '#F8FAFC',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: '32px 0',
}

export const container = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: `1px solid ${ORCA.border}`,
  padding: '0',
  margin: '0 auto',
  maxWidth: '560px',
  overflow: 'hidden' as const,
}

export const headerSection = {
  textAlign: 'center' as const,
  padding: '32px 28px 20px',
}

export const headerImg = {
  margin: '0 auto',
  display: 'block',
}

export const wordmark = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: ORCA.cyan,
  margin: '12px 0 0',
  letterSpacing: '-0.02em',
  textAlign: 'center' as const,
}

export const gradientBar = {
  height: '4px',
  width: '100%',
  // CSS gradients are widely supported now (Apple Mail, Gmail web, iOS).
  // Falls back to flat cyan elsewhere because of backgroundColor.
  backgroundColor: ORCA.cyan,
  backgroundImage: `linear-gradient(90deg, ${ORCA.cyan} 0%, ${ORCA.mintEdge} 100%)`,
  borderRadius: '0',
}

export const body = {
  padding: '28px 32px 8px',
}

export const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: ORCA.deep,
  margin: '0 0 16px',
  lineHeight: '1.3',
  letterSpacing: '-0.01em',
}

export const text = {
  fontSize: '15px',
  color: ORCA.slateText,
  lineHeight: '1.65',
  margin: '0 0 16px',
}

export const link = {
  color: ORCA.cyanDark,
  textDecoration: 'underline',
}

// CTA card — gives the action room to breathe.
export const ctaBox = {
  backgroundColor: ORCA.mint,
  border: `1px solid ${ORCA.mintEdge}`,
  borderRadius: '12px',
  padding: '24px',
  margin: '8px 0 20px',
  textAlign: 'center' as const,
}

export const button = {
  backgroundColor: ORCA.cyan,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.25)',
}

export const fallbackLink = {
  fontSize: '12px',
  color: ORCA.slateMuted,
  margin: '0 0 8px',
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
}

export const fallbackUrl = {
  fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  fontSize: '11px',
  color: ORCA.slateText,
  wordBreak: 'break-all' as const,
}

export const code = {
  fontFamily: 'Menlo, Consolas, "Courier New", monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: ORCA.deep,
  letterSpacing: '0.3em',
  margin: '8px 0 24px',
  padding: '20px 24px',
  backgroundColor: ORCA.mint,
  border: `1px solid ${ORCA.mintEdge}`,
  borderRadius: '12px',
  textAlign: 'center' as const,
}

export const divider = {
  borderColor: ORCA.border,
  margin: '24px 0',
}

export const footerSection = {
  padding: '0 32px 32px',
  textAlign: 'center' as const,
}

export const footerText = {
  fontSize: '12px',
  color: ORCA.slateMuted,
  lineHeight: '1.6',
  margin: '0 0 6px',
}

export const footerLink = {
  color: ORCA.slateMuted,
  textDecoration: 'underline',
}

// ------- Reusable partials -------

export const Header = () => (
  <>
    <Section style={headerSection}>
      <Img
        src={ORCA.logoUrl}
        alt="Orca"
        width="64"
        height="64"
        style={headerImg}
      />
      <Text style={wordmark}>Orca</Text>
    </Section>
    <Section style={gradientBar} />
  </>
)

export const Footer = ({ signature }: { signature?: string } = {}) => (
  <Section style={footerSection}>
    <Hr style={divider} />
    {signature ? <Text style={footerText}>{signature}</Text> : null}
    <Text style={footerText}>
      <strong style={{ color: ORCA.slateText }}>{ORCA.name}</strong> · {ORCA.tagline}
    </Text>
    <Text style={footerText}>
      <Link href={ORCA.url} style={footerLink}>
        orca-mento.app
      </Link>
    </Text>
  </Section>
)

// Helper to render a CTA + fallback URL block (used in most auth templates).
export const CtaWithFallback = ({
  href,
  label,
  fallbackLabel = 'Se o botão não funcionar, copie e cole o link abaixo no navegador:',
}: {
  href: string
  label: string
  fallbackLabel?: string
}) => (
  <>
    <Section style={ctaBox}>
      <a href={href} style={button}>
        {label}
      </a>
    </Section>
    <Text style={fallbackLink}>{fallbackLabel}</Text>
    <Text style={fallbackUrl}>{href}</Text>
  </>
)

export const Shell = ({ children }: { children: React.ReactNode }) => (
  <Container style={container}>
    <Header />
    <Section style={body}>{children}</Section>
    <Footer />
  </Container>
)
