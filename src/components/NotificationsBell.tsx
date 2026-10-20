import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Eye, MessageCircle } from 'lucide-react';
import { whatsAppUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useUnseenViews, markViewsAsSeen } from '@/hooks/useUnseenViews';
import { formatDateTime } from '@/lib/format';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationsBell() {
  const { t } = useTranslation('common');
  const { data: views } = useUnseenViews();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = views ?? [];
  const count = list.filter((v) => !v.seen).length;

  const markRead = () => {
    if (count > 0) {
      markViewsAsSeen();
      qc.invalidateQueries({ queryKey: ['unseen-views'] });
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) markRead();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <p className="text-sm font-semibold">{t('notifications.title')}</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">{t('notifications.empty')}</p>
          ) : (
            <div className="divide-y">
              {list.map((v, i) => {
                const wa = whatsAppUrl(
                  v.client_phone,
                  t('notifications.whatsappMessage', { name: v.client_name ?? '', title: v.proposal_title }),
                );
                return (
                <div key={`${v.proposal_id}-${i}`} className={v.seen ? '' : 'bg-primary/5'}>
                <button
                  onClick={() => { setOpen(false); markRead(); navigate(`/proposals/${v.proposal_id}`); }}
                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3"
                >
                  <Eye className={`h-4 w-4 mt-0.5 shrink-0 ${v.seen ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{v.proposal_title}</p>
                      {!v.seen && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] shrink-0">
                          {t('notifications.new')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {v.client_name ? t('notifications.viewedBy', { name: v.client_name }) : t('notifications.viewed')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(v.viewed_at)}</p>
                  </div>
                </button>
                {wa && (
                  <div className="px-3 pb-3 pl-10">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-1 h-3.5 w-3.5" />
                        {t('notifications.whatsapp')}
                      </a>
                    </Button>
                  </div>
                )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

