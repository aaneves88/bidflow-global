import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// O menu usa auth, traduções e o diálogo de suporte; aqui o que importa é só o
// comportamento da gaveta, então essas dependências entram simplificadas.
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAdmin: true,
    signOut: vi.fn(),
    user: { email: "teste@orca-mento.app" },
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt-BR" } }),
}));

vi.mock("@/components/SupportDialog", () => ({
  SupportDialog: () => null,
}));

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: width < 768,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function renderMenu() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
      </SidebarProvider>
    </MemoryRouter>,
  );
}

const sheet = () => document.querySelector('[data-sidebar="sheet"]');

beforeEach(() => {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("AppSidebar no celular", () => {
  beforeEach(() => setViewportWidth(390));

  it("fecha a gaveta ao tocar num item principal", async () => {
    renderMenu();
    expect(sheet()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    await waitFor(() => expect(sheet()).not.toBeNull());

    fireEvent.click(screen.getByRole("link", { name: /nav\.clients/ }));

    await waitFor(() => expect(sheet()).toBeNull());
  });

  it("fecha a gaveta ao tocar num item da administração", async () => {
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    await waitFor(() => expect(sheet()).not.toBeNull());

    fireEvent.click(screen.getByRole("link", { name: /nav\.admin/ }));

    await waitFor(() => expect(sheet()).toBeNull());
  });
});

describe("AppSidebar no computador", () => {
  beforeEach(() => setViewportWidth(1280));

  it("navega sem abrir nem fechar gaveta nenhuma", async () => {
    renderMenu();
    expect(sheet()).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: /nav\.clients/ }));

    await waitFor(() =>
      expect(document.querySelector('[data-sidebar="sidebar"]')).not.toBeNull(),
    );
    expect(sheet()).toBeNull();
  });
});
