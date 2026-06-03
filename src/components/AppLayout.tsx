import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BrandingStyle } from '@/components/BrandingStyle';
import { useBranding } from '@/hooks/useBranding';

export function AppLayout({ children }: { children: ReactNode }) {
  useTranslation();
  const { logoUrl, companyName } = useBranding();
  return (
    <SidebarProvider>
      <BrandingStyle />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 gap-3">
            <SidebarTrigger className="mr-2" />
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-7 w-auto object-contain" />
            ) : null}
            <span className="font-semibold text-lg truncate">
              {companyName || 'CloseFlow'}
            </span>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
