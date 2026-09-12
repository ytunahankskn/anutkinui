"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex rounded-lg border border-border bg-bg p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={cn(
            "h-6 rounded-md px-2 font-mono text-[11px] uppercase transition-colors",
            l === locale ? "bg-chip text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
