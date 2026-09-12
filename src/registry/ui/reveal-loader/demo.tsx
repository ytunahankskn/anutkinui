"use client";

import { useState } from "react";
import type { ControlValues } from "@/registry/types";
import { RevealLoader, PALETTES, type RevealLoaderProps } from "./RevealLoader";

const NAV_LINKS = ["Product", "Pricing", "Docs"];

export default function Demo(values: ControlValues) {
  const props = values as unknown as RevealLoaderProps;
  const p = PALETTES[props.palette ?? "noir"] ?? PALETTES.noir;
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: p.bg }}>
      {/* sahte mini-site: navbar */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid color-mix(in oklab, ${p.ink} 12%, transparent)`,
        }}
      >
        <div data-loader-target style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="36" height="36" rx="10" fill={p.accent} />
            <rect x="13" y="13" width="14" height="14" rx="3" fill={p.bg} transform="rotate(45 20 20)" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: p.ink }}>
            {props.logoText ?? "anutkinui"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {NAV_LINKS.map((label) => (
            <span key={label} style={{ fontSize: 12.5, color: p.ink, opacity: 0.6 }}>
              {label}
            </span>
          ))}
        </div>
      </nav>

      {/* sahte mini-site: hero iskeleti */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "88px 32px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
          <div
            style={{
              height: 20,
              width: "80%",
              borderRadius: 6,
              background: `color-mix(in oklab, ${p.ink} 16%, transparent)`,
            }}
          />
          <div
            style={{
              height: 20,
              width: "55%",
              borderRadius: 6,
              background: `color-mix(in oklab, ${p.ink} 16%, transparent)`,
            }}
          />
          <div
            style={{
              height: 12,
              width: "65%",
              marginTop: 8,
              borderRadius: 6,
              background: `color-mix(in oklab, ${p.ink} 10%, transparent)`,
            }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, flex: 1 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                background: `color-mix(in oklab, ${p.ink} 8%, transparent)`,
                border: `1px solid color-mix(in oklab, ${p.ink} 12%, transparent)`,
              }}
            />
          ))}
        </div>
      </div>

      <RevealLoader key={replayKey} {...props} scope="container" />

      <button
        type="button"
        onClick={() => setReplayKey((k) => k + 1)}
        className="mono-label"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 60,
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid color-mix(in oklab, ${p.ink} 25%, transparent)`,
          background: "transparent",
          color: p.ink,
          cursor: "pointer",
        }}
      >
        Replay
      </button>
    </div>
  );
}
