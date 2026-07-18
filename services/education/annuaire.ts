import { exploreRecords, EducationApiError, EDUCATION_SOURCE } from './api';

// ─── Annuaire officiel des établissements (fr-en-annuaire-education) ────────
// Recherche dynamique (autocomplétion) — pas de synchronisation complète :
// l'annuaire évolue régulièrement, on interroge l'API à la demande.

export const ANNUAIRE_DATASET = 'fr-en-annuaire-education';

/** Fiche établissement enregistrée dans le profil (l'UAI est la référence). */
export interface EtablissementScolaire {
  uai: string; // identifiant officiel (référence)
  nom: string;
  type: string; // Ecole / Collège / Lycée…
  statut: string; // Public / Privé
  adresse?: string;
  codePostal?: string;
  commune?: string;
  codeCommune?: string;
  departement?: string;
  academie?: string;
  latitude?: number;
  longitude?: number;
  fetchedAt: string; // date de récupération
  source: string; // source officielle
  /** saisie manuelle exceptionnelle (pas de fiche officielle) */
  manuel?: boolean;
}

// champs demandés à l'API (schéma documenté du jeu de données)
const FIELDS = [
  'identifiant_de_l_etablissement', 'nom_etablissement', 'type_etablissement',
  'statut_public_prive', 'adresse_1', 'code_postal', 'nom_commune',
  'code_commune', 'libelle_departement', 'libelle_academie', 'latitude', 'longitude', 'etat',
].join(',');

/** Types d'établissements pertinents selon la classe du profil (filtre par défaut, jamais bloquant). */
export function typesForClasse(classe: string | undefined): string[] {
  const c = (classe ?? '').toLowerCase();
  if (/ps|ms|gs|maternelle/.test(c)) return ['Ecole'];
  if (/cp|ce1|ce2|cm1|cm2|primaire|élémentaire|elementaire/.test(c)) return ['Ecole'];
  if (/6e|5e|4e|3e|collège|college/.test(c)) return ['Collège'];
  if (/2nde|seconde|1re|première|premiere|terminale|lycée|lycee/.test(c)) return ['Lycée'];
  return [];
}

function esc(s: string): string {
  return s.replace(/"/g, '\\"');
}

/**
 * Clauses `where` candidates (ODSQL), de la plus précise à la plus permissive.
 * La syntaxe exacte acceptée pouvant varier, le service essaie chaque clause
 * et passe à la suivante en cas de refus (HTTP 400).
 */
export function buildWhereCandidates(query: string, types: string[]): string[] {
  const q = query.trim();
  const typeFilter = types.length > 0
    ? ` AND type_etablissement IN (${types.map((t) => `"${esc(t)}"`).join(',')})`
    : '';

  // code UAI : 7 chiffres + 1 lettre
  if (/^\d{7}[a-z]$/i.test(q)) {
    return [`identifiant_de_l_etablissement = "${q.toUpperCase()}"`];
  }
  // code postal ou code commune : 5 chiffres
  if (/^\d{5}$/.test(q)) {
    return [
      `(code_postal = "${q}" OR code_commune = "${q}")${typeFilter}`,
      `code_postal = "${q}"${typeFilter}`,
    ];
  }
  // texte libre : nom, ville, département — recherche plein texte puis replis
  return [
    `search("${esc(q)}")${typeFilter}`,
    `(nom_etablissement like "${esc(q)}" OR nom_commune like "${esc(q)}" OR libelle_departement like "${esc(q)}")${typeFilter}`,
    `"${esc(q)}"${typeFilter}`,
  ];
}

/** Validation/normalisation d'un enregistrement de l'annuaire (champs absents tolérés). */
export function mapSchoolRecord(r: any, now = new Date().toISOString()): EtablissementScolaire | null {
  const uai = r?.identifiant_de_l_etablissement;
  const nom = r?.nom_etablissement;
  if (typeof uai !== 'string' || uai.length === 0 || typeof nom !== 'string' || nom.length === 0) return null;
  return {
    uai,
    nom,
    type: typeof r.type_etablissement === 'string' ? r.type_etablissement : 'Établissement',
    statut: typeof r.statut_public_prive === 'string' ? r.statut_public_prive : '',
    adresse: typeof r.adresse_1 === 'string' ? r.adresse_1 : undefined,
    codePostal: typeof r.code_postal === 'string' ? r.code_postal : undefined,
    commune: typeof r.nom_commune === 'string' ? r.nom_commune : undefined,
    codeCommune: typeof r.code_commune === 'string' ? r.code_commune : undefined,
    departement: typeof r.libelle_departement === 'string' ? r.libelle_departement : undefined,
    academie: typeof r.libelle_academie === 'string' ? r.libelle_academie : undefined,
    latitude: typeof r.latitude === 'number' ? r.latitude : undefined,
    longitude: typeof r.longitude === 'number' ? r.longitude : undefined,
    fetchedAt: now,
    source: EDUCATION_SOURCE,
  };
}

// petit cache mémoire pour éviter de rejouer la même recherche
const memCache = new Map<string, EtablissementScolaire[]>();

/**
 * Recherche d'établissements ouverts (publics et privés). `widen=true`
 * supprime le filtre de type déduit de la classe (établissements polyvalents,
 * catégorisations imparfaites).
 */
export async function searchSchools(
  query: string,
  opts: { classe?: string; widen?: boolean; signal?: AbortSignal } = {},
): Promise<EtablissementScolaire[]> {
  const types = opts.widen ? [] : typesForClasse(opts.classe);
  const cacheKey = `${query.toLowerCase()}|${types.join(',')}`;
  const hit = memCache.get(cacheKey);
  if (hit) return hit;

  const candidates = buildWhereCandidates(query, types);
  let lastErr: unknown;
  for (const where of candidates) {
    try {
      const res = await exploreRecords(ANNUAIRE_DATASET, {
        select: FIELDS,
        where,
        limit: 20,
        order_by: 'nom_etablissement',
      }, opts.signal);
      const now = new Date().toISOString();
      const list = (res.results ?? [])
        .filter((r: any) => r?.etat === undefined || /ouvert/i.test(String(r.etat)))
        .map((r: any) => mapSchoolRecord(r, now))
        .filter((x): x is EtablissementScolaire => x !== null);
      memCache.set(cacheKey, list);
      if (memCache.size > 60) memCache.delete(memCache.keys().next().value as string);
      return list;
    } catch (e) {
      lastErr = e;
      // syntaxe refusée → clause suivante ; toute autre erreur → remonter
      if (!(e instanceof EducationApiError && e.status === 400)) throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new EducationApiError('Recherche impossible');
}
