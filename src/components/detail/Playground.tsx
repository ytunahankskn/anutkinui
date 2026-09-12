"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, RotateCcw } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { CopyButton } from "@/components/ui/CopyButton";
import { buildUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { demos } from "@/registry/demos";
import { sourceKey } from "@/registry";
import { defaultValues, type ComponentMeta, type ControlValues } from "@/registry/types";
import { ControlsPanel } from "./ControlsPanel";

export interface SourceFile {
  name: string;
  code: string;
  html: string;
}

export function Playground({ entry, files }: { entry: ComponentMeta; files: SourceFile[] }) {
  const t = useTranslations("playground");
  const [values, setValues] = useState<ControlValues>(() => defaultValues(entry));
  const [replay, setReplay] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const Demo = demos[sourceKey(entry)];
  const mainFile = files[0]?.name ?? `${entry.componentName}.tsx`;
  const usage = buildUsage(entry, values, mainFile);
  const installCmd = `pnpm add ${entry.dependencies.join(" ")}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_272px]">
        <div
          ref={frame}
          className="relative aspect-[16/10] overflow-hidden rounded-card border border-border bg-bg-sunken [&:fullscreen]:aspect-auto [&:fullscreen]:rounded-none"
        >
          {Demo ? <Demo key={replay} {...values} /> : <p className="p-6 text-sm text-fg-muted">{t("noDemo")}</p>}
          <div className="absolute right-3 top-3 z-20 flex gap-1">
            <FrameButton title="Replay" onClick={() => setReplay((n) => n + 1)}>
              <RotateCcw size={13} />
            </FrameButton>
            <FrameButton title="Fullscreen" onClick={() => frame.current?.requestFullscreen?.()}>
              <Maximize2 size={13} />
            </FrameButton>
          </div>
        </div>

        <ControlsPanel
          entry={entry}
          values={values}
          onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
          onReset={() => {
            setValues(defaultValues(entry));
            setReplay((n) => n + 1);
          }}
        />
      </div>

      <Tabs
        tabs={[
          {
            id: "usage",
            label: t("usageTab"),
            content: (
              <CodeShell name="Scene.tsx" copy={usage}>
                <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fg">
                  <code>{usage}</code>
                </pre>
              </CodeShell>
            ),
          },
          {
            id: "code",
            label: t("codeTab"),
            content: <SourceTabs files={files} noSourceLabel={t("noSource")} />,
          },
          {
            id: "install",
            label: t("installTab"),
            content: (
              <ol className="flex flex-col gap-4">
                <Step n={1} title={t("installStep1Title")}>
                  <CodeShell name="terminal" copy={installCmd}>
                    <pre className="p-4 font-mono text-[12.5px] text-fg">
                      <code>{installCmd}</code>
                    </pre>
                  </CodeShell>
                </Step>
                <Step n={2} title={t("installStep2Title")}>
                  <p className="text-sm text-fg-muted">
                    {t("installStep2Body", {
                      path: `src/registry/${entry.category}/${entry.slug}/`,
                      files: files.map((f) => f.name).join(", "),
                    })}
                  </p>
                </Step>
                <Step n={3} title={t("installStep3Title")}>
                  <p className="text-sm text-fg-muted">{t("installStep3Body")}</p>
                </Step>
              </ol>
            ),
          },
        ]}
      />
    </div>
  );
}

function FrameButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="grid size-7 place-items-center rounded-md border border-white/10 bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
    >
      {children}
    </button>
  );
}

function CodeShell({ name, copy, children }: { name: string; copy: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] text-fg-muted">{name}</span>
        <CopyButton text={copy} />
      </div>
      {children}
    </div>
  );
}

function SourceTabs({ files, noSourceLabel }: { files: SourceFile[]; noSourceLabel: string }) {
  const [active, setActive] = useState(0);
  const file = files[active];
  if (!file) return <p className="text-sm text-fg-muted">{noSourceLabel}</p>;
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex gap-0.5">
          {files.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setActive(i)}
              className={cn(
                "h-7 rounded-md px-2 font-mono text-[11px] transition-colors",
                i === active ? "bg-chip text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
        <CopyButton text={file.code} />
      </div>
      <div
        className="max-h-[560px] overflow-auto py-3 text-[12.5px] leading-relaxed [&_pre]:font-mono"
        data-lenis-prevent
        dangerouslySetInnerHTML={{ __html: file.html }}
      />
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-fg font-mono text-[10px] text-bg">{n}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}
