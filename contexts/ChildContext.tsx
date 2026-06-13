import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { type Child, type Echeance } from '../data/mock';
import { getJSON, setJSON } from '../lib/storage';
import type { RevisionSheet, Flashcards, Exercises, MiniTest, MockExam } from '../services/ai';
import {
  type GamificationData,
  type XPReason,
  type BadgeId,
  DEFAULT_GAMIFICATION,
  applyXP,
  checkBadges,
  XP_VALUES,
} from '../lib/gamification';
import type { ChildProfile, DrillSession, DrillResult } from '../types/childProfile';

export type GeneratedKind =
  | 'lesson'
  | 'devoirs'
  | 'fiche'
  | 'flashcards'
  | 'exercices'
  | 'minitest'
  | 'controle';

type GeneratedStore = Record<string, Partial<Record<GeneratedKind, any>>>;

// ─── Saved lessons ───────────────────────────────────────────────────────────

export interface SavedLesson {
  id: string;
  childId: string;
  createdAt: string;
  matiere: string;
  titre: string;
  niveau?: string;
  notions: string[];
  resume: string;
  imageBase64?: string;
  fiche?: RevisionSheet;
  flashcards?: Flashcards;
  exercices?: Exercises;
  minitest?: MiniTest;
  controleBlanc?: MockExam;
}

