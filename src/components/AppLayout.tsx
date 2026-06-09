import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BrandingStyle } from '@/components/BrandingStyle';
import { NotificationsBell } from '@/components/NotificationsBell';
import orcaMark from '@/assets/brand/orca-mark.png';

export function AppLayout({ children }: { children: ReactNode }) {
  useTranslation();
  return (
    <SidebarProvider>
      <BrandingStyle />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* The logged-in shell always shows the Orca brand. Users see their
              own brand on proposal previews / public links / PDFs. */}
          <header className="h-14 flex items-center border-b px-4 gap-3">
            <SidebarTrigger className="mr-2" />
            <img src={orcaMark} alt="Orca" className="h-7 w-auto object-contain" />
            <span className="font-semibold text-lg truncate flex-1">Orca</span>
            <NotificationsBell />
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
