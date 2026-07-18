import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { playSfx } from '../lib/sfx';
import { progressColor } from '../lib/progressColor';
import { computeCriteriaScore, questionMastered } from '../lib/masteryScoring';
import {
  MISSION_ORDER, MISSION_DEFS, loadMasteryPath, saveMasteryPath,
  recordMissionResult, recordKnowledgeMastery, missionStatus, isUnlocked,
  type MasteryPath, type MissionId,
} from '../lib/masteryPath';
import { CriteriaCorrection } from '../components/CriteriaCorrection';
import { AiError } from '../services/ai';
import { runLessonAnalyzer, LESSON_ANALYZER_PROMPT_VERSION } from '../services/agents/lessonAnalyzer';
import { runMissionGenerator, runMissionPatch, MISSION_GENERATOR_PROMPT_VERSION } from '../services/agents/missionGenerator';
import { runQualityAuditor } from '../services/agents/qualityAuditor';
import { buildMission, STATE_LABELS, type GenerationState } from '../services/agents/orchestrator';
import { MISSION_ID_TO_TYPE, type MissionQuestion } from '../services/agents/types';
import type { CoverageReport } from '../lib/coverage';
import { appendGenerationLog } from '../lib/generationLog';

interface MissionContent {
  mission_id: MissionId;
  titre: string;
  questions: MissionQuestion[];
  coverage?: CoverageReport;
  lessonStatus?: string;
  auditWarnings?: string[];
}

/**
 * Écran d'une mission du parcours de maîtrise : contenu généré à la demande
 * (la carte des connaissances est générée une seule fois puis réutilisée),
 * l'enfant répond par lui-même, le parent corrige par critères.
 */
