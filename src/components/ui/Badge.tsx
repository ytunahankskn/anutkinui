import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "pro" };

export function Badge({ className, tone = "neutral", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[5px] border px-1.5 font-mono text-[10px] tracking-wide",
        tone === "neutral" && "border-border bg-chip text-fg-muted",
        tone === "accent" && "border-transparent bg-accent/15 text-accent",
        tone === "pro" && "border-transparent bg-fg text-bg font-semibold uppercase",
        className,
      )}
      {...props}
    />
  );
}
