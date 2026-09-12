"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribeNoop = () => () => {};
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const options = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Hydration güvenli "mounted" bayrağı: sunucuda false, istemcide true
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const current = mounted ? theme : "dark";

  return (
    <div className="grid grid-cols-3 rounded-lg border border-border bg-bg-sunken p-0.5">
      {options.map(({ id, label, Icon }) => {
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={cn(
              "relative flex h-7 items-center justify-center gap-1.5 rounded-md text-xs transition-colors",
              active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-md bg-bg-elev shadow-sm ring-1 ring-border"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon size={12} className="relative" />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
