"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentMeta, Control, ControlValue, ControlValues } from "@/registry/types";

interface Props {
  entry: ComponentMeta;
  values: ControlValues;
  onChange: (key: string, value: ControlValue) => void;
  onReset: () => void;
}

export function ControlsPanel({ entry, values, onChange, onReset }: Props) {
  const entries = Object.entries(entry.controls);
  return (
    <aside className="flex flex-col rounded-card border border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="mono-label">Props</span>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg">
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4" data-lenis-prevent>
        {entries.map(([key, control]) => (
          <Field key={key} name={key} control={control} value={values[key]} onChange={(v) => onChange(key, v)} />
        ))}
      </div>
    </aside>
  );
}

function Field({
  name,
  control,
  value,
  onChange,
}: {
  name: string;
  control: Control;
  value: ControlValue;
  onChange: (v: ControlValue) => void;
}) {
  const label = control.label ?? name;

  if (control.type === "number") {
    const v = Number(value);
    const pct = ((v - control.min) / (control.max - control.min)) * 100;
    const decimals = control.step && control.step < 1 ? String(control.step).split(".")[1]?.length ?? 2 : 0;
    return (
      <div>
        <Row label={label} value={v.toFixed(decimals)} />
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ "--pct": `${pct}%` } as React.CSSProperties}
          className="mt-2"
        />
      </div>
    );
  }

  if (control.type === "color") {
    const v = String(value);
    return (
      <div>
        <Row label={label} value={v} />
        <div className="mt-2 flex items-center gap-2">
          <label className="relative size-7 shrink-0 overflow-hidden rounded-md border border-border" style={{ background: v }}>
            <input
              type="color"
              value={v}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          <input
            value={v}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-full rounded-md border border-border bg-bg px-2 font-mono text-xs outline-none focus:border-border-strong"
          />
        </div>
      </div>
    );
  }

  if (control.type === "select") {
    const v = String(value);
    if (control.options.length <= 3) {
      return (
        <div>
          <Row label={label} />
          <div className="mt-2 grid gap-0.5 rounded-lg border border-border bg-bg p-0.5" style={{ gridTemplateColumns: `repeat(${control.options.length}, 1fr)` }}>
            {control.options.map((o) => (
              <button
                key={o}
                onClick={() => onChange(o)}
                className={cn(
                  "h-7 rounded-md text-xs capitalize transition-colors",
                  o === v ? "bg-chip text-fg ring-1 ring-border" : "text-fg-muted hover:text-fg",
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <Row label={label} />
        <select
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 h-8 w-full rounded-md border border-border bg-bg px-2 text-xs outline-none focus:border-border-strong"
        >
          {control.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (control.type === "boolean") {
    const v = Boolean(value);
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-muted">{label}</span>
        <button
          role="switch"
          aria-checked={v}
          onClick={() => onChange(!v)}
          className={cn("relative h-5 w-9 rounded-full transition-colors", v ? "bg-accent" : "bg-border-strong")}
        >
          <span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-transform", v ? "left-0.5 translate-x-4" : "left-0.5")} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <Row label={label} />
      <input
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-8 w-full rounded-md border border-border bg-bg px-2 text-xs outline-none focus:border-border-strong"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-fg-muted">{label}</span>
      {value !== undefined && <span className="font-mono text-[11px] text-fg-faint">{value}</span>}
    </div>
  );
}
