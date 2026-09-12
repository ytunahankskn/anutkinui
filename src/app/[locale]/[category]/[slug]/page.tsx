import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Playground } from "@/components/detail/Playground";
import { highlight } from "@/lib/highlight";
import { formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCategory, getEntry, getNeighbors, registry, sourceKey } from "@/registry";
import { localizedDescription } from "@/registry/types";
import sources from "@/registry/__generated__/sources.json";

type Params = Promise<{ locale: string; category: string; slug: string }>;
type Sources = Record<string, { name: string; code: string }[]>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => registry.map((e) => ({ locale, category: e.category, slug: e.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const entry = getEntry(category, slug);
  if (!entry) return {};
  return { title: entry.name, description: localizedDescription(entry, locale) };
}

export default async function ComponentPage({ params }: { params: Params }) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("detail");
  const entry = getEntry(category, slug);
  const cat = getCategory(category);
  if (!entry || !cat) notFound();

  const raw = (sources as Sources)[sourceKey(entry)] ?? [];
  const files = await Promise.all(raw.map(async (f) => ({ ...f, html: await highlight(f.code, f.name) })));
  const { prev, next } = getNeighbors(entry);

  const propRows = Object.entries(entry.controls).map(([key, c]) => ({
    key,
    type: c.type === "select" ? c.options.join(" | ") : c.type,
    def: String(c.default),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-muted">
        <Link href="/browse" className="hover:text-fg">
          {t("breadcrumbBrowse")}
        </Link>
        <span className="text-fg-faint">/</span>
        <span>{cat.label}</span>
      </div>

      <header className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {entry.name}
            {entry.pro && <Badge tone="pro">Pro</Badge>}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-fg-muted">
            <span className="text-fg">{cat.label}</span> • {localizedDescription(entry, locale)}
          </p>
          {entry.family && <p className="mt-1 text-[13px] text-fg-faint">{t("variantOf", { family: entry.family })}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {entry.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <span className="mx-1 text-fg-faint">·</span>
            {entry.runtime.map((r) => (
              <Badge key={r} tone="accent">
                {r}
              </Badge>
            ))}
            <span className="mx-1 text-fg-faint">·</span>
            <span className="font-mono text-[11px] text-fg-faint">♥ {formatNumber(entry.popularity)}</span>
          </div>
        </div>
      </header>

      <div className="mt-8">
        <Playground entry={entry} files={files} />
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t("aboutTitle", { name: entry.name })}</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            {t("aboutBody", {
              name: entry.name,
              category: cat.label.toLowerCase(),
              runtime: entry.runtime.join(" + "),
              controls: Object.keys(entry.controls).join(", "),
            })}
          </p>
          <p className="mt-3 text-sm text-fg-muted">{localizedDescription(cat, locale)}</p>
        </div>
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-bg-elev">
              <tr className="mono-label">
                <th className="px-3 py-2 font-normal">{t("propKey")}</th>
                <th className="px-3 py-2 font-normal">{t("propType")}</th>
                <th className="px-3 py-2 font-normal">{t("propDefault")}</th>
              </tr>
            </thead>
            <tbody>
              {propRows.map((r) => (
                <tr key={r.key} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{r.key}</td>
                  <td className="px-3 py-2 font-mono text-xs text-fg-muted">{r.type}</td>
                  <td className="px-3 py-2 font-mono text-xs text-fg-muted">{r.def}</td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{t("dependencies")}</td>
                <td className="px-3 py-2 font-mono text-xs text-fg-muted" colSpan={2}>
                  {entry.dependencies.join(", ")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
        <Link href={`/${prev.category}/${prev.slug}`} className="group flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>
            <span className="mono-label block">{t("previous")}</span>
            {prev.name}
          </span>
        </Link>
        <Link href={`/${next.category}/${next.slug}`} className="group flex items-center gap-2 text-right text-sm text-fg-muted hover:text-fg">
          <span>
            <span className="mono-label block">{t("next")}</span>
            {next.name}
          </span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </div>
  );
}
