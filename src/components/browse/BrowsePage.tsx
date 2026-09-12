import { getTranslations } from "next-intl/server";
import { categories, registry } from "@/registry";
import { BrowseGrid } from "./BrowseGrid";

export async function BrowsePage() {
  const t = await getTranslations("site");
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("tagline")}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-muted">{t("description")}</p>
      <div className="mt-8">
        <BrowseGrid entries={registry} categories={categories} />
      </div>
    </div>
  );
}
