import { setRequestLocale } from "next-intl/server";
import { BrowsePage } from "@/components/browse/BrowsePage";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BrowsePage />;
}
