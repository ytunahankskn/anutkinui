export type CategorySlug =
  | "hero"
  | "backgrounds"
  | "three"
  | "products"
  | "scroll"
  | "text"
  | "buttons"
  | "cards"
  | "cursors"
  | "ui";

export interface Category {
  slug: CategorySlug;
  label: string;
  description: string;
  /** Turkish translation of `description`; falls back to `description` when absent. */
  descriptionTr?: string;
}

export type Control =
  | { type: "number"; label?: string; min: number; max: number; step?: number; default: number }
  | { type: "color"; label?: string; default: string }
  | { type: "select"; label?: string; options: readonly string[]; default: string }
  | { type: "boolean"; label?: string; default: boolean }
  | { type: "text"; label?: string; default: string };

export type ControlValue = string | number | boolean;
export type ControlValues = Record<string, ControlValue>;

export interface ComponentMeta {
  /** URL parçası: /[category]/[slug] */
  slug: string;
  category: CategorySlug;
  /** Görünen ad */
  name: string;
  /** Kod içindeki export adı (usage snippet için) */
  componentName: string;
  description: string;
  /** Turkish translation of `description`; falls back to `description` when absent. */
  descriptionTr?: string;
  tags: string[];
  /** Kullanılan teknolojiler (chip olarak gösterilir) */
  runtime: string[];
  /** Kopyalarken kurulması gereken npm paketleri */
  dependencies: string[];
  controls: Record<string, Control>;
  /** Kart kapağı için gradient renkleri */
  cover: readonly [string, string];
  /** ISO tarih */
  createdAt: string;
  popularity: number;
  pro?: boolean;
  /**
   * Variant support: the same component listed as a second card with different default
   * props (e.g. "Aurora Shader — Magenta"). Produced with `variantOf`.
   */
  family?: string;
  /** Varyant girdilerinde asıl bileşenin category/slug'ı (demo ve kaynak buradan alınır) */
  sourceOf?: { category: CategorySlug; slug: string };
}

export function defaultValues(meta: ComponentMeta): ControlValues {
  const out: ControlValues = {};
  for (const [key, c] of Object.entries(meta.controls)) out[key] = c.default;
  return out;
}

/** Picks the Turkish description when `locale` is "tr" and one exists, English otherwise. */
export function localizedDescription(entry: { description: string; descriptionTr?: string }, locale: string): string {
  return locale === "tr" ? (entry.descriptionTr ?? entry.description) : entry.description;
}
