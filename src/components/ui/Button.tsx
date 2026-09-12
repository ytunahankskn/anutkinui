import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function Button({ className, variant = "outline", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
        variant === "solid" && "border-transparent bg-fg text-bg hover:opacity-90",
        variant === "outline" && "border-border bg-bg-elev text-fg hover:border-border-strong",
        variant === "ghost" && "border-transparent text-fg-muted hover:bg-chip hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}
