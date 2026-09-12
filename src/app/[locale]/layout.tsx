import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { Sidebar } from "@/components/shell/Sidebar";
import { CommandMenu } from "@/components/shell/CommandMenu";
import { SiteLoader } from "@/components/shell/SiteLoader";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { categories, registry } from "@/registry";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: { default: `${site.name} — ${t("tagline")}`, template: `%s | ${site.name}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Sidebar'da sadece ana bileşenler listelenir; varyantlar sayı olarak gösterilir.
  const nav = categories.map((c) => ({
    ...c,
    items: registry
      .filter((e) => e.category === c.slug && !e.sourceOf)
      .map((e) => ({
        slug: e.slug,
        name: e.name,
        pro: e.pro ?? false,
        variants: registry.filter((v) => v.sourceOf?.category === e.category && v.sourceOf?.slug === e.slug).length,
      })),
  }));

  return (
    <html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-fg">
        <NextIntlClientProvider>
          <ThemeProvider>
            <SmoothScroll>
              <div className="flex min-h-dvh">
                <Sidebar nav={nav} />
                <main className="min-w-0 flex-1 md:pl-[264px]">{children}</main>
              </div>
              <CommandMenu nav={nav} />
              <SiteLoader />
            </SmoothScroll>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
