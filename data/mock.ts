import type { Enfant, Echeance, Mission, AnalyseResult } from '../types';

export const mockEnfants: Enfant[] = [
  {
    id: '1',
    prenom: 'Maxime',
    classe: '6ème B',
    avatar: null,
    matieres: ['SVT', 'Mathématiques', 'Français', 'Histoire-Géo', 'Anglais'],
  },
];

export const mockEcheances: Echeance[] = [
  {
    id: '1',
    enfantId: '1',
    matiere: 'SVT',
    type: 'Composition',
    titre: 'La reproduction des végétaux',
    date: '2026-06-10',
    notions: ['spores', 'prothalle', 'fougère', 'multiplication végétative'],
    priorite: 'haute',
    couleur: '#4CAF82',
    missionsTotal: 4,
    missionsFaites: 1,
  },
  {
    id: '2',
    enfantId: '1',
    matiere: 'Mathématiques',
    type: 'Contrôle',
    titre: 'Fractions et décimaux',
    date: '2026-06-14',
    notions: ['fractions', 'nombres décimaux', 'comparaison', 'addition'],
    priorite: 'normale',
    couleur: '#2C5F8A',
    missionsTotal: 5,
    missionsFaites: 0,
  },
  {
    id: '3',
    enfantId: '1',
    matiere: 'Français',
    type: 'Dictée',
    titre: 'Les accords du participe passé',
    date: '2026-06-18',
    notions: ['accord PP', 'auxiliaire être', 'auxiliaire avoir'],
    priorite: 'basse',
    couleur: '#E8A94D',
    missionsTotal: 3,
    missionsFaites: 0,
  },
];

export const mockMissions: Mission[] = [
  {
    id: '1',
    echeanceId: '1',
    titre: 'Spores et prothalle',
    duree: 12,
    statut: 'disponible',
    exercices: [
      {
        id: 'e1',
        type: 'rappel',
        contenu:
          'La fougère se reproduit grâce à des **spores**. Ces minuscules cellules tombent sur le sol humide et germent pour former le **prothalle**. Le prothalle est une petite plante bisexuée qui permet la reproduction sexuée.',
      },
      {
        id: 'e2',
        type: 'qcm',
        question: "Qu'est-ce qu'un prothalle ?",
        options: [
          'Une feuille de fougère adulte',
          "Une petite plante issue de la germination d'une spore",
          'Un type de racine souterraine',
          'Une graine modifiée de la fougère',
        ],
        bonneReponse: 1,
        explication:
          "Le prothalle est bien la petite plante bisexuée qui naît de la germination d'une spore. Il est indispensable à la reproduction sexuée de la fougère.",
      },
      {
        id: 'e3',
        type: 'texte_trous',
        question: 'Complète la phrase :',
        texte: 'La spore germe pour former le ___, qui produit ensuite des cellules reproductrices.',
        trous: ['prothalle'],
        explication:
          'La chaîne est : spore → prothalle → reproduction sexuée → nouvelle fougère.',
      },
      {
        id: 'e4',
        type: 'qcm',
        question: 'La multiplication végétative permet à la fougère de :',
        options: [
          'Se reproduire uniquement par graines',
          "Se reproduire sans spores ni gamètes, depuis ses propres organes",
          'Produire des fleurs colorées',
          'Survivre en hiver uniquement',
        ],
        bonneReponse: 1,
        explication:
          "La multiplication végétative est une reproduction asexuée : la fougère crée de nouveaux individus depuis ses rhizomes, sans passer par les spores.",
      },
    ],
  },
  {
    id: '2',
    echeanceId: '1',
    titre: 'Cycle de reproduction complet',
    duree: 10,
    statut: 'disponible',
    exercices: [
      {
        id: 'e5',
        type: 'rappel',
        contenu:
          "Il existe deux modes de reproduction chez la fougère : la **reproduction sexuée** (via les spores et le prothalle) et la **multiplication végétative** (via les rhizomes). Les deux permettent d'obtenir de nouvelles plantes.",
      },
      {
        id: 'e6',
        type: 'qcm',
        question: 'Dans quel ordre se déroule la reproduction sexuée de la fougère ?',
        options: [
          'Prothalle → spore → fougère adulte',
          'Spore → prothalle → fougère adulte',
          'Fougère → prothalle → spore',
          'Rhizome → spore → prothalle',
        ],
        bonneReponse: 1,
        explication:
          "L'ordre correct est : la fougère adulte produit des spores → les spores germent et forment des prothalles → les prothalles se reproduisent et donnent de nouvelles fougères.",
      },
    ],
  },
];

export const mockAnalyseResult: AnalyseResult = {
  matiere: 'SVT',
  type: 'Composition',
  titre: 'La reproduction des végétaux',
  dateEvaluation: '10 juin 2026',
  joursRestants: 3,
  notions: ['spores', 'prothalle', 'fougère', 'multiplication végétative', 'reproduction sexuée'],
  consignes:
    "Savoir expliquer le cycle de reproduction de la fougère. Connaître les différences entre reproduction sexuée et multiplication végétative. Être capable de légender un schéma.",
  priorite: 'haute',
  dureeConseillee: 12,
  missionsProposees: 3,
};

export const parentPrenom = 'Franck';
