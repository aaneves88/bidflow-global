import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Controla diretamente se a tela é considerada celular ou computador.
const screenState = vi.hoisted(() => ({ mobile: false }));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => screenState.mobile,
}));

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

// No celular a gaveta é uma folha (Sheet) marcada com data-mobile="true".
const drawer = () => document.querySelector('[data-sidebar="sidebar"][data-mobile="true"]');
const openDrawer = async () => {
  fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
  await waitFor(() => expect(drawer()).not.toBeNull());
};

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
  beforeEach(() => {
    screenState.mobile = true;
  });

  it("fecha a gaveta ao tocar num item principal", async () => {
    renderMenu();
    expect(drawer()).toBeNull();

    await openDrawer();
    fireEvent.click(screen.getByRole("link", { name: /nav\.clients/ }));

    await waitFor(() => expect(drawer()).toBeNull());
  });

  it("fecha a gaveta ao tocar num item da administração", async () => {
    renderMenu();

    await openDrawer();
    fireEvent.click(screen.getByRole("link", { name: /nav\.admin/ }));

    await waitFor(() => expect(drawer()).toBeNull());
  });
});

describe("AppSidebar no computador", () => {
  beforeEach(() => {
    screenState.mobile = false;
  });

  it("navega sem abrir nem fechar gaveta nenhuma", async () => {
    renderMenu();
    expect(drawer()).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: /nav\.clients/ }));

    await waitFor(() =>
      expect(document.querySelector('[data-sidebar="sidebar"]')).not.toBeNull(),
    );
    expect(drawer()).toBeNull();
  });
});
