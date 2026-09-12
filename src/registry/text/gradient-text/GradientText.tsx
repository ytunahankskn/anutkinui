"use client";

import { useId, useMemo } from "react";

export interface GradientTextProps {
  palette?: keyof typeof PALETTES;
  text?: string;
  /** Bir döngünün süresi (saniye). 0 = duraklat. */
  speed?: number;
  glow?: boolean;
  direction?: "horizontal" | "diagonal" | "vertical";
  pill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PALETTES = {
  aurora: { colors: ["#7c5cff", "#33e0c2", "#4b7bff", "#7c5cff"], bg: "#0d0e1a" },
  sunset: { colors: ["#ff7a59", "#ffd166", "#ff5ea8", "#ff7a59"], bg: "#1a0e10" },
  ocean: { colors: ["#2fd0ff", "#3a7bff", "#8affe0", "#2fd0ff"], bg: "#071018" },
  candy: { colors: ["#ff6ec7", "#7c5cff", "#5ce1ff", "#ff6ec7"], bg: "#160d1c" },
} as const;

export function GradientText({
  palette = "aurora",
  text = "Gradient in motion",
  speed = 2,
  glow = true,
  direction = "horizontal",
  pill = false,
  className,
  style,
}: GradientTextProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[palette] ?? PALETTES.aurora;
  const cls = `gt-${uid}`;

  const gradient = useMemo(() => {
    const angle = direction === "vertical" ? "180deg" : direction === "diagonal" ? "135deg" : "90deg";
    return `linear-gradient(${angle}, ${p.colors.join(", ")})`;
  }, [p, direction]);

  const bgSize = direction === "horizontal" ? "300% 100%" : direction === "vertical" ? "100% 300%" : "300% 300%";
  const running = speed > 0;
  const duration = Math.max(speed, 0.1);

  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-block", isolation: "isolate", ...style }}
    >
      <style>{`
        @keyframes ${cls}-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .${cls}-text {
          background-image: ${gradient};
          background-size: ${bgSize};
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ${cls}-flow ${duration}s ease-in-out infinite;
          animation-play-state: ${running ? "running" : "paused"};
        }
        .${cls}-pill {
          position: relative;
          display: inline-flex;
          padding: 0.85em 1.6em;
          border-radius: 999px;
          background: ${p.bg};
        }
        .${cls}-pill::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background-image: ${gradient};
          background-size: ${bgSize};
          animation: ${cls}-flow ${duration}s ease-in-out infinite;
          animation-play-state: ${running ? "running" : "paused"};
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
      {glow && (
        <span
          aria-hidden="true"
          className={`${cls}-text`}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: "blur(18px)",
            opacity: 0.6,
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
      {pill ? (
        <span className={`${cls}-pill`}>
          <span className={`${cls}-text`}>{text}</span>
        </span>
      ) : (
        <span className={`${cls}-text`}>{text}</span>
      )}
    </span>
  );
}
