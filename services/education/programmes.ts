import { exploreRecords, cachedFetch, EDUCATION_API_BASE } from './api';
import { cycleForClasse, degreForCycle, type Cycle } from '../../lib/cycles';
import { matchLessonToProgram, type LessonForMatch, type ProgramEntry, type ProgramMatchResult } from '../../lib/programMatch';

// ─── Programmes officiels (data.education.gouv.fr) ──────────────────────────
// Jeux de données : programmes + compléments (repères annuels, attendus),
// premier et second degré. Synchronisés puis mis en cache localement (30 j) —
// aucun appel API par question générée. Les schémas exacts de ces jeux
// n'étant pas garantis, la normalisation est TOLÉRANTE : les champs sont
// découverts par heuristique de nom et les enregistrements inexploitables
// sont ignorés (jamais inventés).

export const PROGRAM_DATASETS = {
  premier: ['fr-en-programmes-enseignement-premier-degre', 'fr-en-complements-programmes-premier-degre'],
  second: ['fr-en-programmes-enseignement-2nd-degre', 'fr-en-complements-programmes-second-degre'],
} as const;

const SYNC_TTL_MS = 30 * 24 * 3600 * 1000; // 30 jours
const MAX_RECORDS_PER_DATASET = 100;

function pick(r: Record<string, any>, patterns: RegExp): string | undefined {
  for (const [k, v] of Object.entries(r)) {
    if (patterns.test(k) && typeof v === 'string' && v.trim().length > 0) return v;
  }
  return undefined;
}

/** Normalisation tolérante d'un enregistrement de programme en ProgramEntry. */
export function normalizeProgramRecord(r: Record<string, any>, dataset: string, idx: number): ProgramEntry | null {
  if (!r || typeof r !== 'object') return null;
  // texte : concaténation de tous les champs textuels significatifs
  const textParts = Object.entries(r)
    .filter(([, v]) => typeof v === 'string' && (v as string).trim().length > 20)
    .map(([, v]) => v as string);
  if (textParts.length === 0) return null;
  return {
    id: `${dataset}-${idx}`,
    dataset,
    texte: textParts.join('\n').slice(0, 4000),
    matiere: pick(r, /matiere|discipline|enseignement/i),
    cycle: pick(r, /cycle/i),
    niveau: pick(r, /niveau|classe|annee/i),
    domaine: pick(r, /domaine|theme|thème|partie/i),
    sousDomaine: pick(r, /sous_domaine|sous-domaine|sous_theme|attendu/i),
    reference: pick(r, /reference|bo_|bulletin|texte_officiel/i),
    url: pick(r, /url|lien/i),
    dateEntreeVigueur: pick(r, /vigueur|date_application|date_publication/i),
  };
}

/** true si l'entrée concerne (ou peut concerner) le cycle demandé. */
export function entryMatchesCycle(e: ProgramEntry, cycle: Cycle): boolean {
  if (!e.cycle) return true; // cycle non renseigné par la source : ne pas exclure
  const n = e.cycle.toLowerCase();
  const num = { cycle1: '1', cycle2: '2', cycle3: '3', cycle4: '4', lycee: 'lyc' }[cycle];
  return n.includes(num);
}

/**
 * Synchronise (avec cache 30 j) les programmes officiels des jeux de données
 * couvrant le cycle demandé. En cas d'API indisponible, ressert le dernier
 * cache même périmé. Les versions utilisées par d'anciennes leçons ne sont pas
 * affectées : chaque leçon conserve ses extraits et sa date de synchro.
 */
export async function syncProgrammes(cycle: Cycle): Promise<{ entries: ProgramEntry[]; syncDate: string }> {
  const degre = degreForCycle(cycle);
  const datasets = degre === 'both'
    ? [...PROGRAM_DATASETS.premier, ...PROGRAM_DATASETS.second]
    : PROGRAM_DATASETS[degre];

  const all: ProgramEntry[] = [];
  let syncDate = new Date().toISOString();
  for (const ds of datasets) {
    try {
      const { data, fetchedAt } = await cachedFetch<any[]>(`prog:${ds}`, SYNC_TTL_MS, async () => {
        const res = await exploreRecords(ds, { limit: MAX_RECORDS_PER_DATASET });
        return res.results ?? [];
      });
      syncDate = fetchedAt;
      data.forEach((r, i) => {
        const e = normalizeProgramRecord(r, ds, i);
        if (e && entryMatchesCycle(e, cycle)) all.push(e);
      });
    } catch {
      // jeu de données indisponible : on continue avec les autres
    }
  }
  return { entries: all, syncDate };
}

/** Résultat enrichi enregistré sur la leçon. */
export interface LessonProgram extends ProgramMatchResult {
  sourceUrl: string;
  fetchedAt: string;
  /** correction/validation du parent (prioritaire sur l'estimation) */
  parent?: {
    statut: 'confirme' | 'corrige' | 'incorrect';
    matiere?: string;
    classe?: string;
    cycleSeul?: boolean;
    date: string;
  };
}

/**
 * Identifie le programme officiel correspondant à une leçon scannée.
 * Comparaison RÉELLE avec les données officielles (recouvrement de
 * vocabulaire) — le modèle IA ne devine pas le niveau. Renvoie null si aucune
 * correspondance suffisamment fiable (jamais de valeur inventée).
 */
export async function identifyProgram(
  lesson: LessonForMatch,
  childClasse: string | undefined,
): Promise<LessonProgram | null> {
  const cycle = cycleForClasse(childClasse);
  if (!cycle) return null;
  const { entries, syncDate } = await syncProgrammes(cycle);
  if (entries.length === 0) return null;
  const match = matchLessonToProgram(lesson, entries, cycle, childClasse, syncDate);
  if (!match) return null;
  return {
    ...match,
    sourceUrl: `${EDUCATION_API_BASE.replace('/api/explore/v2.1', '')}`,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Bloc de contexte « programme officiel » injecté dans les prompts de
 * génération (missions, devoir blanc). Le programme sert de RÉFÉRENTIEL
 * (niveau, vocabulaire, attendus) — jamais de remplacement de la leçon.
 */
export function buildProgramContext(progs: (LessonProgram | undefined)[]): string {
  const valid = progs.filter((p): p is LessonProgram => !!p && p.parent?.statut !== 'incorrect');
  if (valid.length === 0) return '';
  const lines = valid.map((p) => {
    const classe = p.parent?.classe ?? (p.parent?.cycleSeul ? null : p.classeEstimee);
    return `- ${p.matiere ?? 'Matière'} · ${p.cycleLabel}${classe ? ` · ${classe}` : ''}${p.domaine ? ` · domaine « ${p.domaine} »` : ''}${p.extraits[0]?.reference ? ` (réf. ${p.extraits[0].reference})` : ''}`;
  });
  return `RÉFÉRENTIEL OFFICIEL (programmes de l'Éducation nationale, rattachement vérifié) :
${lines.join('\n')}
Utilise ce référentiel pour : adapter la difficulté et le vocabulaire au niveau, vérifier que les questions restent dans le cadre du programme, ne pas oublier les compétences importantes DÉJÀ présentes dans la leçon.
INTERDIT : ajouter des notions absentes de la leçon au motif qu'elles figurent au programme. La leçon fournie reste la seule source de contenu.`;
}