export default function ParcoursMissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ echeanceId?: string; mission?: string }>();
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const missionId = (typeof params.mission === 'string' ? params.mission : 'memoire') as MissionId;
  const def = MISSION_DEFS[missionId] ?? MISSION_DEFS.memoire;
  const { child, lessons, addXP, addDrillResult } = useChild();

  const echeance = child?.echeances?.find((e) => e.id === echeanceId);
  const linkedLessons = echeance ? lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id)) : [];
  const pathKey = child && echeance ? `${child.id}:${echeance.id}` : null;

  const [path, setPath] = useState<MasteryPath>({ missions: {} });
  const [content, setContent] = useState<MissionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [stateLabel, setStateLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ReturnType<typeof computeCriteriaScore> | null>(null);

  const load = useCallback(async (force = false) => {
    if (!child || !echeance || !pathKey || linkedLessons.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setChecks({});
    const startedAt = Date.now();
    try {
      let p = await loadMasteryPath(pathKey);
      // une mission de l'ancien format (sans knowledgeIds, générée sans audit)
      // est périmée : on la régénère via la chaîne d'agents
      const cachedRaw = !force ? p.content?.[missionId] : undefined;
      const cachedStale = cachedRaw
        && !(cachedRaw.questions ?? []).every((q: any) => (q.knowledgeIds ?? []).length > 0);
      const cached = cachedStale ? undefined : cachedRaw;
      if (cached && (cached.questions ?? []).length > 0) {
        setPath(p);
        setContent(cached);
        setLoading(false);
        return;
      }
      const eLite = { subj: echeance.subj, type: echeance.type, date: echeance.date, titre: echeance.titre, consigne: echeance.consigne };
      const lLite = linkedLessons.map((l) => ({ id: l.id, matiere: l.matiere, titre: l.titre, notions: l.notions, resume: l.resume, texte: l.texte, programme: l.programme }));

      // 1. analyse de la leçon (lesson-analyzer) : une seule fois, puis réutilisée
      // (« Régénérer » force aussi une nouvelle analyse, utile après un nouveau scan)
      let analysis = force ? undefined : p.analysis;
      if (!analysis || (analysis.knowledge ?? []).length === 0) {
        setStateLabel(STATE_LABELS.analyzing_lesson);
        analysis = await runLessonAnalyzer(eLite, lLite, child) as any;
        p = { ...p, analysis };
        await saveMasteryPath(pathKey, p);
        appendGenerationLog({
          id: `km-${Date.now()}`, date: new Date().toISOString(), type: 'knowledge-map',
          childId: child.id, echeanceId: echeance.id, lessonIds: echeance.lessonIds,
          agent: 'lesson-analyzer', promptVersion: LESSON_ANALYZER_PROMPT_VERSION,
          durationMs: Date.now() - startedAt,
        });
      }

      // 2-3. génération + audit bloquant + réparation ciblée (orchestrateur en code)
      const missionType = MISSION_ID_TO_TYPE[missionId];
      const build = await buildMission(
        missionType,
        analysis as any,
        {
          generate: (t, scoped) => runMissionGenerator(t, scoped, eLite, child),
          patch: (t, missing, existing) => runMissionPatch(t, missing, existing, eLite, child),
          audit: (t, knowledge, questions) => runQualityAuditor(t, knowledge, questions),
        },
        (st: GenerationState) => setStateLabel(STATE_LABELS[st]),
      );

      appendGenerationLog({
        id: `mission-${missionId}-${Date.now()}`, date: new Date().toISOString(),
        type: `mission-${missionId}`, childId: child.id, echeanceId: echeance.id,
        lessonIds: echeance.lessonIds, agent: 'mission-generator',
        promptVersion: MISSION_GENERATOR_PROMPT_VERSION, attempts: build.attempts,
        essentialCoverage: build.audit?.essentialCoverage,
        importantCoverage: build.audit?.importantCoverage,
        missingKnowledgeIds: build.audit?.missingKnowledgeIds,
        auditStatus: build.audit?.status, durationMs: Date.now() - startedAt,
        error: build.error,
      });

      if (!build.ok) {
        // règle bloquante : rien n'est publié sans validation de l'audit
        setLoading(false);
        setError(`La mission n'a pas passé le contrôle qualité et n'a pas été publiée.\n${build.error ?? ''}\nVous pouvez relancer la génération.`);
        return;
      }

      const mission: MissionContent = {
        mission_id: missionId,
        titre: def.title,
        questions: build.questions,
        coverage: build.coverage,
        lessonStatus: analysis!.status,
        auditWarnings: build.audit?.warnings,
      };
      p = { ...p, content: { ...(p.content ?? {}), [missionId]: mission } };
      await saveMasteryPath(pathKey, p);
      setPath(p);
      setContent(mission);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      if (e instanceof AiError && e.code === 'NO_KEY') {
        setError('Clé API manquante. Ajoutez votre clé dans Réglages.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur inattendue.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey, missionId, child?.id, (echeance?.lessonIds ?? []).join(',')]);

  useEffect(() => { load(); }, [load]);

  async function finish() {
    if (!child || !echeance || !content || !pathKey) return;
    const score = computeCriteriaScore(content.questions ?? [], checks);
    const now = new Date().toISOString();
    // enregistrer la tentative + la maîtrise constatée par connaissance
    const knowledgeResults: Record<string, boolean> = {};
    (content.questions ?? []).forEach((qu, qi) => {
      const ok = questionMastered(qu, qi, checks);
      (qu.knowledgeIds ?? []).forEach((id) => {
        // une connaissance ratée dans une question l'emporte sur une réussite ailleurs
        knowledgeResults[id] = knowledgeResults[id] === false ? false : ok;
      });
    });
    const nextPath = recordKnowledgeMastery(
      recordMissionResult(path, missionId, score.pct, now),
      knowledgeResults,
    );
    setPath(nextPath);
    await saveMasteryPath(pathKey, nextPath);
    // réinjection adaptation : un résultat par question
    const sessionId = `mission-${missionId}-${Date.now()}`;
    (content.questions ?? []).forEach((qu, qi) => {
      addDrillResult({
        id: `${sessionId}-${qi}`,
        sessionId,
        exerciseId: `${sessionId}-${qu.question_id ?? `q${qi}`}`,
        childId: child.id,
        date: now.slice(0, 10),
        matiere: echeance.subj,
        competence: qu.notion || 'général',
        reussite: questionMastered(qu, qi, checks),
      } as any);
    });
    // XP pédagogique : récompense les réponses justes, pas la participation
    addXP(child.id, Math.max(1, Math.round((score.totalOk / Math.max(1, score.totalMax)) * 15)), 'minitest');
    playSfx(score.pct >= def.masteryPct ? 'success' : 'correct');
    setResult(score);
  }

  const shell = (children: React.ReactNode) => (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );

  const navRow = (
    <View style={s.navRow}>
      <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
        <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{def.title}</Text>
        {!!echeance && <Text style={s.sub}>{echeance.type} de {echeance.subj} · pour {child?.name}</Text>}
      </View>
      <View style={[s.missionIcon, { backgroundColor: `${def.color}22` }]}>
        <Ionicons name={def.icon as any} size={20} color={def.color} />
      </View>
    </View>
  );

  if (!child || !echeance || linkedLessons.length === 0) {
    return shell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow}
        <View style={s.center}>
          <Ionicons name="link-outline" size={42} color={DK.faint} />
          <Text style={s.centerText}>Rattachez au moins une leçon à l'échéance pour lancer une mission.</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return shell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow}
        <View style={s.center}>
          <ActivityIndicator color={def.color} />
          <Text style={s.loadingTitle}>{stateLabel || 'L\'IA prépare la mission…'}</Text>
          <Text style={s.centerText}>
            Analyse de la leçon → création des questions → vérification de la
            couverture → validation. Rien n'est publié sans validation.
          </Text>
        </View>
      </View>
    );
  }

  if (error || !content) {
    return shell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow}
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={42} color={DK.red} />
          <Text style={s.centerText}>{error ?? 'Contenu indisponible.'}</Text>
          <TouchableOpacity onPress={() => load(true)} style={s.retryBtn} activeOpacity={0.85}>
            <Text style={s.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const score = computeCriteriaScore(content.questions ?? [], checks);

  // écran de fin de mission
  if (result) {
    const mastered = result.pct >= def.masteryPct;
    const idx = MISSION_ORDER.indexOf(missionId);
    const nextId = idx >= 0 && idx < MISSION_ORDER.length - 1 ? MISSION_ORDER[idx + 1] : null;
    const nextUnlocked = nextId ? isUnlocked(path, nextId) : false;
    return shell(
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {navRow}
        <View style={s.resultCard}>
          <Text style={[s.resultPct, { color: progressColor(result.pct) }]}>{result.pct} %</Text>
          <Text style={s.resultLabel}>{mastered ? 'Mission maîtrisée ! 🎉' : result.pct >= 50 ? 'En progression' : 'À reprendre'}</Text>
          <Text style={s.resultNote}>{result.totalOk}/{result.totalMax} points · statut : {missionStatus(path, missionId) === 'maitrisee' ? 'Maîtrisée' : missionStatus(path, missionId) === 'a_reprendre' ? 'À reprendre' : 'En progression'}</Text>
        </View>
        <View style={s.synthCard}>
          <Text style={s.synthLabel}>✅ COMPÉTENCES MAÎTRISÉES</Text>
          <Text style={s.synthText}>{result.acquis.length > 0 ? result.acquis.join(' · ') : '—'}</Text>
          <Text style={[s.synthLabel, { color: DK.gold, marginTop: 12 }]}>🔶 ENCORE FRAGILES</Text>
          <Text style={s.synthText}>{result.aRenforcer.length > 0 ? result.aRenforcer.join(' · ') : 'Rien à signaler !'}</Text>
        </View>
        {nextId && (
          <View style={[s.synthCard, nextUnlocked && { borderColor: 'rgba(52,214,150,0.5)' }]}>
            <Text style={[s.synthLabel, { color: nextUnlocked ? DK.green : DK.faint }]}>
              {nextUnlocked ? '🔓 PROCHAINE MISSION DÉBLOQUÉE' : '🔒 PROCHAINE MISSION'}
            </Text>
            <Text style={s.synthText}>
              {MISSION_DEFS[nextId].title}
              {nextUnlocked ? ' est maintenant accessible.' : ` — se débloque à ${def.masteryPct} % sur ${def.title}.`}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.88} style={{ marginTop: 16 }}>
          <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishBtn}>
            <Text style={s.finishBtnText}>Retour au parcours</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => load(true)} style={s.regenRow} activeOpacity={0.8}>
          <Ionicons name="refresh" size={15} color={DK.sub} />
          <Text style={s.regenText}>Refaire avec de nouvelles questions</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  return shell(
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {navRow}
      <Text style={s.hint}>
        {def.desc} L'enfant répond par lui-même (à l'oral ou sur papier), puis le
        parent corrige en cochant les critères de réussite. ★ = critère indispensable.
      </Text>

      {/* résumé de couverture (parent) */}
      {content.coverage && (
        <View style={[s.synthCard, { marginTop: 12 }]}>
          <Text style={s.synthLabel}>COUVERTURE DE LA LEÇON</Text>
          <Text style={s.synthText}>
            {content.coverage.essentialCovered}/{content.coverage.essentialTotal} connaissances essentielles évaluées ({content.coverage.essentialPct} %)
            {content.coverage.importantTotal > 0 ? `\n${content.coverage.importantCovered}/${content.coverage.importantTotal} connaissances importantes évaluées (${content.coverage.importantPct} %)` : ''}
            {'\n'}Durée estimée : {content.coverage.estimatedMinutes} min · {content.questions.length} questions
          </Text>
          {content.lessonStatus && content.lessonStatus !== 'complete' && content.lessonStatus !== 'probably_complete' && (
            <Text style={[s.synthText, { color: DK.gold, marginTop: 8 }]}>
              ⚠️ Leçon détectée comme {content.lessonStatus === 'incomplete' ? 'incomplète' : content.lessonStatus === 'illegible' ? 'partiellement illisible' : 'contradictoire'} :
              la couverture ne porte que sur le contenu fourni.
            </Text>
          )}
        </View>
      )}

      <CriteriaCorrection
        questions={content.questions ?? []}
        partHeaders={(() => {
          const headers: Record<number, string> = {};
          let last: string | undefined;
          (content.questions ?? []).forEach((q, i) => {
            if (q.part && q.part !== last) {
              headers[i] = `${def.title} — Partie ${q.part}`;
              last = q.part;
            }
          });
          return headers;
        })()}
        checks={checks}
        onToggle={(key, on) => setChecks((prev) => ({ ...prev, [key]: on }))}
        comments={comments}
        onComment={(qi, t) => setComments((prev) => ({ ...prev, [qi]: t }))}
      />

      <View style={s.totalCard}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={s.totalLabel}>SCORE</Text>
          <Text style={s.totalNote}>{score.totalOk}/{score.totalMax}  ·  <Text style={{ color: progressColor(score.pct) }}>{score.pct} %</Text></Text>
        </View>
        <TouchableOpacity onPress={finish} activeOpacity={0.88} style={{ marginTop: 12 }}>
          <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishBtn}>
            <Ionicons name="checkmark-done" size={18} color="#052620" />
            <Text style={s.finishBtnText}>Terminer la mission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => load(true)} style={s.regenRow} activeOpacity={0.8}>
        <Ionicons name="refresh" size={15} color={DK.sub} />
        <Text style={s.regenText}>Régénérer la mission</Text>
      </TouchableOpacity>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 18, paddingBottom: 36 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 14 },
  backCircle: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 2 },
  missionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 },
  centerText: { fontSize: 14.5, color: DK.sub, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
  loadingTitle: { fontSize: 18, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  retryBtn: {
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.5)', borderRadius: 999,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  retryBtnText: { color: DK.cyan, fontSize: 14, fontWeight: '800' },
  hint: { fontSize: 12.5, color: DK.sub, fontWeight: '600', lineHeight: 18 },
  totalCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 22, padding: 16, marginTop: 16,
  },
  totalLabel: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1.5 },
  totalNote: { fontSize: 22, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 14,
  },
  finishBtnText: { color: '#052620', fontSize: 15, fontWeight: '800' },
  regenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 14 },
  regenText: { fontSize: 12.5, fontWeight: '700', color: DK.sub },
  resultCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 26, padding: 22, alignItems: 'center',
  },
  resultPct: { fontSize: 62, fontWeight: '900', letterSpacing: -2 },
  resultLabel: { color: DK.ink, fontSize: 19, fontWeight: '800', marginTop: 4 },
  resultNote: { color: DK.sub, fontSize: 13, fontWeight: '600', marginTop: 6 },
  synthCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 22, padding: 16, marginTop: 13,
  },
  synthLabel: { fontSize: 11.5, fontWeight: '800', color: DK.green, letterSpacing: 0.8 },
  synthText: { fontSize: 13.5, color: 'rgba(230,236,255,0.9)', fontWeight: '600', lineHeight: 20, marginTop: 4 },
});
