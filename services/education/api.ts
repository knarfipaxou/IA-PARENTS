import { getJSON, setJSON } from '../../lib/storage';

// ─── Client API Explore v2.1 — data.education.gouv.fr ───────────────────────
// API ouverte de l'Éducation nationale (aucune clé requise). Toutes les
// requêtes vers ces jeux de données passent par cette couche : timeout,
// nouvelle tentative, validation minimale, cache local et journal d'erreurs.

export const EDUCATION_API_BASE = 'https://data.education.gouv.fr/api/explore/v2.1';
export const EDUCATION_SOURCE = 'data.education.gouv.fr (Licence Ouverte)';

const TIMEOUT_MS = 8000;
const RETRIES = 1;

export class EducationApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export interface ExploreResponse<T = any> {
  total_count?: number;
  results?: T[];
}

/**
 * GET /catalog/datasets/{dataset}/records avec timeout + retry.
 * `signal` permet d'annuler la requête (recherche avec autocomplétion).
 */
export async function exploreRecords<T = any>(
  dataset: string,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<ExploreResponse<T>> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${EDUCATION_API_BASE}/catalog/datasets/${dataset}/records?${qs}`;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 400) throw new EducationApiError('Requête invalide (400)', 400);
      if (!res.ok) throw new EducationApiError(`API Éducation nationale indisponible (${res.status})`, res.status);
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new EducationApiError('Réponse inattendue');
      return data as ExploreResponse<T>;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      // annulation volontaire (l'utilisateur a continué à taper) : ne pas réessayer
      if (signal?.aborted) throw new EducationApiError('Recherche annulée');
      // 400 = notre syntaxe est refusée : inutile de réessayer la même requête
      if (e instanceof EducationApiError && e.status === 400) throw e;
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }
  throw lastErr instanceof Error ? lastErr : new EducationApiError('Réseau indisponible');
}

// ─── Cache local générique (clé ppia.eduCache) ──────────────────────────────

interface CacheEntry<T> { fetchedAt: string; data: T }

const CACHE_KEY = 'ppia.eduCache';

export async function cachedFetch<T>(
  cacheId: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<{ data: T; fetchedAt: string; fromCache: boolean }> {
  const all = await getJSON<Record<string, CacheEntry<T>>>(CACHE_KEY, {});
  const hit = all?.[cacheId];
  if (hit && Date.now() - new Date(hit.fetchedAt).getTime() < ttlMs) {
    return { data: hit.data, fetchedAt: hit.fetchedAt, fromCache: true };
  }
  try {
    const data = await fetcher();
    const fetchedAt = new Date().toISOString();
    await setJSON(CACHE_KEY, { ...(all ?? {}), [cacheId]: { fetchedAt, data } });
    return { data, fetchedAt, fromCache: false };
  } catch (e) {
    // API indisponible : on ressert le cache même périmé plutôt que de bloquer
    if (hit) return { data: hit.data, fetchedAt: hit.fetchedAt, fromCache: true };
    throw e;
  }
}
