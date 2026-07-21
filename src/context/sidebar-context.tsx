"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar:collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the mobile drawer whenever the route changes (adjusting state during
  // render instead of in an effect, per https://react.dev/learn/you-might-not-need-an-effect)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle: () => setCollapsed(!collapsed),
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
