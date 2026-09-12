"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, LayoutGrid, Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { OPEN_COMMAND_EVENT, type NavGroup } from "./nav-types";

export function CommandMenu({ nav }: { nav: NavGroup[] }) {
  const t = useTranslations("commandMenu");
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-bg-elev shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Search" loop>
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search size={15} className="text-fg-faint" />
                <Command.Input
                  autoFocus
                  placeholder={t("placeholder")}
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-faint"
                />
                <kbd className="font-mono text-[10px] text-fg-faint">ESC</kbd>
              </div>
              <Command.List className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
                <Command.Empty className="px-3 py-8 text-center text-sm text-fg-muted">{t("noResults")}</Command.Empty>
                <Command.Group heading={t("docsGroup")} className="[&_[cmdk-group-heading]]:mono-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                  <Item onSelect={() => go("/browse")} icon={<LayoutGrid size={14} />}>
                    {t("browseAll")}
                  </Item>
                  <Item onSelect={() => go("/docs/installation")} icon={<BookOpen size={14} />}>
                    {tNav("installation")}
                  </Item>
                </Command.Group>
                {nav.map((group) => (
                  <Command.Group
                    key={group.slug}
                    heading={group.label}
                    className="[&_[cmdk-group-heading]]:mono-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                  >
                    {group.items.map((item) => (
                      <Item key={item.slug} onSelect={() => go(`/${group.slug}/${item.slug}`)} keywords={[group.label]}>
                        {item.name}
                        {item.pro && <span className="mono-label ml-auto">pro</span>}
                      </Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  children,
  onSelect,
  icon,
  keywords,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
  keywords?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-fg-muted data-[selected=true]:bg-chip data-[selected=true]:text-fg"
    >
      {icon && <span className="text-fg-faint">{icon}</span>}
      {children}
    </Command.Item>
  );
}
