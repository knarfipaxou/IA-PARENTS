import { getJSON, setJSON } from './storage';

// Traçabilité des générations IA (clé ppia.generationLog) — cahier des charges §13.

export interface GenerationLogEntry {
  id: string;
  date: string; // ISO
  type: string; // 'mission-memoire', 'devoir-blanc', 'knowledge-map'…
  childId: string;
  echeanceId?: string;
  lessonIds?: string[];
  agent: string; // ex: 'mission-generator'
  model?: string;
  promptVersion?: string;
  attempts?: number;
  essentialCoverage?: number;
  importantCoverage?: number;
  missingKnowledgeIds?: string[];
  auditStatus?: string;
  durationMs?: number;
  error?: string;
}

const KEY = 'ppia.generationLog';
const MAX_ENTRIES = 200;

export async function appendGenerationLog(entry: GenerationLogEntry): Promise<void> {
  const all = await getJSON<GenerationLogEntry[]>(KEY, []);
  const list = Array.isArray(all) ? all : [];
  await setJSON(KEY, [entry, ...list].slice(0, MAX_ENTRIES));
}

export async function loadGenerationLog(childId?: string): Promise<GenerationLogEntry[]> {
  const all = await getJSON<GenerationLogEntry[]>(KEY, []);
  const list = Array.isArray(all) ? all : [];
  return childId ? list.filter((e) => e.childId === childId) : list;
}
