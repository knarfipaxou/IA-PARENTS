import { cycleForClasse, classesForCycle, degreForCycle, CYCLE_LABELS } from '../lib/cycles';
import { tokenize, overlapScore, matchLessonToProgram, type ProgramEntry } from '../lib/programMatch';
import { buildWhereCandidates, mapSchoolRecord, typesForClasse } from '../services/education/annuaire';
import {
  normalizeProgramRecord, entryMatchesCycle, buildProgramContext,
  isProgrammeActif,
} from '../services/education/programmes';

// ─── Cycles officiels ────────────────────────────────────────────────────────

describe('cycles officiels', () => {
  it('classe → cycle', () => {
    expect(cycleForClasse('GS')).toBe('cycle1');
    expect(cycleForClasse('CE1')).toBe('cycle2');
    expect(cycleForClasse('CM2')).toBe('cycle3');
    expect(cycleForClasse('6e')).toBe('cycle3');
    expect(cycleForClasse('5e')).toBe('cycle4');
    expect(cycleForClasse('Terminale')).toBe('lycee');
    expect(cycleForClasse('inconnu')).toBeNull();
  });
  it('cycle 3 à cheval sur les deux degrés', () => {
    expect(degreForCycle('cycle2')).toBe('premier');
    expect(degreForCycle('cycle3')).toBe('both');
    expect(degreForCycle('cycle4')).toBe('second');
  });
  it('classes du cycle', () => {
    expect(classesForCycle('cycle4')).toEqual(['5e', '4e', '3e']);
  });
});

// ─── Annuaire : construction de requêtes et validation ───────────────────────

describe('annuaire des établissements', () => {
  it('filtre de type déduit de la classe (jamais bloquant : élargissable)', () => {
    expect(typesForClasse('GS')).toEqual(['Ecole']);
    expect(typesForClasse('CM1')).toEqual(['Ecole']);
    expect(typesForClasse('5e')).toEqual(['Collège']);
    expect(typesForClasse('Terminale')).toEqual(['Lycée']);
    expect(typesForClasse(undefined)).toEqual([]);
  });

  it('code UAI → recherche exacte par identifiant', () => {
    const [w] = buildWhereCandidates('0750663k', ['Collège']);
    expect(w).toBe('identifiant_de_l_etablissement = "0750663K"');
  });

  it('code postal → recherche par code_postal / code_commune avec filtre de type', () => {
    const cands = buildWhereCandidates('75016', ['Collège']);
    expect(cands[0]).toContain('code_postal = "75016"');
    expect(cands[0]).toContain('type_etablissement IN ("Collège")');
  });

  it('texte libre → plein texte avec replis en cas de refus de syntaxe', () => {
    const cands = buildWhereCandidates('Saint-Exupéry', []);
    expect(cands.length).toBeGreaterThanOrEqual(2);
    expect(cands[0]).toContain('search(');
  });

  it('mapSchoolRecord : validation stricte de l\'UAI et tolérance des champs absents', () => {
    const ok = mapSchoolRecord({
      identifiant_de_l_etablissement: '0750663K', nom_etablissement: 'Collège Saint-Exupéry',
      type_etablissement: 'Collège', statut_public_prive: 'Privé',
      code_postal: '75016', nom_commune: 'Paris', latitude: 48.86,
    }, '2026-07-19T00:00:00.000Z');
    expect(ok?.uai).toBe('0750663K');
    expect(ok?.statut).toBe('Privé');
    expect(ok?.latitude).toBe(48.86);
    expect(ok?.commune).toBe('Paris');
    // réponse incomplète : rejetée plutôt qu'inventée
    expect(mapSchoolRecord({ nom_etablissement: 'Sans UAI' })).toBeNull();
    expect(mapSchoolRecord({ identifiant_de_l_etablissement: 'X' })).toBeNull();
  });
});

// ─── Programmes : normalisation + rapprochement ─────────────────────────────

const ENTRIES: ProgramEntry[] = [
  {
    id: 'p1', dataset: 'fr-en-programmes-enseignement-2nd-degre',
    texte: 'Nombres et calculs : additionner et soustraire des fractions, simplifier une fraction, produire une fraction égale.',
    matiere: 'Mathématiques', cycle: 'Cycle 4', domaine: 'Nombres et calculs', reference: 'BOEN n°31',
  },
  {
    id: 'p2', dataset: 'fr-en-complements-programmes-second-degre',
    texte: 'Repères annuels : en 5e, addition et soustraction de fractions de même dénominateur.',
    matiere: 'Mathématiques', cycle: 'Cycle 4', niveau: '5e', domaine: 'Nombres et calculs',
  },
  {
    id: 'p3', dataset: 'fr-en-programmes-enseignement-2nd-degre',
    texte: 'Se chausser pour la course de demi-fond et gérer son effort sur une durée longue.',
    matiere: 'EPS', cycle: 'Cycle 4', domaine: 'Produire une performance',
  },
];

