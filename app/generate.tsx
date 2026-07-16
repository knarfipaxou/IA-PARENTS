import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { saveExamResult, loadExamResults, filterForLesson, type ExamResult } from '../lib/examResults';
import { buildDevoirHtml } from '../lib/devoirPrint';
import { questionMastered } from '../lib/masteryScoring';
import { CyanBtn, DarkGhostBtn } from '../components/generate/Buttons';
import { FicheView } from '../components/generate/FicheView';
import { ExercicesView } from '../components/generate/ExercicesView';
import { MiniTestView } from '../components/generate/MiniTestView';
import { PlanningView } from '../components/generate/PlanningView';
import { DevoirBlancView } from '../components/generate/DevoirBlancView';
import { useChild, type SavedLesson } from '../contexts/ChildContext';
import {
  AiError,
  generateForControl,
  generatePlanning,
  type Planning,
  type ControlKind,
  generateRevisionSheet,
  generateExercises,
  generateMiniTest,
  generateMockExam,
  type LessonAnalysis,
  type RevisionSheet,
  type Exercises,
  type MiniTest,
  type DevoirBlanc,
} from '../services/ai';

const META: Record<string, { title: string; accent: string }> = {
  fiche: { title: 'Fiche de révision', accent: DK.blue },
  exercices: { title: 'Exercices', accent: DK.amber },
  minitest: { title: 'Mini-test', accent: DK.gold },
  controle: { title: 'Devoir blanc complet', accent: DK.red },
  piege: { title: 'Test piégeux', accent: DK.amber },
  planning: { title: 'Planning J-10 → J-1', accent: DK.blue },
};

const LESSON_FIELD: Record<string, keyof SavedLesson> = {
  fiche: 'fiche',
  exercices: 'exercices',
  minitest: 'minitest',
  controle: 'controleBlanc',
};

/**
 * Écran d'orchestration : résout la source (leçon ou échéance), génère ou
 * relit le contenu IA en cache, gère les XP, puis délègue le RENDU à un
 * composant dédié par type de contenu (components/generate/*View). La
 * correction du devoir blanc (critères de réussite) vit dans
 * lib/masteryScoring.ts (testée).
 */
