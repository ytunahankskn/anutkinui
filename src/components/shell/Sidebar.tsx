"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { openCommandMenu, type NavGroup } from "./nav-types";

export function Sidebar({ nav }: { nav: NavGroup[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  const docs = [
    { href: "/browse", label: t("browse") },
    { href: "/docs/installation", label: t("installation") },
  ];

  // Close the mobile menu when the route changes (setState-during-render pattern).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur md:hidden">
        <Logo target="mobile" />
        <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="rounded-md p-1.5 text-fg-muted hover:bg-chip">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <div className="h-12 md:hidden" />

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-bg-elev transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        data-lenis-prevent
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Logo target="desktop" />
          <span className="mono-label rounded-md border border-border px-1.5 py-0.5">v0.3</span>
        </div>

        <div className="px-3">
          <button
            onClick={openCommandMenu}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-bg px-2.5 text-sm text-fg-muted transition-colors hover:border-border-strong"
          >
            <Search size={14} />
            <span className="flex-1 text-left">{t("search")}</span>
            <kbd className="font-mono text-[10px] text-fg-faint">⌘ K</kbd>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-5">
          <p className="mono-label mb-2 px-2">{t("documentation")}</p>
          <ul className="mb-6 space-y-0.5">
            {docs.map((d) => (
              <li key={d.href}>
                <NavLink href={d.href} active={pathname === d.href || (d.href === "/browse" && pathname === "/")}>
                  {d.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mono-label mb-2 px-2">{site.name}</p>
          <ul className="space-y-1">
            {nav.map((group) => (
              <Group key={group.slug} group={group} pathname={pathname} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </aside>
    </>
  );
}

function Logo({ target }: { target: "desktop" | "mobile" }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" data-loader-target={target}>
      <span className="grid size-6 place-items-center rounded-md bg-fg text-bg">
        <span className="size-2.5 rounded-sm bg-bg" />
      </span>
      <span className="text-[15px]">{site.name}</span>
    </Link>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center rounded-md px-2 text-[13px] transition-colors",
        active ? "bg-chip text-fg" : "text-fg-muted hover:bg-chip hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}

function Group({ group, pathname }: { group: NavGroup; pathname: string }) {
  const inGroup = pathname.startsWith(`/${group.slug}/`);
  const [expanded, setExpanded] = useState(true);

  return (
    <li>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md px-2 text-[13px] font-medium transition-colors hover:bg-chip",
          inGroup ? "text-fg" : "text-fg",
        )}
      >
        {group.label}
        <ChevronDown size={14} className={cn("text-fg-faint transition-transform", !expanded && "-rotate-90")} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {group.items.map((item) => {
              const href = `/${group.slug}/${item.slug}`;
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "ml-2 flex h-7 items-center justify-between rounded-md px-2 text-[13px] transition-colors",
                      active ? "bg-chip text-fg" : "text-fg-muted hover:bg-chip hover:text-fg",
                    )}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="flex items-center gap-1">
                      {item.variants > 0 && (
                        <span className="rounded border border-border px-1 font-mono text-[10px] text-fg-faint">+{item.variants}</span>
                      )}
                      {item.pro && <span className="mono-label">pro</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
