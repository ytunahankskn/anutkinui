import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "decrypted-text",
  category: "text",
  name: "Decrypted Text",
  componentName: "DecryptedText",
  description: "A decryption effect where characters gradually resolve from random symbols into real text; replays on hover.",
  descriptionTr: "Karakterlerin rastgele sembollerden gerçek metne kademeli çözüldüğü şifre çözme efekti; hover'da tekrar oynar.",
  tags: ["text", "decrypt", "glitch", "hover", "reveal"],
  runtime: ["React state", "setInterval"],
  dependencies: [],
  controls: {
    palette: { type: "select", options: ["matrix", "amber", "cyan", "mono"], default: "matrix" },
    text: { type: "text", default: "Access granted. Welcome back, operator." },
    speed: { type: "number", min: 20, max: 120, step: 5, default: 45 },
    direction: { type: "select", options: ["start", "end", "center"], default: "start" },
    sequential: { type: "boolean", default: true },
    characters: { type: "text", default: "ABCDEF0123456789!<>-_\\/[]{}—=+*^?#" },
  },
  cover: ["#05140a", "#2bff6b"],
  createdAt: "2026-09-12",
  popularity: 1380,
};
