import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useUnseenViews, markViewsAsSeen } from '@/hooks/useUnseenViews';
import { formatDateTime } from '@/lib/format';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationsBell() {
  const { t } = useTranslation('common');
  const { data: unseen } = useUnseenViews();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const count = unseen?.length ?? 0;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && count > 0) {
      markViewsAsSeen();
      qc.invalidateQueries({ queryKey: ['unseen-views'] });
    }
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
          {count === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">{t('notifications.empty')}</p>
          ) : (
            <div className="divide-y">
              {unseen!.map((v, i) => (
                <button
                  key={`${v.proposal_id}-${i}`}
                  onClick={() => { setOpen(false); markViewsAsSeen(); qc.invalidateQueries({ queryKey: ['unseen-views'] }); navigate(`/proposals/${v.proposal_id}`); }}
                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3"
                >
                  <Eye className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{v.proposal_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.client_name ? t('notifications.viewedBy', { name: v.client_name }) : t('notifications.viewed')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(v.viewed_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
