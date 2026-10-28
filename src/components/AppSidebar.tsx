import { LayoutDashboard, Users, FileText, Package, LibraryBig, Settings, Shield, LogOut, CreditCard, UserCircle, Gift, CircleHelp, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { SupportDialog } from '@/components/SupportDialog';
import { FeedbackDialog } from '@/components/FeedbackDialog';


export function AppSidebar() {
  const { t } = useTranslation('common');
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  // No mobile o menu é uma gaveta (Sheet) que fica sobre a tela; em desktop é
  // barra fixa colapsável, então lá o clique não muda nada.
  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };


  const groups = [
    { label: t('nav.groupMain'), items: [
      { title: t('nav.dashboard'), url: '/dashboard', icon: LayoutDashboard },
      { title: t('nav.proposals'), url: '/proposals', icon: FileText },
      { title: t('nav.clients'), url: '/clients', icon: Users },
      { title: t('nav.products'), url: '/products', icon: Package },
    ]},
    { label: t('nav.groupResources'), items: [
      { title: t('nav.snippets'), url: '/snippets', icon: LibraryBig },
      { title: t('nav.help'), url: '/ajuda', icon: CircleHelp },
    ]},
    { label: t('nav.groupAccount'), items: [
      { title: t('nav.pricing'), url: '/app/planos', icon: CreditCard },
      { title: t('nav.referrals'), url: '/app/indique', icon: Gift },
      { title: t('nav.account'), url: '/account', icon: UserCircle },
      { title: t('nav.settings'), url: '/settings', icon: Settings },
    ]},
  ];
  const adminItems = [
    { title: t('nav.admin'), url: '/admin', icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span className="font-bold text-base">Orca</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Button asChild size="sm" className="w-full" title={t('nav.newProposal')}>
              <NavLink to="/proposals/new" onClick={closeMobileMenu}>
                <Plus className="h-4 w-4" />
                {!collapsed && <span className="ml-1">{t('nav.newProposal')}</span>}
              </NavLink>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{!collapsed && g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url) && !(item.url === '/proposals' && location.pathname === '/proposals/new')}>
                      <NavLink to={item.url} onClick={closeMobileMenu} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{!collapsed && t('nav.administration')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} onClick={closeMobileMenu} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground truncate px-2 mb-1">{user.email}</p>
        )}
        {!collapsed && <SupportDialog />}
        {!collapsed && <FeedbackDialog mode="manual" />}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && t('nav.signOut')}
        </Button>
      </SidebarFooter>

    </Sidebar>
  );
}
