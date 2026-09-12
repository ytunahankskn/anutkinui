// Registry klasörünü tarar, her bileşenin kaynak kodunu JSON'a yazar.
// Detay sayfasındaki "Code" sekmesi bu dosyadan beslenir.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/registry");
const outFile = path.join(root, "__generated__", "sources.json");
const SKIP = new Set(["meta.ts", "demo.tsx"]);
const ALLOWED = /\.(tsx?|glsl|css)$/;

const result = {};
for (const category of fs.readdirSync(root, { withFileTypes: true })) {
  if (!category.isDirectory() || category.name.startsWith("__")) continue;
  const catDir = path.join(root, category.name);
  for (const entry of fs.readdirSync(catDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(catDir, entry.name);
    const files = fs
      .readdirSync(dir)
      .filter((f) => !SKIP.has(f) && ALLOWED.test(f))
      .sort();
    result[`${category.name}/${entry.name}`] = files.map((name) => ({
      name,
      code: fs.readFileSync(path.join(dir, name), "utf8").replace(/\r\n/g, "\n"),
    }));
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");
console.log(`registry: ${Object.keys(result).length} entries -> ${path.relative(process.cwd(), outFile)}`);
