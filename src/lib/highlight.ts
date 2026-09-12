import { codeToHtml } from "shiki";

const LANG_BY_EXT: Record<string, string> = {
  tsx: "tsx",
  ts: "ts",
  glsl: "glsl",
  css: "css",
  json: "json",
  bash: "bash",
};

export async function highlight(code: string, fileName = "file.tsx") {
  const ext = fileName.split(".").pop() ?? "tsx";
  const lang = LANG_BY_EXT[ext] ?? "tsx";
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark-default" },
    defaultColor: false,
  });
}
