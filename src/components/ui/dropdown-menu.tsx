"use client";

import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu subcomponent must be within <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const { open, setOpen } = useDropdown();

  if (asChild) {
    return (
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return (
    <button onClick={() => setOpen(!open)} type="button">
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}) {
  const { open, setOpen } = useDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  const alignClass = {
    start: "left-0",
    end: "right-0",
    center: "left-1/2 -translate-x-1/2",
  }[align];

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1 shadow-lg",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled,
  destructive,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const { setOpen } = useDropdown();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
        destructive
          ? "text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)]"
          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-[hsl(var(--border))]" />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]",
        className
      )}
    >
      {children}
    </p>
  );
}