interface ChildCtxValue {
  child: Child | null;
  setChild: (c: Child | null) => void;
  children: Child[];
  hydrated: boolean;
  addChild: (data: Omit<Child, 'id'> & { id?: string }) => Child;
  updateChild: (id: string, patch: Partial<Child>) => void;
  removeChild: (id: string) => void;
  archiveChild: (id: string) => void;
  restoreChild: (id: string) => void;
  deleteChildPermanently: (id: string) => void;
  addEcheance: (childId: string, echeance: Echeance) => void;
  updateEcheance: (childId: string, echeanceId: string, patch: Partial<Echeance>) => void;
  removeEcheance: (childId: string, echeanceId: string) => void;
  saveGenerated: (childId: string, kind: GeneratedKind, content: any) => void;
  getGenerated: (childId: string, kind: GeneratedKind) => any;
  lessons: SavedLesson[];
  addLesson: (lesson: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => SavedLesson;
  updateLesson: (id: string, patch: Partial<SavedLesson>) => void;
  removeLesson: (id: string) => void;
  lessonsForChild: (childId: string) => SavedLesson[];
  getLesson: (id: string) => SavedLesson | undefined;
  gamification: (childId: string) => GamificationData;
  addXP: (childId: string, amount: number, reason: XPReason) => BadgeId[];
  // profiles
  profiles: Record<string, ChildProfile>;
  addProfile: (profile: ChildProfile) => void;
  updateProfile: (childId: string, patch: Partial<ChildProfile>) => void;
  getProfile: (childId: string) => ChildProfile | undefined;
  // drill sessions
  drillSessions: DrillSession[];
  addDrillSession: (session: DrillSession) => void;
  updateDrillSession: (id: string, patch: Partial<DrillSession>) => void;
  getDrillSessions: (childId: string) => DrillSession[];
  drillResults: DrillResult[];
  addDrillResult: (result: DrillResult) => void;
  getDrillResults: (childId: string) => DrillResult[];
}

const ChildCtx = createContext<ChildCtxValue>({
  child: null,
  setChild: () => {},
  children: [],
  hydrated: false,
  addChild: () => ({} as Child),
  updateChild: () => {},
  removeChild: () => {},
  archiveChild: () => {},
  restoreChild: () => {},
  deleteChildPermanently: () => {},
  addEcheance: () => {},
  updateEcheance: () => {},
  removeEcheance: () => {},
  saveGenerated: () => {},
  getGenerated: () => undefined,
  lessons: [],
  addLesson: () => ({ id: '', childId: '', createdAt: '', matiere: '', titre: '', notions: [], resume: '' }),
  updateLesson: () => {},
  removeLesson: () => {},
  lessonsForChild: () => [],
  getLesson: () => undefined,
  gamification: () => DEFAULT_GAMIFICATION,
  addXP: () => [],
  profiles: {},
  addProfile: () => {},
  updateProfile: () => {},
  getProfile: () => undefined,
  drillSessions: [],
  addDrillSession: () => {},
  updateDrillSession: () => {},
  getDrillSessions: () => [],
  drillResults: [],
  addDrillResult: () => {},
  getDrillResults: () => [],
});

const KEY_CHILDREN = 'ppia.children';
const KEY_GENERATED = 'ppia.generated';
const KEY_LESSONS = 'ppia.lessons';
const KEY_DEMO = 'ppia.demoSeeded';
const KEY_GAMIFICATION = 'ppia.gamification';
const KEY_PROFILES = 'ppia.profiles';
const KEY_DRILLS = 'ppia.drills';
const KEY_DRILL_RESULTS = 'ppia.drillResults';

function hydrateChild(c: Child): Child {
  return {
    ...c,
    archived: c.archived ?? false,
    echeances: (c.echeances ?? []).map((e) => ({ ...e, lessonIds: e.lessonIds ?? [] })),
  } as Child;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

function buildDemoData(): { kids: Child[]; lessons: SavedLesson[]; profiles: Record<string, ChildProfile> } {
  const mockFiche = (titre: string, resume: string, notions: string[]): RevisionSheet => ({
    titre,
    sections: [{ titre: 'Points essentiels', contenu: resume, points_cles: notions.slice(0, 3) }],
  });

  const lucasLessons: SavedLesson[] = [
    {
      id: 'demo-lesson-lucas-1', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'Mathématiques', titre: 'Les fractions',
      notions: ['numérateur', 'dénominateur', 'simplification', 'fractions équivalentes', 'comparaison', 'addition de fractions'],
      resume: "Une fraction représente une partie d'un tout. Le numérateur indique le nombre de parts prises, le dénominateur le nombre total de parts. On peut simplifier une fraction en divisant les deux termes par leur PGCD.",
      fiche: mockFiche('Les fractions', "Une fraction représente une partie d'un tout.", ['numérateur', 'dénominateur', 'simplification']),
    },
    {
      id: 'demo-lesson-lucas-2', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'SVT', titre: 'La reproduction des végétaux à fleurs',
      notions: ['fleur', 'pollinisation', 'pistil', 'étamine', 'graine', 'fruit', 'dispersion'],
      resume: "Les plantes à fleurs se reproduisent grâce à la pollinisation. Le pollen des étamines rejoint le pistil, forme une graine enfermée dans un fruit. Les graines sont ensuite dispersées par le vent, les animaux ou l'eau.",
      fiche: mockFiche('Reproduction des végétaux', "Les plantes se reproduisent par pollinisation.", ['fleur', 'pollinisation', 'graine']),
    },
    {
      id: 'demo-lesson-lucas-3', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'Histoire-Géo', titre: "L'Empire romain",
      notions: ['Auguste', 'sénat', 'légions', 'provinces', 'romanisation', 'voies romaines', 'citoyenneté'],
      resume: "Auguste fonde l'Empire romain en -27 av. J.-C. L'armée, organisée en légions, maintient l'ordre dans les provinces. La romanisation diffuse la langue, le droit et les infrastructures romaines.",
      fiche: mockFiche("L'Empire romain", "Auguste fonde l'Empire romain.", ['Auguste', 'légions', 'romanisation']),
    },
    {
      id: 'demo-lesson-lucas-4', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'Anglais', titre: 'Le prétérit simple',
      notions: ['regular verbs +ed', 'irregular verbs', 'did', 'did not', 'question form', 'time markers'],
      resume: "Le prétérit simple exprime une action terminée dans le passé. Les verbes réguliers prennent -ed, les irréguliers ont une forme propre. La négation utilise 'did not' et la question 'Did...'?",
      fiche: mockFiche('Past Simple', "Le prétérit exprime le passé.", ['regular verbs', 'irregular verbs', 'did']),
    },
    {
      id: 'demo-lesson-lucas-5', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'Français', titre: 'Les figures de style',
      notions: ['comparaison', 'métaphore', 'hyperbole', 'personnification', 'allitération', 'antithèse'],
      resume: "Les figures de style enrichissent le texte littéraire. La comparaison utilise 'comme', la métaphore compare sans outil. L'hyperbole exagère, la personnification donne vie aux objets.",
      fiche: mockFiche('Figures de style', "Les figures de style enrichissent le texte.", ['comparaison', 'métaphore', 'hyperbole']),
    },
    {
      id: 'demo-lesson-lucas-6', childId: 'demo-child-lucas', createdAt: new Date().toISOString(),
      matiere: 'Mathématiques', titre: 'Les équations du premier degré',
      notions: ['inconnue', 'membre gauche', 'membre droit', 'résolution', 'vérification', 'équation'],
      resume: "Une équation du premier degré contient une inconnue (x) à la puissance 1. Pour la résoudre, on effectue les mêmes opérations des deux côtés pour isoler l'inconnue. On vérifie en réinjectant la solution.",
      fiche: mockFiche('Équations', "Une équation isole une inconnue.", ['inconnue', 'résolution', 'vérification']),
    },
  ];

  const lucas: Child = {
    id: 'demo-child-lucas', kind: 'college', name: 'Lucas', classe: '6e', age: 12,
    accent: 'green', progress: 72, archived: false,
    next: { subj: 'Maths', type: 'Contrôle', days: 5, accent: 'coral' },
    mission: { subj: 'Maths', min: 12, obj: 'Savoir simplifier et comparer des fractions', notion: 'Les fractions' },
    matieres: [
      { s: 'Mathématiques', v: 78, a: 'green', icon: 'calculator-outline' },
      { s: 'SVT', v: 65, a: 'coral', icon: 'flask-outline' },
      { s: 'Histoire-Géo', v: 71, a: 'amber', icon: 'earth-outline' },
      { s: 'Anglais', v: 82, a: 'blue', icon: 'language-outline' },
      { s: 'Français', v: 69, a: 'violet', icon: 'book-outline' },
    ],
    forts: ['Calcul mental', 'Lecture'], faibles: ['Problèmes écrits', 'Orthographe'],
    history: [{ subj: 'Maths', type: 'Contrôle', score: '14/20', date: 'Mai', accent: 'green' }],
    echeances: [
      { id: 'demo-ech-lucas-1', subj: 'Maths', type: 'Contrôle', date: '17 juin', days: 5, status: 'confirme', accent: 'coral', icon: 'calculator-outline', urg: true, titre: 'Fractions et opérations', consigne: 'Savoir simplifier, comparer et additionner des fractions.', lessonIds: ['demo-lesson-lucas-1'], generated: {} },
      { id: 'demo-ech-lucas-2', subj: 'SVT', type: 'Composition', date: '22 juin', days: 10, status: 'confirme', accent: 'green', icon: 'flask-outline', titre: 'Reproduction des végétaux', consigne: 'Expliquer le cycle de reproduction des plantes à fleurs.', lessonIds: ['demo-lesson-lucas-2'], generated: {} },
      { id: 'demo-ech-lucas-3', subj: 'Histoire-Géo', type: 'DS', date: '26 juin', days: 14, status: 'confirme', accent: 'amber', icon: 'earth-outline', titre: "L'Empire romain", consigne: "Connaître Auguste, les légions et la romanisation des provinces.", lessonIds: ['demo-lesson-lucas-3'], generated: {} },
      { id: 'demo-ech-lucas-4', subj: 'Anglais', type: 'Interro', date: '19 juin', days: 7, status: 'confirme', accent: 'blue', icon: 'language-outline', titre: 'Past Simple', consigne: "Conjuguer au prétérit (verbes réguliers et irréguliers).", lessonIds: ['demo-lesson-lucas-4'], generated: {} },
      { id: 'demo-ech-lucas-5', subj: 'Français', type: 'Contrôle', date: '3 juil', days: 21, status: 'confirme', accent: 'violet', icon: 'book-outline', titre: 'Figures de style', consigne: "Identifier et utiliser les figures de style dans un texte.", lessonIds: ['demo-lesson-lucas-5'], generated: {} },
      { id: 'demo-ech-lucas-6', subj: 'Maths', type: 'Contrôle', date: '15 juin', days: 3, status: 'confirme', accent: 'coral', icon: 'calculator-outline', urg: true, titre: "Équations du premier degré", consigne: "Résoudre une équation du premier degré avec une inconnue.", lessonIds: ['demo-lesson-lucas-6'], generated: {} },
    ],
  } as Child;

  const emmaLessons: SavedLesson[] = [
    {
      id: 'demo-lesson-emma-1', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Physique-Chimie', titre: "Les états de la matière",
      notions: ['solide', 'liquide', 'gazeux', 'fusion', 'vaporisation', 'solidification', 'condensation'],
      resume: "La matière existe sous trois états selon la température. La fusion (solide → liquide), la vaporisation (liquide → gaz) et leurs inverses sont des changements d'état physiques, réversibles.",
      fiche: mockFiche("États de la matière", "La matière a trois états.", ['solide', 'liquide', 'gazeux']),
    },
    {
      id: 'demo-lesson-emma-2', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Mathématiques', titre: 'La proportionnalité',
      notions: ['tableau de valeurs', 'coefficient de proportionnalité', 'règle de trois', 'pourcentage', 'graphique'],
      resume: "Deux grandeurs sont proportionnelles si leurs quotients sont constants. On peut utiliser un tableau de valeurs ou la règle de trois pour calculer une valeur manquante.",
      fiche: mockFiche('Proportionnalité', "Deux grandeurs proportionnelles ont un quotient constant.", ['coefficient', 'règle de trois', 'tableau']),
    },
    {
      id: 'demo-lesson-emma-3', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Français', titre: 'Le roman policier',
      notions: ['enquêteur', 'suspect', 'mobile', 'alibi', 'indice', 'dénouement', 'énigme'],
      resume: "Le roman policier tourne autour d'une énigme à résoudre. L'enquêteur suit les indices pour démasquer le coupable. Le lecteur devient complice et cherche à deviner avant la révélation finale.",
      fiche: mockFiche('Roman policier', "Le roman policier tourne autour d'une énigme.", ['enquêteur', 'suspect', 'indice']),
    },
    {
      id: 'demo-lesson-emma-4', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Latin', titre: 'La 1ère déclinaison latine',
      notions: ['nominatif', 'accusatif', 'génitif', 'datif', 'ablatif', 'rosa', 'déclinaison'],
      resume: "En latin, les mots changent de forme selon leur fonction dans la phrase. La 1ère déclinaison (mots en -a comme rosa) possède 6 cas indiquant si le mot est sujet, complément, etc.",
      fiche: mockFiche('1ère déclinaison', "Les mots latins se déclinent selon leur fonction.", ['nominatif', 'accusatif', 'rosa']),
    },
    {
      id: 'demo-lesson-emma-5', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Physique-Chimie', titre: 'Les mélanges',
      notions: ['mélange homogène', 'mélange hétérogène', 'filtration', 'décantation', 'distillation', 'dissolution'],
      resume: "Un mélange homogène semble uniforme (eau sucrée), un mélange hétérogène laisse voir ses composants (eau et sable). On les sépare par filtration, décantation ou distillation.",
      fiche: mockFiche('Les mélanges', "Un mélange peut être homogène ou hétérogène.", ['filtration', 'décantation', 'homogène']),
    },
    {
      id: 'demo-lesson-emma-6', childId: 'demo-child-emma', createdAt: new Date().toISOString(),
      matiere: 'Mathématiques', titre: 'Les statistiques',
      notions: ['moyenne', 'médiane', 'étendue', 'effectif', 'fréquence', 'diagramme'],
      resume: "Les statistiques permettent d'analyser une série de données. La moyenne est la somme divisée par le nombre de valeurs. La médiane est la valeur centrale. L'étendue mesure l'écart entre le max et le min.",
      fiche: mockFiche('Statistiques', "Les statistiques analysent des séries de données.", ['moyenne', 'médiane', 'étendue']),
    },
  ];

  const emma: Child = {
    id: 'demo-child-emma', kind: 'college', name: 'Emma', classe: '6e', age: 11,
    accent: 'violet', progress: 58, archived: false,
    next: { subj: 'Français', type: 'Contrôle', days: 4, accent: 'violet' },
    mission: { subj: 'Français', min: 10, obj: "Reconnaître les figures de style dans un texte", notion: 'Le roman policier' },
    matieres: [
      { s: 'Physique-Chimie', v: 74, a: 'blue', icon: 'flask-outline' },
      { s: 'Mathématiques', v: 61, a: 'green', icon: 'calculator-outline' },
      { s: 'Français', v: 79, a: 'violet', icon: 'book-outline' },
      { s: 'Latin', v: 55, a: 'amber', icon: 'library-outline' },
    ],
    forts: ['Rédaction', 'Observation'], faibles: ['Calcul', 'Mémorisation'],
    history: [{ subj: 'Français', type: 'Rédaction', score: '16/20', date: 'Mai', accent: 'violet' }],
    echeances: [
      { id: 'demo-ech-emma-1', subj: 'Physique-Chimie', type: 'Contrôle', date: '20 juin', days: 8, status: 'confirme', accent: 'blue', icon: 'flask-outline', titre: "États de la matière", consigne: "Décrire les états solide, liquide et gazeux et leurs transformations.", lessonIds: ['demo-lesson-emma-1'], generated: {} },
      { id: 'demo-ech-emma-2', subj: 'Maths', type: 'Contrôle', date: '24 juin', days: 12, status: 'confirme', accent: 'green', icon: 'calculator-outline', titre: 'Proportionnalité', consigne: "Résoudre des problèmes de proportionnalité (règle de trois).", lessonIds: ['demo-lesson-emma-2'], generated: {} },
      { id: 'demo-ech-emma-3', subj: 'Français', type: 'Contrôle', date: '16 juin', days: 4, status: 'confirme', accent: 'violet', icon: 'book-outline', urg: true, titre: 'Le roman policier', consigne: "Connaître les caractéristiques du roman policier.", lessonIds: ['demo-lesson-emma-3'], generated: {} },
      { id: 'demo-ech-emma-4', subj: 'Latin', type: 'Version', date: '28 juin', days: 16, status: 'confirme', accent: 'amber', icon: 'library-outline', titre: '1ère déclinaison latine', consigne: "Décliner les noms de la 1ère déclinaison (rosa, rosae).", lessonIds: ['demo-lesson-emma-4'], generated: {} },
      { id: 'demo-ech-emma-5', subj: 'Physique-Chimie', type: 'TP noté', date: '18 juin', days: 6, status: 'confirme', accent: 'blue', icon: 'flask-outline', titre: 'Les mélanges', consigne: "Distinguer mélanges homogènes et hétérogènes, techniques de séparation.", lessonIds: ['demo-lesson-emma-5'], generated: {} },
      { id: 'demo-ech-emma-6', subj: 'Maths', type: 'DS', date: '7 juil', days: 25, status: 'incertain', accent: 'green', icon: 'calculator-outline', titre: 'Statistiques', consigne: "Calculer moyenne, médiane et étendue sur une série de données.", lessonIds: ['demo-lesson-emma-6'], generated: {} },
    ],
  } as Child;

  const now = new Date().toISOString();
  const demoProfiles: Record<string, ChildProfile> = {
    'demo-child-lucas': {
      childId: 'demo-child-lucas',
      etablissement: 'Collège Jean Moulin',
      pays: 'France',
      niveauEstime: 'bon',
      objectif: 'excellence',
      matieresPrioritaires: ['Mathématiques', 'Français', 'Anglais'],
      dureeQuotidienne: 30,
      rythme: 'semaine_weekend',
      pointsFaibles: ['fractions', 'problèmes écrits', 'orthographe'],
      pointsForts: ['calcul mental', 'lecture'],
      correctionDetaillee: true,
      versionImprimable: false,
      ton: 'exigeant',
      noteLibre: "Lucas est motivé en sciences. Varier les contextes de problèmes pour maintenir son intérêt.",
      createdAt: now,
      updatedAt: now,
    },
    'demo-child-emma': {
      childId: 'demo-child-emma',
      etablissement: 'Collège Jean Moulin',
      pays: 'France',
      niveauEstime: 'moyen',
      objectif: 'bon_niveau',
      matieresPrioritaires: ['Mathématiques', 'Français'],
      dureeQuotidienne: 20,
      rythme: 'semaine',
      pointsFaibles: ['proportionnalité', 'conjugaison'],
      pointsForts: ['expression écrite', 'latin'],
      correctionDetaillee: true,
      versionImprimable: false,
      ton: 'bienveillant',
      noteLibre: undefined,
      createdAt: now,
      updatedAt: now,
    },
  };

  return {
    kids: [lucas, emma],
    lessons: [...lucasLessons, ...emmaLessons],
    profiles: demoProfiles,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [child, setChildState] = useState<Child | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [generated, setGenerated] = useState<GeneratedStore>({});
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [gamificationStore, setGamificationStore] = useState<Record<string, GamificationData>>({});
  const [profiles, setProfiles] = useState<Record<string, ChildProfile>>({});
  const [drillSessions, setDrillSessions] = useState<DrillSession[]>([]);
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);
  const generatedRef = useRef(generated);
  generatedRef.current = generated;
  const lessonsRef = useRef(lessons);
  lessonsRef.current = lessons;
  const gamificationRef = useRef(gamificationStore);
  gamificationRef.current = gamificationStore;
  const drillSessionsRef = useRef(drillSessions);
  drillSessionsRef.current = drillSessions;
  const drillResultsRef = useRef(drillResults);
  drillResultsRef.current = drillResults;

  useEffect(() => {
    (async () => {
      const stored = await getJSON<Child[] | null>(KEY_CHILDREN, null);
      const demoSeeded = await getJSON<boolean>(KEY_DEMO, false);

      if (stored && Array.isArray(stored) && stored.length > 0) {
        setKids(stored.map(hydrateChild));
      } else if (!demoSeeded) {
        // First launch: seed demo data
        const { kids: demoKids, lessons: demoLessons, profiles: demoProfiles } = buildDemoData();
        setKids(demoKids);
        setLessons(demoLessons);
        await setJSON(KEY_CHILDREN, demoKids);
        await setJSON(KEY_LESSONS, demoLessons);
        await setJSON(KEY_DEMO, true);
        const gen = await getJSON<GeneratedStore>(KEY_GENERATED, {});
        setGenerated(gen);
        const gam = await getJSON<Record<string, GamificationData>>(KEY_GAMIFICATION, {});
        setGamificationStore(gam);
        const storedProfs = await getJSON<Record<string, ChildProfile>>(KEY_PROFILES, {});
        const profs = Object.keys(storedProfs).length > 0 ? storedProfs : demoProfiles;
        await setJSON(KEY_PROFILES, profs);
        setProfiles(profs);
        const drills = await getJSON<DrillSession[]>(KEY_DRILLS, []);
        setDrillSessions(Array.isArray(drills) ? drills : []);
        const results = await getJSON<DrillResult[]>(KEY_DRILL_RESULTS, []);
        setDrillResults(Array.isArray(results) ? results : []);
        setHydrated(true);
        return;
      } else {
        setKids([]);
      }

      const gen = await getJSON<GeneratedStore>(KEY_GENERATED, {});
      setGenerated(gen);
      const less = await getJSON<SavedLesson[]>(KEY_LESSONS, []);
      setLessons(Array.isArray(less) ? less : []);
      const gam = await getJSON<Record<string, GamificationData>>(KEY_GAMIFICATION, {});
      setGamificationStore(gam);
      const profs = await getJSON<Record<string, ChildProfile>>(KEY_PROFILES, {});
      setProfiles(profs);
      const drills = await getJSON<DrillSession[]>(KEY_DRILLS, []);
      setDrillSessions(Array.isArray(drills) ? drills : []);
      const results = await getJSON<DrillResult[]>(KEY_DRILL_RESULTS, []);
      setDrillResults(Array.isArray(results) ? results : []);
      setHydrated(true);
    })();
  }, []);

  const setChild = useCallback((c: Child | null) => {
    setChildState(c);
  }, []);

  const addChild = useCallback(
    (data: Omit<Child, 'id'> & { id?: string }): Child => {
      const id = data.id ?? `child-${Date.now()}`;
      const c = hydrateChild({ ...data, id } as Child);
      setKids((prev) => {
        const next = [...prev, c];
        setJSON(KEY_CHILDREN, next);
        return next;
      });
      return c;
    },
    []
  );

  const updateChild = useCallback((id: string, patch: Partial<Child>) => {
    setKids((prev) => {
      const next = prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Child) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? ({ ...cur, ...patch } as Child) : cur));
  }, []);

  const removeChild = useCallback((id: string) => {
    setKids((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  const archiveChild = useCallback((id: string) => {
    updateChild(id, { archived: true, archivedAt: new Date().toISOString() } as Partial<Child>);
  }, [updateChild]);

  const restoreChild = useCallback((id: string) => {
    updateChild(id, { archived: false, archivedAt: undefined } as Partial<Child>);
  }, [updateChild]);

  const deleteChildPermanently = useCallback((id: string) => {
    setKids((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setLessons((prev) => {
      const next = prev.filter((l) => l.childId !== id);
      setJSON(KEY_LESSONS, next);
      return next;
    });
    setGenerated((prev) => {
      const next = { ...prev };
      delete next[id];
      setJSON(KEY_GENERATED, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  const addEcheance = useCallback((childId: string, echeance: Echeance) => {
    const e: Echeance = { ...echeance, lessonIds: echeance.lessonIds ?? [] };
    setKids((prev) => {
      const next = prev.map((c) =>
        c.id === childId ? ({ ...c, echeances: [...(c.echeances ?? []), e] } as Child) : c
      );
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) =>
      cur && cur.id === childId
        ? ({ ...cur, echeances: [...(cur.echeances ?? []), e] } as Child)
        : cur
    );
  }, []);

  const updateEcheance = useCallback((childId: string, echeanceId: string, patch: Partial<Echeance>) => {
    const apply = (c: Child): Child =>
      ({
        ...c,
        echeances: (c.echeances ?? []).map((e) => (e.id === echeanceId ? { ...e, ...patch } : e)),
      } as Child);
    setKids((prev) => {
      const next = prev.map((c) => (c.id === childId ? apply(c) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === childId ? apply(cur) : cur));
  }, []);

  const removeEcheance = useCallback((childId: string, echeanceId: string) => {
    const apply = (c: Child): Child =>
      ({ ...c, echeances: (c.echeances ?? []).filter((e) => e.id !== echeanceId) } as Child);
    setKids((prev) => {
      const next = prev.map((c) => (c.id === childId ? apply(c) : c));
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) => (cur && cur.id === childId ? apply(cur) : cur));
  }, []);

  const saveGenerated = useCallback((childId: string, kind: GeneratedKind, content: any) => {
    setGenerated((prev) => {
      const next: GeneratedStore = {
        ...prev,
        [childId]: { ...(prev[childId] ?? {}), [kind]: content },
      };
      setJSON(KEY_GENERATED, next);
      return next;
    });
  }, []);

  const getGenerated = useCallback((childId: string, kind: GeneratedKind) => {
    return generatedRef.current[childId]?.[kind];
  }, []);

  const addLesson = useCallback(
    (data: Omit<SavedLesson, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): SavedLesson => {
      const lesson: SavedLesson = {
        ...data,
        id: data.id ?? `lesson-${Date.now()}`,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
      setLessons((prev) => {
        const next = [lesson, ...prev];
        setJSON(KEY_LESSONS, next);
        return next;
      });
      return lesson;
    },
    []
  );

  const updateLesson = useCallback((id: string, patch: Partial<SavedLesson>) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      setJSON(KEY_LESSONS, next);
      return next;
    });
  }, []);

  const removeLesson = useCallback((id: string) => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      setJSON(KEY_LESSONS, next);
      return next;
    });
    setKids((prev) => {
      const next = prev.map((c) =>
        ({
          ...c,
          echeances: (c.echeances ?? []).map((e) =>
            e.lessonIds && e.lessonIds.includes(id)
              ? { ...e, lessonIds: e.lessonIds.filter((x) => x !== id) }
              : e
          ),
        } as Child)
      );
      setJSON(KEY_CHILDREN, next);
      return next;
    });
    setChildState((cur) =>
      cur
        ? ({
            ...cur,
            echeances: (cur.echeances ?? []).map((e) =>
              e.lessonIds && e.lessonIds.includes(id)
                ? { ...e, lessonIds: e.lessonIds.filter((x) => x !== id) }
                : e
            ),
          } as Child)
        : cur
    );
  }, []);

  const lessonsForChild = useCallback((childId: string) => {
    return lessonsRef.current.filter((l) => l.childId === childId);
  }, []);

  const getLesson = useCallback((id: string) => {
    return lessonsRef.current.find((l) => l.id === id);
  }, []);

  const gamification = useCallback((childId: string): GamificationData => {
    return gamificationRef.current[childId] ?? DEFAULT_GAMIFICATION;
  }, []);

  const addProfile = useCallback((profile: ChildProfile) => {
    setProfiles((prev) => {
      const next = { ...prev, [profile.childId]: profile };
      setJSON(KEY_PROFILES, next);
      return next;
    });
  }, []);

  const updateProfile = useCallback((childId: string, patch: Partial<ChildProfile>) => {
    setProfiles((prev) => {
      const existing = prev[childId];
      if (!existing) return prev;
      const next = { ...prev, [childId]: { ...existing, ...patch, updatedAt: new Date().toISOString() } };
      setJSON(KEY_PROFILES, next);
      return next;
    });
  }, []);

  const getProfile = useCallback((childId: string): ChildProfile | undefined => {
    return profiles[childId];
  }, [profiles]);

  const addDrillSession = useCallback((session: DrillSession) => {
    setDrillSessions((prev) => {
      const next = [session, ...prev];
      setJSON(KEY_DRILLS, next);
      return next;
    });
  }, []);

  const updateDrillSession = useCallback((id: string, patch: Partial<DrillSession>) => {
    setDrillSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      setJSON(KEY_DRILLS, next);
      return next;
    });
  }, []);

  const getDrillSessions = useCallback((childId: string): DrillSession[] => {
    return drillSessionsRef.current.filter((s) => s.childId === childId);
  }, []);

  const addDrillResult = useCallback((result: DrillResult) => {
    setDrillResults((prev) => {
      const next = [result, ...prev];
      setJSON(KEY_DRILL_RESULTS, next);
      return next;
    });
  }, []);

  const getDrillResults = useCallback((childId: string): DrillResult[] => {
    return drillResultsRef.current.filter((r) => r.childId === childId);
  }, []);

  const addXP = useCallback((childId: string, amount: number, reason: XPReason): BadgeId[] => {
    let newBadges: BadgeId[] = [];
    setGamificationStore((prev) => {
      const current = prev[childId] ?? DEFAULT_GAMIFICATION;
      const afterXP = applyXP(current, amount, reason);
      const { data: afterBadges, newBadges: nb } = checkBadges(afterXP);
      newBadges = nb;
      const next = { ...prev, [childId]: afterBadges };
      setJSON(KEY_GAMIFICATION, next);
      return next;
    });
    return newBadges;
  }, []);

  return (
    <ChildCtx.Provider
      value={{
        child,
        setChild,
        children: kids,
        hydrated,
        addChild,
        updateChild,
        removeChild,
        archiveChild,
        restoreChild,
        deleteChildPermanently,
        addEcheance,
        updateEcheance,
        removeEcheance,
        saveGenerated,
        getGenerated,
        lessons,
        addLesson,
        updateLesson,
        removeLesson,
        lessonsForChild,
        getLesson,
        gamification,
        addXP,
        profiles,
        addProfile,
        updateProfile,
        getProfile,
        drillSessions,
        addDrillSession,
        updateDrillSession,
        getDrillSessions,
        drillResults,
        addDrillResult,
        getDrillResults,
      }}
    >
      {reactChildren}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  return useContext(ChildCtx);
}
