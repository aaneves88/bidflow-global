import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TUTORIAL_VIDEOS } from '@/content/tutorialVideos';

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

export default function AdminVideos() {
  const { t } = useTranslation('admin');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('videos.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('videos.subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TUTORIAL_VIDEOS.map((v) => (
          <Card key={v.key}>
            <CardContent className="space-y-3 p-4">
              {v.asset ? (
                <video src={v.asset.url} controls preload="metadata" className="aspect-[9/16] w-full rounded-md bg-muted object-contain" />
              ) : (
                <div className="flex aspect-[9/16] w-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                  {t('videos.pending')}
                </div>
              )}
              <div>
                <h3 className="font-medium">{t(`videos.items.${v.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`videos.items.${v.key}.description`)}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full" disabled={!v.asset} onClick={() => v.asset && download(v.asset.url, v.file)}>
                <Download className="mr-2 h-4 w-4" />
                {t('videos.download')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
