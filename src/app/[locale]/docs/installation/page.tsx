import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { highlight } from "@/lib/highlight";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Installation" };

const DEPS = `pnpm add three @react-three/fiber @react-three/drei gsap @gsap/react motion lenis
pnpm add -D @types/three`;

const USAGE = `import { GlassKnot } from "@/registry/hero/glass-knot/GlassKnot";

export default function Page() {
  return (
    <section style={{ height: "100vh", position: "relative" }}>
      <GlassKnot shape="knot" ior={1.3} title="Build interfaces that move." />
    </section>
  );
}`;

export default async function Installation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");
  const [depsHtml, usageHtml] = await Promise.all([highlight(DEPS, "install.bash"), highlight(USAGE, "page.tsx")]);

  const reqRows: [string, string][] = [
    [t("reqReactDom"), ">= 19"],
    [t("reqNext"), ">= 15 (App Router)"],
    [t("reqThree"), "r186"],
    [t("reqBrowser"), t("reqWebgl")],
  ];

  return (
    <article className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <p className="mono-label">{t("kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{t("intro", { name: site.name })}</p>

      <Step n={1} title={t("step1Title")}>
        <p>{t("step1Body")}</p>
        <Code html={depsHtml} />
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>
            <b className="text-fg">{t("step1ThreeLabel")}</b> — {t("step1ThreeDesc")}
          </li>
          <li>
            <b className="text-fg">{t("step1GsapLabel")}</b> — {t("step1GsapDesc")}
          </li>
          <li>
            <b className="text-fg">{t("step1MotionLabel")}</b> — {t("step1MotionDesc")}
          </li>
          <li>
            <b className="text-fg">{t("step1LenisLabel")}</b> — {t("step1LenisDesc")}
          </li>
        </ul>
      </Step>

      <Step n={2} title={t("step2Title")}>
        <p>
          {t.rich("step2Body", {
            code: (chunks) => <b className="text-fg">{chunks}</b>,
            path: () => (
              <code className="rounded bg-chip px-1 py-0.5 font-mono text-xs">src/registry/&lt;category&gt;/&lt;slug&gt;/</code>
            ),
          })}
        </p>
      </Step>

      <Step n={3} title={t("step3Title")}>
        <p>{t("step3Body")}</p>
        <Code html={usageHtml} />
      </Step>

      <Step n={4} title={t("step4Title")}>
        <p>
          {t.rich("step4Body", {
            path: () => <code className="rounded bg-chip px-1 py-0.5 font-mono text-xs">src/providers/SmoothScroll.tsx</code>,
          })}
        </p>
      </Step>

      <div className="mt-10 rounded-card border border-border bg-bg-elev p-4 text-sm text-fg-muted">
        <p className="mono-label mb-2">{t("requirementsTitle")}</p>
        <table className="w-full text-left text-[13px]">
          <tbody>
            {reqRows.map(([k, v]) => (
              <tr key={k} className="border-t border-border first:border-0">
                <td className="py-1.5 font-mono text-xs">{k}</td>
                <td className="py-1.5 font-mono text-xs text-fg-faint">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 flex gap-4">
      <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-fg font-mono text-[11px] text-bg">{n}</span>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-fg-muted [&>p]:mb-3">
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-fg">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Code({ html }: { html: string }) {
  return (
    <div
      className="my-3 overflow-x-auto rounded-card border border-border bg-bg-elev py-3 text-[12.5px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
