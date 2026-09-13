"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

/**
 * Rendered via `next/script` `beforeInteractive` directly in the root layout
 * (not here — that strategy is only recognized by Next.js when it appears
 * literally inside `app/[locale]/layout.tsx`). Kept next to the provider it
 * belongs to so the two stay in sync.
 */
export const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"dark";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r;}catch(e){}})();`;

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* private browsing, etc. */
  }
  return "dark";
}

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? systemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Minimal `next-themes` replacement: same `attribute="class"` / localStorage
 * strategy, but without its internal inline `<script>` element, which React 19's
 * dev overlay flags ("script tag ... never executed when rendering on the
 * client") even though the script only ever needs to run once, pre-hydration.
 * The no-flash script runs via `next/script`'s `beforeInteractive` strategy in
 * the root layout instead, which Next.js injects directly into `<head>`
 * outside of React's normal reconciliation — so it isn't subject to that warning.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Reads localStorage in the lazy initializer (client-only mount), not an
  // effect — the server render always sees "dark", the client's first render
  // (hydration) resolves the real value. Nothing downstream renders `theme`
  // into DOM output before its own hydration-safe "mounted" check, so this
  // never produces a hydration mismatch.
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark" || e.newValue === "system")) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private browsing, etc. */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
