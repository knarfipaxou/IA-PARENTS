import type { Child } from '../../data/mock';
import type { RevisionSheet } from '../../services/ai';
import type { ChildProfile } from '../../types/childProfile';
import type { SavedLesson } from './types';

/** Données de démonstration créées au tout premier lancement de l'app. */
export function buildDemoData(): { kids: Child[]; lessons: SavedLesson[]; profiles: Record<string, ChildProfile> } {
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
