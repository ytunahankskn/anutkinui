import type { ComponentMeta, ControlValues } from "@/registry/types";

function formatProp(key: string, value: string | number | boolean) {
  if (typeof value === "boolean") return value ? key : null;
  if (typeof value === "number") return `${key}={${Number.isInteger(value) ? value : value.toFixed(2)}}`;
  return `${key}="${value}"`;
}

/** Detay sayfasındaki "Usage" snippet'i. Props panelindeki değerlere göre canlı güncellenir. */
export function buildUsage(meta: ComponentMeta, values: ControlValues, fileName: string) {
  const src = meta.sourceOf ?? meta;
  const importPath = `@/registry/${src.category}/${src.slug}/${fileName.replace(/\.tsx?$/, "")}`;
  const props = Object.entries(values)
    .map(([k, v]) => formatProp(k, v))
    .filter(Boolean) as string[];

  const propLines = props.length ? "\n" + props.map((p) => `      ${p}`).join("\n") + "\n    " : " ";

  return `import { ${meta.componentName} } from "${importPath}";

export function Scene() {
  return (
    <${meta.componentName}${propLines}/>
  );
}
`;
}
