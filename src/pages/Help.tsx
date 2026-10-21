import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getHelpVideos, HELP_VIDEO_CATEGORIES, LibraryVideo, videoSource } from '@/content/tutorialVideos';

function HelpVideo({ video }: { video: LibraryVideo }) {
  const { t } = useTranslation(['common', 'admin']);
  const [failed, setFailed] = useState(false);
  const src = videoSource(video);
  const title = t(`admin:videos.items.${video.key}.title`);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-4">
        <div className="mx-auto aspect-[9/16] w-full max-w-64 overflow-hidden rounded-md bg-muted">
          {src && !failed ? (
            <video
              src={src}
              aria-label={title}
              controls
              controlsList="nodownload"
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <div role="status" className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {t('help.unavailable')}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{t(`admin:videos.items.${video.key}.description`)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Help() {
  const { t } = useTranslation('common');
  const videos = getHelpVideos();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold">{t('help.title')}</h1>
      {HELP_VIDEO_CATEGORIES.map((category) => {
        const Icon = category === 'tutorials' ? BookOpen : Lightbulb;
        return (
          <section key={category} aria-labelledby={`help-${category}`} className="space-y-4">
            <h2 id={`help-${category}`} className="flex items-center gap-2 text-lg font-semibold">
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
              {t(`help.categories.${category}`)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {videos.filter((video) => video.category === category).map((video) => (
                <HelpVideo key={video.key} video={video} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}