describe('rapprochement leçon ↔ programme (comparaison réelle, pas une devinette IA)', () => {
  const lesson = {
    matiere: 'Mathématiques', titre: 'Les fractions',
    notions: ['addition de fractions', 'soustraction de fractions', 'simplifier'],
    resume: 'Additionner et soustraire des fractions.',
  };

  it('trouve le domaine et la classe via les repères annuels explicites', () => {
    const m = matchLessonToProgram(lesson, ENTRIES, 'cycle4', '5e');
    expect(m).not.toBeNull();
    expect(m!.domaine).toBe('Nombres et calculs');
    expect(m!.classeEstimee).toBe('5e'); // niveau explicite du complément
    expect(m!.confiance).toBeGreaterThan(20);
    expect(m!.extraits.length).toBeGreaterThan(0);
  });

  it('sans niveau explicite : cycle certain, classe indéterminée clairement annoncée', () => {
    const noLevels = ENTRIES.map((e) => ({ ...e, niveau: undefined }));
    const m = matchLessonToProgram(lesson, noLevels, 'cycle4', '5e');
    expect(m!.classeEstimee).toBeNull();
    expect(m!.classesPossibles).toEqual(['5e', '4e', '3e']);
    expect(m!.explication).toContain('ne peut pas être déterminée');
  });

  it('aucune correspondance fiable → null (jamais de valeur inventée)', () => {
    const m = matchLessonToProgram({ titre: 'zzz', notions: ['xxyyzz'] }, ENTRIES, 'cycle4', '5e');
    expect(m).toBeNull();
  });

  it('tokenize/overlap : accents et mots vides neutralisés', () => {
    const a = tokenize('Les fractions égales et la simplification');
    expect(a.has('fractions')).toBe(true);
    expect(a.has('les')).toBe(false);
    expect(overlapScore(a, tokenize('simplifier une fraction egale — fractions'))).toBeGreaterThan(0);
  });
});

