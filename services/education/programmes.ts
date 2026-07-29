import { exploreRecords, cachedFetch, EDUCATION_API_BASE } from './api';
import { cycleForClasse, degreForCycle, type Cycle } from '../../lib/cycles';
import { matchLessonToProgram, type LessonForMatch, type ProgramEntry, type ProgramMatchResult } from '../../lib/programMatch';

// ─── Programmes officiels (data.education.gouv.fr) ──────────────────────────
// Jeux de données : programmes + compléments (repères annuels, attendus),
// premier et second degré. Synchronisés puis mis en cache localement (30 j) —
// aucun appel API par question générée.
//
// Schémas RÉELS vérifiés (2026-07-29) sur Explore v2.1 :
//   programmes : descriptif, niveau_d_enseignement, discipline, texte_officiel,
//     lien_vers_le_texte_officiel, contenu_sur_le_site, entre_en_vigueur_…,
//     abroge_a_la_rentree [, voie]
//   compléments : idem + nature_du_complement, contenu (URL PDF)
// Les enregistrements sont des MÉTADONNÉES (titres + liens PDF), pas le texte
// intégral des programmes. La normalisation mappe ces champs explicitement ;
// une heuristique de repli reste active pour d'éventuels changements de schéma.

export const PROGRAM_DATASETS = {
  premier: ['fr-en-programmes-enseignement-premier-degre', 'fr-en-complements-programmes-premier-degre'],
  second: ['fr-en-programmes-enseignement-2nd-degre', 'fr-en-complements-programmes-second-degre'],
} as const;

const SYNC_TTL_MS = 30 * 24 * 3600 * 1000; // 30 jours
const PAGE_SIZE = 100;
const MAX_PAGES = 15; // 1500 enregistrements max par jeu (2nd degré ≈ 688)

function pick(r: Record<string, any>, patterns: RegExp): string | undefined {
  for (const [k, v] of Object.entries(r)) {
    if (patterns.test(k) && typeof v === 'string') {
      const t = v.trim();
      if (t.length > 0 && t !== '-') return t;
    }
  }
  return undefined;
}

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.trim();
    // « - » = valeur sentinelle « non renseigné » dans les jeux EN
    if (t.length > 0 && t !== '-') return t;
    return undefined;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return undefined;
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/** Extrait cycle / classe à partir de `niveau_d_enseignement` (valeurs réelles : "cycle 2", "Cycle 4", "CE1", "5e"…). */
export function splitNiveauEnseignement(raw: string | undefined): { cycle?: string; niveau?: string } {
  if (!raw) return {};
  const t = raw.trim();
  if (!t || t === '-') return {};
  const cycleMatch = t.match(/cycle\s*([1-4])/i);
  if (cycleMatch) return { cycle: `Cycle ${cycleMatch[1]}` };
  // classe précise (repères / attendus) — y compris "Terminale STL", "Première STI2D"…
  return { niveau: t };
}

/**
 * true si l'enregistrement est encore en vigueur.
 * Valeurs réelles de `abroge_a_la_rentree` : null, "-", "" ou une année ("2020").
 */
export function isProgrammeActif(r: Record<string, any>): boolean {
  const a = r?.abroge_a_la_rentree;
  if (a == null) return true;
  const s = String(a).trim();
  return s === '' || s === '-' || s.toLowerCase() === 'null';
}

/** Normalisation d'un enregistrement de programme en ProgramEntry (schéma réel + repli heuristique). */
export function normalizeProgramRecord(r: Record<string, any>, dataset: string, idx: number): ProgramEntry | null {
  if (!r || typeof r !== 'object') return null;

  const descriptif = asString(r.descriptif);
  const discipline = asString(r.discipline);
  const nature = asString(r.nature_du_complement);
  const texteOfficiel = asString(r.texte_officiel);
  const niveauRaw = asString(r.niveau_d_enseignement);
  const { cycle: cycleFromNiveau, niveau: classeFromNiveau } = splitNiveauEnseignement(niveauRaw);

  // URLs : préférer le PDF du contenu, puis le lien Légifrance
  const contenuUrl = asString(r.contenu_sur_le_site) ?? asString(r.contenu);
  const lienOfficiel = asString(r.lien_vers_le_texte_officiel);
  const url =
    (contenuUrl && isUrl(contenuUrl) ? contenuUrl : undefined)
    ?? (lienOfficiel && isUrl(lienOfficiel) ? lienOfficiel : undefined)
    ?? pick(r, /^(url|lien)/i);

  // Texte du champ `contenu` s'il n'est pas une URL (schémas alternatifs / fixtures)
  const contenuText = asString(r.contenu);
  const contenuAsText = contenuText && !isUrl(contenuText) ? contenuText : undefined;

  // Texte exploitable : titres / libellés / corps — JAMAIS les URLs (polluent le matching)
  const textParts: string[] = [];
  for (const part of [descriptif, nature, discipline, texteOfficiel, contenuAsText]) {
    if (part && !isUrl(part)) textParts.push(part);
  }
  // repli heuristique : autres champs textuels non-URL, hors métadonnées techniques
  if (textParts.length === 0) {
    for (const [k, v] of Object.entries(r)) {
      if (typeof v !== 'string') continue;
      const s = v.trim();
      if (s.length <= 20 || s === '-' || isUrl(s)) continue;
      if (/^(abroge|entre_en_vigueur|voie|lien_)/i.test(k)) continue;
      textParts.push(s);
    }
  }
  if (textParts.length === 0) return null;

  const matiere =
    discipline
    ?? pick(r, /^(matiere|discipline)$/i)
    ?? pick(r, /matiere|discipline/i);

  const cycle =
    cycleFromNiveau
    ?? pick(r, /^cycle$/i)
    ?? pick(r, /cycle/i);

  const niveau =
    classeFromNiveau
    ?? pick(r, /niveau_scolaire|classe/i);

  const domaine =
    descriptif
    ?? pick(r, /domaine|theme|thème|partie/i);

  const sousDomaine =
    nature
    ?? pick(r, /sous_domaine|sous-domaine|sous_theme|attendu|reperes|repères/i);

  const reference =
    texteOfficiel
    ?? pick(r, /reference|bo_|bulletin|texte_officiel/i);

  const dateEntreeVigueur =
    asString(r.entre_en_vigueur_a_la_rentree)
    ?? pick(r, /vigueur|date_application|date_publication/i);

  return {
    id: `${dataset}-${idx}`,
    dataset,
    texte: textParts.join('\n').slice(0, 4000),
    matiere,
    cycle,
    niveau,
    domaine,
    sousDomaine,
    reference,
    url,
    dateEntreeVigueur,
  };
}

