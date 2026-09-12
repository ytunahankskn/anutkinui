"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ tabs, initial, className }: { tabs: Tab[]; initial?: string; className?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const layoutId = useId();
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative px-3 py-2 text-sm transition-colors",
              t.id === active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {t.label}
            {t.id === active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-fg"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4">{current?.content}</div>
    </div>
  );
}
