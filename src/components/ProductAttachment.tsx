import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signProductImages } from '@/lib/productImages';

export type AttachmentProduct = {
  id: string;
  name: string;
  description: string | null;
  image_urls: string[] | null;
};

const letter = (i: number) => String.fromCharCode(65 + (i % 26));

export function ProductAttachment({ products }: { products: AttachmentProduct[] }) {
  const { t } = useTranslation('public');
  const [signed, setSigned] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const out: Record<string, string[]> = {};
      for (const p of products) out[p.id] = await signProductImages(p.image_urls ?? []);
      if (alive) setSigned(out);
    })();
    return () => { alive = false; };
  }, [products]);

  if (!products.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('attachment.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((p, i) => (
          <div key={p.id} className="space-y-2">
            <h3 className="font-semibold">
              {t('attachment.product', { letter: letter(i) })} — {p.name}
            </h3>
            {p.description && (
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.description}</p>
            )}
            {!!signed[p.id]?.length && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {signed[p.id].map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={p.name} loading="lazy" className="aspect-square w-full rounded-md border object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
