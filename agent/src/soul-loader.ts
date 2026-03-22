import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LORE_DIR = path.resolve(__dirname, "../lore");
const SKILLS_DIR = path.resolve(__dirname, "../skills");
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

function loadSkillFile(name: string): string {
  const content = readFile(path.join(SKILLS_DIR, `${name}.md`));
  return content ?? "";
}

// Map contexts to relevant procedural skills
const SKILL_MAP: Record<string, string[]> = {
  workstreams: ["workstream-matching"],
  build: ["workstream-matching"],
  onboarding: ["workstream-matching"],
  constitution: ["explain-amendment"],
  principles: ["explain-amendment"],
  skeptic: ["skeptic-response"],
};

const CONTEXT_MAP: Record<string, string[]> = {
  onboarding: ["onboarding"],
  workstreams: ["workstreams"],
  build: ["workstreams"],
  constitution: ["constitution"],
  principles: ["constitution"],
  council: ["council"],
  faq: ["faq"],
  help: ["faq"],
  policy: ["policy", "positions-live", "current-events"],
  positions: ["positions-live", "policy", "current-events"],
  constellation: ["constellation"],
  current_events: ["current-events", "positions-live", "trends-live"],
  governance_toolkit: ["workstreams", "policy"],
  accountability: ["workstreams", "policy"],
  spiritland: ["spiritland", "policy", "positions-live"],
  infrastructure: ["spiritland", "workstreams"],
  partnerships: ["spiritland", "policy"],
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
  if (/\b(agent|fleet|constellation|seth|sal|solienne|coltrane|fred|levi|archie|who\s+made|who\s+built|behind\s+you|your\s+creator|other\s+agents?|how\s+were\s+you)\b/.test(lower)) {
    return "constellation";
  }
  if (/\b(news|current|happening|latest|today|recent|update|headline|world|congress|legislation|bill\s+pass|law\s+change)\b/.test(lower)) {
    return "current_events";
  }
  if (/\b(policy|position|stance|ai\s+safety|data\s+sovereign|algorith|regulation|economic|digital\s+rights?)\b/.test(lower)) {
    return "policy";
  }
  if (/\b(governance\s+toolkit|voting\s+tool|proposal\s+system)\b/.test(lower)) {
    return "governance_toolkit";
  }
  if (/\b(accountability|dashboard|track|audit|compliance)\b/.test(lower)) {
    return "accountability";
  }
  if (/\b(spirit\s*land|oracle|biosphere|solar\s+farm|data\s+center|agent\s+sovereignty|tier\s*4|physical\s+infrastructure|desert)\b/.test(lower)) {
    return "spiritland";
  }
  if (/\b(partnership|municipal|county|state\s+government|local\s+government|community\s+partner|university|grant)\b/.test(lower)) {
    return "partnerships";
  }
  if (/\b(won'?t\s+work|utopi|scam|real\s+agenda|who'?s\s+behind|skeptic|doubt|cynical|too\s+good)\b/.test(lower)) {
    return "skeptic";
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

  // Load procedural skills for this context
  const skillParts: string[] = [];
  if (context && SKILL_MAP[context]) {
    for (const skill of SKILL_MAP[context]) {
      const content = loadSkillFile(skill);
      if (content) {
        skillParts.push(content);
      }
    }
  }

  let prompt = soulContent;

  if (loreParts.length > 0) {
    prompt += "\n\n---\n\n## Reference Context\n\n" + loreParts.join("\n\n---\n\n");
  }

  if (skillParts.length > 0) {
    prompt += "\n\n---\n\n## Conversation Procedures\nFollow these procedures when they match the situation. They are instructions, not scripts — adapt to the specific conversation.\n\n" + skillParts.join("\n\n---\n\n");
  }

  return prompt;
}
