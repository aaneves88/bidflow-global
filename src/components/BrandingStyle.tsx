import { useBranding } from '@/hooks/useBranding';

/**
 * Injects brand colors as CSS variables. These are used only on brand-visible
 * surfaces (public proposal, PDF, settings preview) — NOT on the shadcn UI
 * tokens, to keep the app shell consistent and accessible.
 */
export function BrandingStyle() {
  const { primaryColor, secondaryColor, accentColor } = useBranding();
  return (
    <style>{`
      :root {
        --brand-primary: ${primaryColor};
        --brand-secondary: ${secondaryColor};
        --brand-accent: ${accentColor};
      }
    `}</style>
  );
}
