import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BrowsePage } from "@/components/browse/BrowsePage";

export const metadata: Metadata = { title: "Browse" };

export default async function Browse({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BrowsePage />;
}
