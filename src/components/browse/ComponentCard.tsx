"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { demos } from "@/registry/demos";
import { sourceKey } from "@/registry";
import { Link } from "@/i18n/navigation";
import { defaultValues, localizedDescription, type ComponentMeta } from "@/registry/types";

export function ComponentCard({ entry, index }: { entry: ComponentMeta; index: number }) {
  const [hover, setHover] = useState(false);
  const locale = useLocale();
  const Demo = demos[sourceKey(entry)];
  const values = useMemo(() => defaultValues(entry), [entry]);
  const [from, to] = entry.cover;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/${entry.category}/${entry.slug}`} className="block">
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-card border border-border bg-bg-sunken transition-colors group-hover:border-border-strong"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* Kapak */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(80% 60% at 30% 100%, rgba(255,255,255,.18), transparent 60%)" }}
          />
          <div className="bg-grid absolute inset-0 opacity-30 [--border:rgba(255,255,255,.12)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white/90">
            <span className="font-mono text-xs tracking-wide">
              {entry.componentName}
              {entry.family && <span className="text-white/50"> / {entry.name.split(" — ")[1]}</span>}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 opacity-0 transition-opacity group-hover:opacity-100">
              live
            </span>
          </div>

          {/* Hover'da canlı demo */}
          {hover && Demo && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Demo {...values} />
            </motion.div>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 px-1 pt-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-medium tracking-tight">{entry.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-fg-muted">{localizedDescription(entry, locale)}</p>
          </div>
          {entry.pro && <Badge tone="pro">Pro</Badge>}
        </div>
        <div className="mt-2 flex flex-wrap gap-1 px-1">
          {entry.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}
