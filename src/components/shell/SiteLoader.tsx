"use client";

import { useState, useSyncExternalStore } from "react";
import { RevealLoader } from "@/registry/ui/reveal-loader/RevealLoader";
import { site } from "@/config/site";

const KEY = "anutkinui:loader-shown";
const subscribeNoop = () => () => {};

function readShouldShow() {
  try {
    return sessionStorage.getItem(KEY) !== "1";
  } catch {
    return true;
  }
}

/**
 * Site preloader: the logo counts 0→100 in the center, then flies to the real logo in the sidebar.
 * Shown only on a full page load, once per session (not on client-side navigations).
 */
export function SiteLoader() {
  const show = useSyncExternalStore(subscribeNoop, readShouldShow, () => true);
  const [done, setDone] = useState(false);
  if (!show || done) return null;

  // Fly to the sidebar logo on desktop, the top-bar logo on mobile.
  const desktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const targetSelector = desktop ? '[data-loader-target="desktop"]' : '[data-loader-target="mobile"]';

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <RevealLoader
        scope="document"
        targetSelector={targetSelector}
        palette="noir"
        logoText={site.name}
        duration={1.6}
        hold={0.3}
        style="both"
        onComplete={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* private browsing, etc. */
          }
          setDone(true);
        }}
      />
    </div>
  );
}
