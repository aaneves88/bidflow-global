import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LOGOS = [
  { key: 'principal', file: 'orca-logo-principal', bgHint: 'light' },
  { key: 'escura', file: 'orca-logo-escura-transparente', bgHint: 'light' },
  { key: 'clara', file: 'orca-logo-clara-transparente', bgHint: 'dark' },
] as const;

const PALETTE = [
  { key: 'slate', hex: '#0F172A' },
  { key: 'ink', hex: '#0B1220' },
  { key: 'cyan', hex: '#06B6D4' },
  { key: 'mint', hex: '#E8FBF5' },
  { key: 'surface', hex: '#F1F5F9' },
  { key: 'green', hex: '#22C55E' },
] as const;

async function download(url: string, name: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export default function AdminBrand() {
  const { t } = useTranslation('admin');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t('brand.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('brand.subtitle')}</p>
      </div>

      <section className="space-y-3">
        <h3 className="font-medium">{t('brand.logos')}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOGOS.map((logo) => {
            const url512 = `/marketing/marca/${logo.file}-512.png`;
            return (
              <Card key={logo.key}>
                <CardContent className="space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-center rounded-md border bg-[#F8FAFC] p-4">
                      <img src={url512} alt={t(`brand.versions.${logo.key}.name`)} className="h-20 w-20 object-contain" />
                    </div>
                    <div className="flex items-center justify-center rounded-md border bg-[#0F172A] p-4">
                      <img src={url512} alt={t(`brand.versions.${logo.key}.name`)} className="h-20 w-20 object-contain" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t(`brand.versions.${logo.key}.name`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`brand.versions.${logo.key}.usage`)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => download(url512, `${logo.file}-512.png`)}>
                      <Download className="mr-2 h-4 w-4" />512px
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => download(`/marketing/marca/${logo.file}-1024.png`, `${logo.file}-1024.png`)}
                    >
                      <Download className="mr-2 h-4 w-4" />1024px
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">{t('brand.palette')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => copy(c.hex)}
              className="overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md"
            >
              <div className="h-16 w-full" style={{ backgroundColor: c.hex }} />
              <div className="space-y-0.5 p-2">
                <p className="text-xs font-medium">{t(`brand.colors.${c.key}`)}</p>
                <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  {c.hex}
                  {copied === c.hex ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">{t('brand.rules')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-medium">{t('brand.doTitle')}</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {(['d1', 'd2', 'd3'] as const).map((k) => (
                  <li key={k}>{t(`brand.do.${k}`)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-medium">{t('brand.dontTitle')}</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {(['n1', 'n2', 'n3'] as const).map((k) => (
                  <li key={k}>{t(`brand.dont.${k}`)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