describe('normalisation des enregistrements de programmes', () => {
  it('découvre les champs par heuristique de nom (repli)', () => {
    const e = normalizeProgramRecord({
      discipline: 'Mathématiques', cycle: 'Cycle 4', niveau_scolaire: '5e',
      domaine_du_socle: 'Nombres et calculs',
      contenu: 'Additionner et soustraire des fractions de même dénominateur.',
    }, 'ds', 0);
    expect(e?.matiere).toBe('Mathématiques');
    expect(e?.niveau).toBe('5e');
    expect(e?.domaine).toBe('Nombres et calculs');
    expect(e?.texte).toContain('fractions');
  });

  it('mappe le schéma RÉEL Explore v2.1 (complément attendus 5e)', () => {
    const e = normalizeProgramRecord({
      descriptif: 'Mathématiques : attendus de fin de 5e',
      niveau_d_enseignement: '5e',
      nature_du_complement: 'Attendus',
      discipline: 'Mathématiques',
      texte_officiel: 'note de service n° 2019-072 du 28-5-2019 (BOEN n°22 du 29-5-2019)',
      lien_vers_le_texte_officiel: 'http://circulaires.legifrance.gouv.fr/index.php?action=afficherCirculaire',
      contenu: 'https://cache.media.education.gouv.fr/file/20/31/5/ensel283_annexe6_1120315.pdf',
      entre_en_vigueur_a_la_rentree: 2019.0,
      abroge_a_la_rentree: null,
    }, 'fr-en-complements-programmes-second-degre', 0);
    expect(e?.matiere).toBe('Mathématiques');
    expect(e?.niveau).toBe('5e');
    expect(e?.cycle).toBeUndefined(); // classe précise, pas un libellé de cycle
    expect(e?.sousDomaine).toBe('Attendus');
    expect(e?.domaine).toContain('attendus de fin de 5e');
    expect(e?.url).toContain('ensel283_annexe6');
    expect(e?.reference).toContain('BOEN');
    expect(e?.dateEntreeVigueur).toBe('2019');
    // les URLs ne doivent PAS polluer le texte de matching
    expect(e?.texte).not.toContain('https://');
    expect(e?.texte).not.toContain('cache.media');
  });

  it('split niveau_d_enseignement « cycle N » → cycle, pas classe', () => {
    const e = normalizeProgramRecord({
      descriptif: 'Mathématiques : repères annuels de progression pour le cycle 4',
      niveau_d_enseignement: 'cycle 4',
      nature_du_complement: 'Repères annuels de progression',
      discipline: 'Mathématiques',
      texte_officiel: 'note de service n° 2019-072',
      contenu: 'https://example.com/x.pdf',
    }, 'fr-en-complements-programmes-second-degre', 1);
    expect(e?.cycle).toBe('Cycle 4');
    expect(e?.niveau).toBeUndefined();
    expect(e?.matiere).toBe('Mathématiques');
  });

  it('programme premier degré : discipline « - » ignorée, Cycle capitalisé OK', () => {
    const e = normalizeProgramRecord({
      descriptif: "Programmes d'enseignement du cycle des apprentissages fondamentaux (cycle 2)",
      niveau_d_enseignement: 'Cycle 2',
      discipline: '-',
      texte_officiel: 'arrêté du 17-7-2018',
      contenu_sur_le_site: 'https://cache.media.education.gouv.fr/file/30/05/0/ensel169.pdf',
      entre_en_vigueur_a_la_rentree: '2018',
      abroge_a_la_rentree: '-',
    }, 'fr-en-programmes-enseignement-premier-degre', 0);
    expect(e?.cycle).toBe('Cycle 2');
    expect(e?.matiere).toBeUndefined();
    expect(e?.url).toContain('ensel169');
    expect(isProgrammeActif({ abroge_a_la_rentree: '-' })).toBe(true);
    expect(isProgrammeActif({ abroge_a_la_rentree: '2020' })).toBe(false);
  });

  it('enregistrement sans texte exploitable → ignoré (jamais inventé)', () => {
    expect(normalizeProgramRecord({ code: 'X1' }, 'ds', 0)).toBeNull();
    expect(normalizeProgramRecord({ contenu: 'https://only.a.url/x.pdf' }, 'ds', 0)).toBeNull();
  });

  it('entryMatchesCycle : cycle/niveau absents tolérés, incongruents exclus', () => {
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't' }, 'cycle4')).toBe(true);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', cycle: 'Cycle 4' }, 'cycle4')).toBe(true);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', cycle: 'Cycle 2' }, 'cycle4')).toBe(false);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: '5e' }, 'cycle4')).toBe(true);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: 'CE1' }, 'cycle4')).toBe(false);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: 'Terminale STL' }, 'lycee')).toBe(true);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: 'Deuxième année de CAP' }, 'cycle4')).toBe(false);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: 'Deuxième année de CAP' }, 'lycee')).toBe(true);
    expect(entryMatchesCycle({ id: 'a', dataset: 'd', texte: 't', niveau: 'Collège' }, 'cycle4')).toBe(true);
  });

  it('matching réel : leçon maths 5e → complément attendus (métadonnées EN)', () => {
    const entries = [
      normalizeProgramRecord({
        descriptif: 'Mathématiques : attendus de fin de 5e',
        niveau_d_enseignement: '5e', nature_du_complement: 'Attendus',
        discipline: 'Mathématiques', texte_officiel: 'BOEN n°22',
        contenu: 'https://cache.media.education.gouv.fr/file/x.pdf',
      }, 'fr-en-complements-programmes-second-degre', 0)!,
      normalizeProgramRecord({
        descriptif: 'Français : attendus de fin de 5e',
        niveau_d_enseignement: '5e', nature_du_complement: 'Attendus',
        discipline: 'Français', texte_officiel: 'BOEN n°22',
        contenu: 'https://cache.media.education.gouv.fr/file/y.pdf',
      }, 'fr-en-complements-programmes-second-degre', 1)!,
    ];
    const m = matchLessonToProgram({
      matiere: 'Mathématiques', titre: 'Les fractions',
      notions: ['addition de fractions', 'simplifier'],
      resume: 'Additionner des fractions.',
    }, entries, 'cycle4', '5e');
    expect(m).not.toBeNull();
    expect(m!.matiere).toBe('Mathématiques');
    expect(m!.classeEstimee).toBe('5e');
    expect(m!.extraits[0].url).toContain('.pdf');
  });
});

describe('contexte programme pour la génération', () => {
  const prog: any = {
    matiere: 'Mathématiques', cycle: 'cycle4', cycleLabel: CYCLE_LABELS.cycle4,
    classeEstimee: '5e', classesPossibles: ['5e'], notions: [], extraits: [{ texte: 't', reference: 'BOEN n°31', dataset: 'd' }],
    confiance: 80, explication: 'x', sourceUrl: '', fetchedAt: '',
  };

  it('référentiel injecté avec la règle « jamais ajouter de notions absentes »', () => {
    const ctx = buildProgramContext([prog]);
    expect(ctx).toContain('Cycle 4');
    expect(ctx).toContain('5e');
    expect(ctx).toContain('INTERDIT');
  });

  it('un rattachement signalé incorrect par le parent est exclu ; vide sans programme', () => {
    expect(buildProgramContext([{ ...prog, parent: { statut: 'incorrect', date: '' } }])).toBe('');
    expect(buildProgramContext([undefined])).toBe('');
  });

  it('la correction du parent (classe) est prioritaire sur l\'estimation', () => {
    const ctx = buildProgramContext([{ ...prog, classeEstimee: '4e', parent: { statut: 'corrige', classe: '5e', date: '' } }]);
    expect(ctx).toContain('5e');
    expect(ctx).not.toContain('4e');
  });
});
