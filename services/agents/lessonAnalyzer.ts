import { askClaude, extractJSON, type EcheanceLite, type LessonLite } from '../ai';
import type { Child } from '../../data/mock';
import { validateLessonAnalysis, type LessonAnalysis2 } from './types';

export const LESSON_ANALYZER_PROMPT_VERSION = 'lesson-analyzer/v1';

const SYSTEM = `Tu es lesson-analyzer, un agent d'analyse pédagogique. Tu analyses INTÉGRALEMENT une leçon avant toute génération.
Tu détectes : définitions, vocabulaire, dates, périodes, personnages, lieux, chiffres importants, formules, règles, propriétés, méthodes, événements, citations ou devises, éléments signalés « à retenir », contenus des tableaux/cartes/schémas/légendes, objectifs annoncés, conclusion.
Tu détectes aussi les problèmes : pages manquantes, phrases interrompues, définitions coupées, contradictions, contenu illisible.
Tu ne crées PAS de questions, tu ne produis PAS de devoir, tu n'inventes RIEN, tu ne complètes JAMAIS la leçon avec des connaissances extérieures.
Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.`;

/**
 * Agent 1 — lesson-analyzer : construit la carte structurée des connaissances
 * à partir des leçons rattachées à l'échéance. Sortie validée par schéma.
 */
export async function runLessonAnalyzer(
  echeance: EcheanceLite,
  lessons: LessonLite[],
  child: Child,
): Promise<LessonAnalysis2> {
  const lessonsBlock = lessons
    .map((l, i) => {
      const head = `Leçon ${i + 1} — ${l.matiere} : ${l.titre}\nNotions relevées: ${l.notions.join(', ')}`;
      // transcription complète si disponible (leçons scannées récemment), sinon résumé
      return l.texte
        ? `${head}\nCONTENU COMPLET :\n${l.texte.slice(0, 12000)}`
        : `${head}\nRésumé (transcription complète indisponible — signale-le dans detectedUncertainties) : ${l.resume}`;
    })
    .join('\n\n');
  const text = await askClaude({
    system: SYSTEM,
    user: `Élève : ${child.name}, classe ${child.classe}, ${child.age} ans.
Il prépare : ${echeance.type} de ${echeance.subj} (${echeance.date})${echeance.consigne ? ` — consigne du professeur : ${echeance.consigne}` : ''}.
Voici la ou les leçons à analyser INTÉGRALEMENT :
${lessonsBlock}

Découpe TOUT le contenu en connaissances ATOMIQUES (une idée testable par entrée). Ne regroupe pas plusieurs faits distincts dans une même entrée. Chaque date, chaque définition, chaque personnage, chaque chiffre important est une entrée séparée.
{"status": "complete|probably_complete|incomplete|illegible|contradictory", "statusDetail": "détail si problème (page manquante, phrase coupée, contradiction), sinon omis", "knowledge": [{"knowledgeId": "DEF-001", "type": "definition|vocabulaire|date|periode|personnage|lieu|chiffre|formule|regle|propriete|methode|evenement|citation|autre", "label": "énoncé court de la connaissance", "content": "contenu exact tiré de la leçon", "importance": "essential|important|secondary", "cognitiveLevel": "remember|understand|apply|transfer", "sourceExcerpt": "extrait court de la leçon d'où vient cette connaissance", "sourceSection": "section/notion d'origine"}], "detectedUncertainties": ["incertitude à signaler au parent"]}
RÈGLES :
- Chaque knowledgeId est unique (préfixe par type : DEF-, VOC-, FCT-, PER-, LIEU-, CHI-, FOR-, REG-, MET-, EVT-…).
- "importance": essential = explicitement central ou indispensable ; important = utile à la note ; secondary = détail.
- "cognitiveLevel": remember = à restituer par cœur ; understand = à expliquer ; apply = à mettre en œuvre dans un exercice ; transfer = à mobiliser dans un problème nouveau.
- Si un champ n'est pas lisible ou absent : ne l'invente pas, signale-le dans detectedUncertainties.
- Si plus de 40 % du contenu est illisible ou manquant : status incomplete ou illegible.`,
    maxTokens: 8192,
  });
  return validateLessonAnalysis(extractJSON(text));
}