export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string; lessonId?: string; echeanceId?: string }>();
  const kind = (typeof params.kind === 'string' ? params.kind : 'fiche') as string;
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : undefined;
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const meta = META[kind] ?? META.fiche;
  const { child, lessons, updateLesson, updateEcheance, addXP, addDrillResult } = useChild();

  // ── mode échéance (devoir global) ──
  const echeance = echeanceId ? child?.echeances?.find((e) => e.id === echeanceId) : undefined;
  const linkedLessons = echeance ? lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id)) : [];
  const echeanceMode = !!echeanceId;
  const dateKnown = !echeance || /\d{1,2}\/\d{1,2}\/\d{4}/.test(echeance.date) || echeance.days > 0;
  const echeanceBlocked = echeanceMode && (!echeance || linkedLessons.length === 0 || (kind === 'planning' && !dateKnown));

  // ── mode leçon ──
  const savedLesson: SavedLesson | undefined = echeanceMode
    ? undefined
    : lessonId
      ? lessons.find((l) => l.id === lessonId)
      : child
        ? lessons.find((l) => l.childId === child.id)
        : undefined;
  const lesson: LessonAnalysis | undefined = savedLesson
    ? {
        matiere: savedLesson.matiere,
        titre: savedLesson.titre,
        niveau: savedLesson.niveau ?? '',
        notions: savedLesson.notions,
        resume: savedLesson.resume,
      }
    : undefined;
  const cachedRaw = echeanceMode
    ? echeance?.generated?.[kind]
    : savedLesson
      ? (savedLesson as any)[LESSON_FIELD[kind] ?? 'fiche']
      : undefined;
  // un devoir blanc d'un ancien format (sans critères de réussite) est périmé :
  // on le régénère pour obtenir la correction guidée par critères
  const cachedStale = kind === 'controle' && cachedRaw
    && !(cachedRaw.questions ?? []).some((q: any) => (q.correction_criteria ?? []).length > 0);
  const cached = cachedStale ? undefined : cachedRaw;

  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(cached ?? null);

  // tableau de bord de progression (résultats des devoirs blancs de CETTE leçon/matière)
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const reloadExamHistory = useCallback(() => {
    if (kind === 'controle' && child) {
      loadExamResults(child.id).then((all) =>
        setExamHistory(filterForLesson(all, savedLesson?.id ?? undefined, echeanceMode ? echeance?.subj : lesson?.matiere)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, child?.id, savedLesson?.id]);
  useEffect(reloadExamHistory, [reloadExamHistory]);

  const generate = useCallback(async () => {
    if (!child) return;
    if (echeanceMode ? (!echeance || linkedLessons.length === 0) : !lesson) return;
    setLoading(true);
    setError(null);
    setContent(null);
    try {
      let result: any;
      if (echeanceMode && echeance) {
        const eLite = { subj: echeance.subj, type: echeance.type, date: echeance.date, titre: echeance.titre, consigne: echeance.consigne };
        const lLite = linkedLessons.map((l) => ({ id: l.id, matiere: l.matiere, titre: l.titre, notions: l.notions, resume: l.resume }));
        if (kind === 'planning') result = await generatePlanning(eLite, lLite, child);
        else result = await generateForControl(kind as ControlKind, eLite, lLite, child);
        // persist on the échéance so the content is never lost
        updateEcheance(child.id, echeance.id, { generated: { ...(echeance.generated ?? {}), [kind]: result } });
      } else if (lesson) {
        if (kind === 'fiche') result = await generateRevisionSheet(lesson, child);
        else if (kind === 'exercices') result = await generateExercises(lesson, child);
        else if (kind === 'minitest') result = await generateMiniTest(lesson, child);
        else result = await generateMockExam(lesson, child);
        // persist INTO the lesson so the content is never lost
        if (savedLesson) updateLesson(savedLesson.id, { [LESSON_FIELD[kind] ?? 'fiche']: result } as Partial<SavedLesson>);
      }
      setContent(result);
      setLoading(false);
      if (child) {
        const xpMap: Record<string, import('../lib/gamification').XPReason> = {
          fiche: 'fiche', exercices: 'exercise',
          minitest: 'minitest', controle: 'controle', planning: 'fiche',
        };
        const reason = (xpMap[kind] ?? 'fiche') as import('../lib/gamification').XPReason;
        const amountMap: Partial<Record<import('../lib/gamification').XPReason, number>> = {
          fiche: 5, exercise: 5, minitest: 15, controle: 30,
        };
        addXP(child.id, amountMap[reason] ?? 5, reason);
      }
    } catch (e) {
      setLoading(false);
      if (e instanceof AiError && e.code === 'NO_KEY') {
        setError('Clé API manquante. Ajoutez votre clé dans Réglages.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur inattendue.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, child?.id, savedLesson?.id, echeanceId, (echeance?.lessonIds ?? []).join(',')]);

  useEffect(() => {
    // show cached content instantly; only call the AI when nothing is cached
    if (!cached) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]);

  // impression du sujet élève (PDF A4, aucune réponse ni correction)
  async function printDevoir(devoir: DevoirBlanc) {
    if (!child) return;
    try {
      const html = buildDevoirHtml(devoir, child.name, child.classe);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Devoir blanc — sujet élève' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert('Impression impossible', "Le PDF n'a pas pu être généré. Réessayez.");
    }
  }

  const screenShell = (children: React.ReactNode) => (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );

  const navRow = (subtitle?: string) => (
    <View style={s.navRow}>
      <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
        <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{meta.title}</Text>
        {!!subtitle && <Text style={s.sub} numberOfLines={2}>{subtitle}</Text>}
      </View>
      <View style={s.iaPill}>
        <Ionicons name="sparkles" size={13} color={DK.cyan} />
        <Text style={s.iaPillText}>IA</Text>
      </View>
    </View>
  );

  if (echeanceMode && echeanceBlocked) {
    return screenShell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow()}
        <View style={s.center}>
          <Image source={DK_ICONS.warning} style={{ width: 56, height: 56 }} />
          <Text style={s.centerText}>
            {kind === 'planning' && linkedLessons.length > 0
              ? "Impossible de générer un planning fiable sans une date connue. Modifiez l'échéance pour préciser la date."
              : 'Impossible de générer un planning fiable sans les leçons concernées.'}
          </Text>
          {echeance && (
            <CyanBtn
              label="Rattacher une leçon"
              icon={<Ionicons name="link-outline" size={19} color="#052A26" />}
              onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)}
              style={{ alignSelf: 'stretch' }}
            />
          )}
          <DarkGhostBtn
            label="Scanner une leçon"
            icon={<Ionicons name="scan-outline" size={18} color="#DDE4FF" />}
            onPress={() => router.push('/scan' as any)}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </View>
    );
  }

  if (!child || (!echeanceMode && !lesson)) {
    return screenShell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow()}
        <View style={s.center}>
          <Ionicons name="scan-outline" size={42} color={DK.faint} />
          <Text style={s.centerText}>Scannez une leçon avant de générer du contenu.</Text>
          <DarkGhostBtn label="Retour" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </View>
      </View>
    );
  }

  if (loading) {
    return screenShell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow()}
        <View style={s.center}>
          <View style={[s.loadingIcon, { shadowColor: meta.accent }]}>
            <Ionicons name="sparkles" size={30} color={meta.accent} />
          </View>
          <ActivityIndicator color={meta.accent} />
          <Text style={s.loadingTitle}>L'IA prépare…</Text>
          <Text style={s.centerText}>{meta.title} pour {child.name}, adapté au niveau {child.classe}.</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return screenShell(
      <View style={{ flex: 1, padding: 18 }}>
        {navRow()}
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={42} color={DK.red} />
          <Text style={s.centerText}>{error}</Text>
          <CyanBtn
            label="Réessayer"
            icon={<Ionicons name="refresh" size={19} color="#052A26" />}
            onPress={generate}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </View>
    );
  }

  // ── dispatch du rendu selon le type de contenu ──

  let body: React.ReactNode = null;

  if (kind === 'fiche' && content) {
    body = <FicheView fiche={content as RevisionSheet} />;
  }

  if ((kind === 'exercices' || kind === 'piege') && content) {
    body = <ExercicesView exercises={content as Exercises} />;
  }

  if (kind === 'minitest' && content) {
    body = (
      <MiniTestView
        mt={content as MiniTest}
        onAnswered={(right, reason) => addXP(child.id, right ? 5 : 1, reason)}
      />
    );
  }

  if (kind === 'planning' && content) {
    body = <PlanningView plan={content as Planning} />;
  }

  if (kind === 'controle' && content) {
    const devoir = content as DevoirBlanc;
    const matiere = echeanceMode ? (echeance?.subj ?? 'Devoir') : (lesson?.matiere ?? 'Devoir');
    body = (
      <DevoirBlancView
        devoir={devoir}
        examHistory={examHistory}
        onPrint={() => printDevoir(devoir)}
        onFinish={(score, checks) => {
          const now = new Date().toISOString();
          const sessionId = `controle-${Date.now()}`;
          // réinjection dans le moteur d'adaptation : un résultat par question
          (devoir.questions ?? []).forEach((qu, qi) => {
            addDrillResult({
              id: `${sessionId}-${qi}`,
              sessionId,
              exerciseId: `${sessionId}-${qu.question_id ?? `q${qi}`}`,
              childId: child.id,
              date: now.slice(0, 10),
              matiere,
              competence: qu.notion || 'général',
              reussite: questionMastered(qu, qi, checks),
            } as any);
          });
          saveExamResult({
            id: sessionId,
            childId: child.id,
            date: now,
            titre: devoir.titre,
            matiere,
            note: score.note,
            totalOk: score.totalOk,
            totalMax: score.totalMax,
            acquis: score.acquis,
            aRenforcer: score.aRenforcer,
            notionsDetail: Object.entries(score.notions).map(([notion, v]) => ({ notion, ok: v.ok, total: v.total })),
            lessonId: savedLesson?.id,
            echeanceId: echeance?.id,
          });
          reloadExamHistory();
        }}
      />
    );
  }

  return screenShell(
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {navRow(
        echeanceMode && echeance
          ? `${echeance.type} de ${echeance.subj} · ${linkedLessons.length} ${linkedLessons.length > 1 ? 'leçons' : 'leçon'} · pour ${child.name}`
          : `${lesson?.matiere} · ${lesson?.titre} · pour ${child.name}`
      )}

      {body}

      <DarkGhostBtn
        label={kind === 'controle' ? 'Refaire le devoir blanc' : 'Régénérer'}
        icon={<Ionicons name="refresh" size={19} color="#DDE4FF" />}
        onPress={generate}
        style={{ marginTop: 20 }}
      />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 },
  centerText: { fontSize: 14.5, color: DK.sub, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
  loadingIcon: {
    width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  loadingTitle: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 18 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  sub: { fontSize: 12, color: DK.sub, marginTop: 2, fontWeight: '600' },
  iaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.09)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  iaPillText: { color: DK.cyan, fontSize: 12.5, fontWeight: '800' },
});
