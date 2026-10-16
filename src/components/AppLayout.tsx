import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BrandingStyle } from '@/components/BrandingStyle';
import { NotificationsBell } from '@/components/NotificationsBell';
import { OfflineBanner } from '@/components/OfflineBanner';
import { InstallAppBanner } from '@/components/InstallAppBanner';
import { BrandUpsellBanner } from '@/components/BrandUpsellBanner';
import { FeedbackDialog } from '@/components/FeedbackDialog';
import { useFeedbackPrompt } from '@/hooks/useFeedbackPrompt';

import orcaMark from '@/assets/brand/orca-mark-sm.png';

export function AppLayout({ children }: { children: ReactNode }) {
  useTranslation();
  const feedback = useFeedbackPrompt();
  return (
    <SidebarProvider>
      <BrandingStyle />
      {feedback.threshold !== null && (
        <FeedbackDialog
          mode="prompt"
          open={feedback.open}
          onOpenChange={feedback.setOpen}
          days={feedback.threshold}
        />
      )}
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <OfflineBanner />
          <InstallAppBanner />

          {/* The logged-in shell always shows the Orca brand. Users see their
              own brand on proposal previews / public links / PDFs. */}
          <header className="h-14 flex items-center border-b px-4 gap-3 pt-safe">
            <SidebarTrigger className="mr-2" />
            <img
              src={orcaMark}
              alt="Orca — propostas e orçamentos"
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="h-7 w-7 object-contain"
            />
            <span className="font-semibold text-lg truncate flex-1">Orca</span>
            <NotificationsBell />
          </header>
          <main className="flex-1 p-4 md:p-6 pb-safe">
            {children}
            {/* Spacer so the floating upsell pill never covers the last action on a page (e.g. "Criar proposta"). */}
            <div aria-hidden className="h-20" />

          </main>
          <BrandUpsellBanner />
        </div>
      </div>
    </SidebarProvider>
  );
}

