"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, ComponentMeta } from "@/registry/types";
import { localizedDescription } from "@/registry/types";
import { ComponentCard } from "./ComponentCard";

type Sort = "popular" | "recent";

export function BrowseGrid({ entries, categories }: { entries: ComponentMeta[]; categories: Category[] }) {
  const t = useTranslations("browse");
  const locale = useLocale();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => category === "all" || e.category === category)
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          localizedDescription(e, locale).toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q)),
      )
      .sort((a, b) =>
        sort === "popular" ? b.popularity - a.popularity : b.createdAt.localeCompare(a.createdAt),
      );
  }, [entries, category, query, sort, locale]);

  const chips = [{ slug: "all", label: t("all") }, ...categories.map((c) => ({ slug: c.slug, label: c.label }))];

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <LayoutGroup id="browse-chips">
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={cn(
                    "relative h-8 rounded-lg px-3 text-[13px] transition-colors",
                    active ? "text-bg" : "border border-border bg-bg-elev text-fg-muted hover:text-fg",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="chip-bg"
                      className="absolute inset-0 rounded-lg bg-fg"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="flex items-center gap-2">
          <label className="flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-bg-elev px-2.5 text-sm md:w-56">
            <Search size={14} className="text-fg-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder", { count: entries.length })}
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-fg-faint"
            />
          </label>
          <div className="flex rounded-lg border border-border bg-bg-elev p-0.5">
            {(["popular", "recent"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs capitalize transition-colors",
                  sort === s ? "bg-chip text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {s === "popular" ? t("sortPopular") : t("sortRecent")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div layout className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((e, i) => (
            <ComponentCard key={`${e.category}/${e.slug}`} entry={e} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && <p className="mt-16 text-center text-sm text-fg-muted">{t("empty", { query })}</p>}
    </div>
  );
}
