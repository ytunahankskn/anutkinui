import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="mono-label">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Link href="/browse" className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
        {t("cta")}
      </Link>
    </div>
  );
}
