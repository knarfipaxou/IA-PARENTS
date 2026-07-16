import { getJSON, setJSON } from './storage';

// ─── Parcours de maîtrise : 4 missions séquentielles par échéance ────────────
// Mission Mémoire → Mission Compréhension → Mission Application → Mission Défi final.
// Chaque mission se débloque selon les scores des précédentes ; le parent peut
// débloquer exceptionnellement. Logique pure testée dans __tests__/masteryPath.test.ts.

export type MissionId = 'memoire' | 'comprehension' | 'application' | 'defi';

export const MISSION_ORDER: MissionId[] = ['memoire', 'comprehension', 'application', 'defi'];

export interface MissionDef {
  id: MissionId;
  title: string;
  desc: string;
  icon: string; // Ionicons
  color: string;
  /** seuil (%) à partir duquel la mission est considérée maîtrisée */
  masteryPct: number;
}

export const MISSION_DEFS: Record<MissionId, MissionDef> = {
  memoire: {
    id: 'memoire', title: 'Mission Mémoire',
    desc: 'Restituer les définitions, le vocabulaire et les formules de la leçon.',
    icon: 'library-outline', color: '#35E4D2', masteryPct: 80,
  },
  comprehension: {
    id: 'comprehension', title: 'Mission Compréhension',
    desc: 'Expliquer avec ses propres mots le pourquoi et le comment.',
    icon: 'bulb-outline', color: '#3D7BFF', masteryPct: 75,
  },
  application: {
    id: 'application', title: 'Mission Application',
    desc: 'Appliquer la leçon dans des exercices concrets.',
    icon: 'construct-outline', color: '#8B7CF6', masteryPct: 75,
  },
  defi: {
    id: 'defi', title: 'Mission Défi final',
    desc: 'Transférer : problèmes complets qui mélangent toute la leçon.',
    icon: 'trophy-outline', color: '#F5C24B', masteryPct: 75,
  },
};

export interface MissionAttempt {
  date: string; // ISO
  pct: number; // 0..100
}

export interface MissionRecord {
  attempts: MissionAttempt[];
}

export interface MasteryPath {
  missions: Partial<Record<MissionId, MissionRecord>>;
  /** déblocage exceptionnel accordé par le parent */
  overrides?: Partial<Record<MissionId, boolean>>;
  /** carte des connaissances générée une seule fois puis réutilisée (ancien format, conservé) */
  knowledgeMap?: any;
  /** analyse complète de la leçon (lesson-analyzer) : statut + carte des connaissances */
  analysis?: {
    status: string;
    statusDetail?: string;
    knowledge: {
      knowledgeId: string; type: string; label: string; content: string;
      importance: 'essential' | 'important' | 'secondary';
      cognitiveLevel: 'remember' | 'understand' | 'apply' | 'transfer';
      sourceExcerpt?: string; sourceSection?: string;
    }[];
    detectedUncertainties?: string[];
  };
  /** maîtrise par connaissance (knowledgeId → maîtrisée) constatée à la correction */
  knowledge?: Record<string, boolean>;
  /** contenus de mission générés à la demande, mis en cache */
  content?: Partial<Record<MissionId, any>>;
}

export const EMPTY_PATH: MasteryPath = { missions: {} };

export function bestPct(path: MasteryPath, id: MissionId): number | null {
  const attempts = path.missions[id]?.attempts ?? [];
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map((a) => a.pct));
}

export function lastPct(path: MasteryPath, id: MissionId): number | null {
  const attempts = path.missions[id]?.attempts ?? [];
  return attempts.length > 0 ? attempts[attempts.length - 1].pct : null;
}

const MISSION_LEVEL_FR: Record<MissionId, 'remember' | 'understand' | 'apply' | 'transfer'> = {
  memoire: 'remember', comprehension: 'understand', application: 'apply', defi: 'transfer',
};

/**
 * Connaissances ESSENTIELLES du niveau cognitif d'une mission non encore
 * maîtrisées. Sans carte des connaissances (analyse pas encore faite), la
 * règle retombe sur le seul score.
 */
export function unmasteredEssentials(path: MasteryPath, id: MissionId): string[] {
  const items = path.analysis?.knowledge ?? [];
  if (items.length === 0) return [];
  return items
    .filter((k) => k.importance === 'essential' && k.cognitiveLevel === MISSION_LEVEL_FR[id])
    .filter((k) => !path.knowledge?.[k.knowledgeId])
    .map((k) => k.label);
}

/**
 * Règles de déblocage : score de la mission précédente + toutes les
 * connaissances essentielles de cette mission maîtrisées.
 */