/** true si l'entrée concerne (ou peut concerner) le cycle demandé. */
export function entryMatchesCycle(e: ProgramEntry, cycle: Cycle): boolean {
  if (e.cycle) {
    const n = e.cycle.toLowerCase();
    const num = { cycle1: '1', cycle2: '2', cycle3: '3', cycle4: '4', lycee: 'lyc' }[cycle];
    if (n.includes(num)) return true;
    // cycle explicite différent → exclure
    if (/cycle\s*[1-4]/i.test(e.cycle) || /lyc/i.test(e.cycle)) return false;
  }
  if (e.niveau) {
    const fromNiveau = cycleForClasse(e.niveau);
    if (fromNiveau) return fromNiveau === cycle;
    // Lycée élargi (séries, CAP, voies pro/techno)
    if (cycle === 'lycee') {
      return /terminale|premi[eè]re|1re|2nde|seconde|\bcap\b|bac|sti|stm|stl|std/i.test(e.niveau);
    }
    // « Collège » sans classe → cycles collège (C3/C4)
    if (/^coll[eè]ge$/i.test(e.niveau.trim())) return cycle === 'cycle3' || cycle === 'cycle4';
    // niveau non reconnu (ex. « Deuxième année de CAP ») : ne pas polluer primaire/collège
    return false;
  }
  // ni cycle ni niveau exploitable : ne pas exclure (métadonnées partielles)
  return true;
}

/** Récupère toutes les pages d'un jeu de données (limit API = 100). */
async function fetchAllRecords(dataset: string): Promise<any[]> {
  const all: any[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await exploreRecords(dataset, { limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    const batch = res.results ?? [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    const total = res.total_count ?? all.length;
    if (all.length >= total) break;
  }
  return all;
}

/**
 * Synchronise (avec cache 30 j) les programmes officiels des jeux de données
 * couvrant le cycle demandé. En cas d'API indisponible, ressert le dernier
 * cache même périmé. Les versions utilisées par d'anciennes leçons ne sont pas
 * affectées : chaque leçon conserve ses extraits et sa date de synchro.
 *
 * Préférence : enregistrements encore en vigueur ; si aucun actif ne match
 * le cycle, on retombe sur l'historique (programmes abrogés).
 */
export async function syncProgrammes(cycle: Cycle): Promise<{ entries: ProgramEntry[]; syncDate: string }> {
  const degre = degreForCycle(cycle);
  const datasets = degre === 'both'
    ? [...PROGRAM_DATASETS.premier, ...PROGRAM_DATASETS.second]
    : PROGRAM_DATASETS[degre];

  const actifs: ProgramEntry[] = [];
  const archives: ProgramEntry[] = [];
  let syncDate = new Date().toISOString();
  for (const ds of datasets) {
    try {
      const { data, fetchedAt } = await cachedFetch<any[]>(`prog:${ds}:v2`, SYNC_TTL_MS, () => fetchAllRecords(ds));
      syncDate = fetchedAt;
      data.forEach((r, i) => {
        const e = normalizeProgramRecord(r, ds, i);
        if (!e || !entryMatchesCycle(e, cycle)) return;
        (isProgrammeActif(r) ? actifs : archives).push(e);
      });
    } catch {
      // jeu de données indisponible : on continue avec les autres
    }
  }
  const entries = actifs.length > 0 ? actifs : archives;
  return { entries, syncDate };
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
 * vocabulaire + matière) — le modèle IA ne devine pas le niveau. Renvoie null
 * si aucune correspondance suffisamment fiable (jamais de valeur inventée).
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
