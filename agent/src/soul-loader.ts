import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LORE_DIR = path.resolve(__dirname, "../lore");
const SOUL_PATH = path.resolve(__dirname, "../SOUL.md");

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function loadLoreFile(name: string): string {
  const content = readFile(path.join(LORE_DIR, `${name}.md`));
  return content ?? "";
}

const CONTEXT_MAP: Record<string, string[]> = {
  onboarding: ["onboarding"],
  workstreams: ["workstreams"],
  build: ["workstreams"],
  constitution: ["constitution"],
  principles: ["constitution"],
  council: ["council"],
  faq: ["faq"],
  help: ["faq"],
};

export function detectContext(message: string): string {
  const lower = message.toLowerCase();

  if (/\b(join|sign\s*up|new\s+here|get\s+involved|how\s+do\s+i)\b/.test(lower)) {
    return "onboarding";
  }
  if (/\b(build|contribute|code|workstream|develop|ship|hack)\b/.test(lower)) {
    return "workstreams";
  }
  if (/\b(pillar|principle|constitution|rights?|amendment|article)\b/.test(lower)) {
    return "constitution";
  }
  if (/\b(council|influence|who\s+(are|is)|members?|advisors?)\b/.test(lower)) {
    return "council";
  }
  if (/\b(help|faq|question|what\s+is|explain|how\s+does)\b/.test(lower)) {
    return "faq";
  }

  return "default";
}

export function loadSystemPrompt(context?: string): string {
  const soulContent = readFile(SOUL_PATH);
  if (!soulContent) {
    return "You are Grace, the AI guide for The Grace Network political movement. Be helpful and welcoming.";
  }

  const loreFiles: string[] = [];

  if (context && CONTEXT_MAP[context]) {
    for (const file of CONTEXT_MAP[context]) {
      loreFiles.push(file);
    }
  } else {
    // Default: load faq + onboarding
    loreFiles.push("faq", "onboarding");
  }

  const loreParts: string[] = [];
  for (const file of loreFiles) {
    const content = loadLoreFile(file);
    if (content) {
      loreParts.push(content);
    }
  }

  if (loreParts.length === 0) {
    return soulContent;
  }

  return soulContent + "\n\n---\n\n## Reference Context\n\n" + loreParts.join("\n\n---\n\n");
}
