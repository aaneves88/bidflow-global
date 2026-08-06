import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { Download, Loader2, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type Asset = {
  url: string;
  name: string;
  width?: number;
  height?: number;
};

// Lista dinâmica: qualquer arquivo novo em public/marketing/ aparece aqui automaticamente.
const files = Object.keys(
  import.meta.glob('/public/marketing/*.{png,jpg,jpeg,webp,gif,svg}')
).sort();

function toUrl(path: string) {
  return path.replace(/^\/public/, '');
}

async function downloadUrl(url: string, name: string) {
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

export default function AdminMarketing() {
  const { t } = useTranslation('admin');
  const [assets, setAssets] = useState<Asset[]>(
    files.map((f) => ({ url: toUrl(f), name: f.split('/').pop() as string }))
  );
  const [preview, setPreview] = useState<Asset | null>(null);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    assets.forEach((asset, index) => {
      if (asset.width) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setAssets((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], width: img.naturalWidth, height: img.naturalHeight };
          return next;
        });
      };
      img.src = asset.url;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { portrait, landscape } = useMemo(() => {
    const portrait: Asset[] = [];
    const landscape: Asset[] = [];
    for (const a of assets) {
      if (a.width && a.height && a.width > a.height) landscape.push(a);
      else portrait.push(a);
    }
    return { portrait, landscape };
  }, [assets]);

  const downloadAll = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        assets.map(async (a) => {
          const res = await fetch(a.url);
          zip.file(a.name, await res.blob());
        })
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = 'orca-materiais.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      toast({ title: t('marketing.zipError'), variant: 'destructive' });
    } finally {
      setZipping(false);
    }
  };

  const renderGrid = (items: Asset[]) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((asset) => (
        <Card key={asset.url} className="overflow-hidden">
          <button
            type="button"
            onClick={() => setPreview(asset)}
            className="block w-full bg-muted"
            aria-label={asset.name}
          >
            <img
              src={asset.url}
              alt={asset.name}
              loading="lazy"
              className="h-40 w-full object-contain transition-transform hover:scale-[1.02]"
            />
          </button>
          <CardContent className="space-y-2 p-3">
            <p className="truncate text-sm font-medium" title={asset.name}>
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {asset.width ? `${asset.width} × ${asset.height} px` : '—'}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => downloadUrl(asset.url, asset.name)}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('marketing.download')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('marketing.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('marketing.subtitle')}</p>
        </div>
        {assets.length > 0 && (
          <Button onClick={downloadAll} disabled={zipping}>
            {zipping ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('marketing.downloadAll')}
          </Button>
        )}
      </div>

      {assets.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('marketing.empty')}</p>
      )}

      {portrait.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{t('marketing.mobile')}</h3>
            <Badge variant="secondary">{portrait.length}</Badge>
          </div>
          {renderGrid(portrait)}
        </section>
      )}

      {landscape.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{t('marketing.desktop')}</h3>
            <Badge variant="secondary">{landscape.length}</Badge>
          </div>
          {renderGrid(landscape)}
        </section>
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate text-base">{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <img
                src={preview.url}
                alt={preview.name}
                className="mx-auto max-h-[70vh] w-auto rounded-md border"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {preview.width ? `${preview.width} × ${preview.height} px` : ''}
                </span>
                <Button size="sm" onClick={() => downloadUrl(preview.url, preview.name)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('marketing.download')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
