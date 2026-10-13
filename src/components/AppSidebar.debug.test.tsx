import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const screenState = vi.hoisted(() => ({ mobile: true }));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => screenState.mobile,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAdmin: true, signOut: vi.fn(), user: { email: "t@t.t" } }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "pt-BR" } }),
}));
vi.mock("@/components/SupportDialog", () => ({ SupportDialog: () => null }));

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function Probe() {
  const { isMobile, openMobile } = useSidebar();
  return <span data-testid="probe">{`isMobile=${isMobile} openMobile=${openMobile}`}</span>;
}

describe("debug", () => {
  it("shows sidebar state", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger />
          <Probe />
        </SidebarProvider>
      </MemoryRouter>,
    );
    console.log("BEFORE:", screen.getByTestId("probe").textContent);
    console.log("sheet before:", !!document.querySelector('[data-sidebar="sheet"]'));
    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    console.log("AFTER:", screen.getByTestId("probe").textContent);
    console.log("sheet after:", !!document.querySelector('[data-sidebar="sheet"]'));
    console.log("data-sidebar attrs:", [...document.querySelectorAll("[data-sidebar]")].map((e) => e.getAttribute("data-sidebar")).join(","));
    console.log("body tail:", document.body.innerHTML.slice(-600));
    expect(true).toBe(true);
  });
});