export function isUnlocked(path: MasteryPath, id: MissionId): boolean {
  if (path.overrides?.[id]) return true;
  switch (id) {
    case 'memoire':
      return true;
    case 'comprehension':
      return (bestPct(path, 'memoire') ?? 0) >= MISSION_DEFS.memoire.masteryPct
        && unmasteredEssentials(path, 'memoire').length === 0;
    case 'application':
      return (bestPct(path, 'comprehension') ?? 0) >= MISSION_DEFS.comprehension.masteryPct
        && unmasteredEssentials(path, 'comprehension').length === 0;
    case 'defi':
      return (bestPct(path, 'application') ?? 0) >= MISSION_DEFS.application.masteryPct
        && unmasteredEssentials(path, 'application').length === 0;
  }
}

/** Raison affichée sur une mission verrouillée (null si débloquée). */
export function lockReason(path: MasteryPath, id: MissionId): string | null {
  if (isUnlocked(path, id)) return null;
  const prev: Partial<Record<MissionId, MissionId>> = {
    comprehension: 'memoire', application: 'comprehension', defi: 'application',
  };
  const p = prev[id];
  if (!p) return null;
  const missing = unmasteredEssentials(path, p);
  const scoreOk = (bestPct(path, p) ?? 0) >= MISSION_DEFS[p].masteryPct;
  if (scoreOk && missing.length > 0) {
    return `${missing.length} connaissance${missing.length > 1 ? 's' : ''} essentielle${missing.length > 1 ? 's' : ''} encore non maîtrisée${missing.length > 1 ? 's' : ''} : ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '…' : ''}`;
  }
  const extra = missing.length > 0 ? ' et que toutes les connaissances essentielles sont maîtrisées' : '';
  return `Se débloque quand la ${MISSION_DEFS[p].title} atteint ${MISSION_DEFS[p].masteryPct} %${extra}.`;
}

/** Enregistre la maîtrise constatée de connaissances (à la correction d'une mission). */
export function recordKnowledgeMastery(path: MasteryPath, results: Record<string, boolean>): MasteryPath {
  const next = { ...(path.knowledge ?? {}) };
  for (const [id, mastered] of Object.entries(results)) {
    // une connaissance maîtrisée le reste ; une ratée redevient non maîtrisée
    next[id] = mastered;
  }
  return { ...path, knowledge: next };
}

export type MissionStatus =
  | 'verrouillee'
  | 'a_decouvrir'
  | 'a_reprendre'
  | 'en_progression'
  | 'maitrisee';

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  verrouillee: 'Verrouillée',
  a_decouvrir: 'À découvrir',
  a_reprendre: 'À reprendre',
  en_progression: 'En progression',
  maitrisee: 'Maîtrisée',
};

export function missionStatus(path: MasteryPath, id: MissionId): MissionStatus {
  if (!isUnlocked(path, id)) return 'verrouillee';
  const best = bestPct(path, id);
  if (best === null) return 'a_decouvrir';
  if (best >= MISSION_DEFS[id].masteryPct) return 'maitrisee';
  const last = lastPct(path, id) ?? 0;
  if (last < 50) return 'a_reprendre';
  return 'en_progression';
}

export function missionsValidated(path: MasteryPath): number {
  return MISSION_ORDER.filter((id) => missionStatus(path, id) === 'maitrisee').length;
}

/** Première mission débloquée non maîtrisée (mission « en cours »), ou null si tout est maîtrisé. */
export function currentMission(path: MasteryPath): MissionId | null {
  for (const id of MISSION_ORDER) {
    const st = missionStatus(path, id);
    if (st !== 'maitrisee' && st !== 'verrouillee') return id;
  }
  return null;
}

export function recordMissionResult(path: MasteryPath, id: MissionId, pct: number, dateISO: string): MasteryPath {
  const rec = path.missions[id] ?? { attempts: [] };
  return {
    ...path,
    missions: {
      ...path.missions,
      [id]: { ...rec, attempts: [...rec.attempts, { date: dateISO, pct: Math.round(pct) }] },
    },
  };
}

export function setOverride(path: MasteryPath, id: MissionId): MasteryPath {
  return { ...path, overrides: { ...(path.overrides ?? {}), [id]: true } };
}

// ─── Persistance (clé ppia.masteryPath, map par `${childId}:${echeanceId}`) ──

const KEY = 'ppia.masteryPath';

export async function loadMasteryPath(pathKey: string): Promise<MasteryPath> {
  const all = await getJSON<Record<string, MasteryPath>>(KEY, {});
  const p = all?.[pathKey];
  return p && typeof p === 'object' && p.missions ? p : { missions: {} };
}

export async function saveMasteryPath(pathKey: string, path: MasteryPath): Promise<void> {
  const all = await getJSON<Record<string, MasteryPath>>(KEY, {});
  await setJSON(KEY, { ...(all ?? {}), [pathKey]: path });
}
