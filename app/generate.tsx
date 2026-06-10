import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';
import { useChild, type GeneratedKind } from '../contexts/ChildContext';
import {
  AiError,
  generateRevisionSheet,
  generateFlashcards,
  generateExercises,
  generateMiniTest,
  generateMockExam,
  type LessonAnalysis,
  type RevisionSheet,
  type Flashcards,
  type Exercises,
  type MiniTest,
  type MockExam,
  type QcmExercise,
} from '../services/ai';

const META: Record<string, { title: string; accent: AccentKey }> = {
  fiche: { title: 'Fiche de révision', accent: 'green' },
  flashcards: { title: 'Flashcards', accent: 'violet' },
  exercices: { title: 'Exercices', accent: 'amber' },
  minitest: { title: 'Mini-test', accent: 'blue' },
  controle: { title: 'Contrôle blanc', accent: 'coral' },
};

// ─── QCM block (pattern from mission-exo) ───────────────────────────────────

function QcmBlock({ exo, index, onAnswered }: { exo: QcmExercise; index: number; onAnswered?: (right: boolean) => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const checked = pick !== null;
  const isRight = pick === exo.bonneReponse;

  return (
    <Card pad={16} style={{ marginBottom: 13 }}>
      <View style={q.chipRow}>
        <View style={q.questionChip}>
          <Text style={q.questionChipText}>Question {index + 1} · QCM</Text>
        </View>
      </View>
      <Text style={q.title}>{exo.question}</Text>
      <View style={q.optsList}>
        {exo.options.map((opt, oi) => {
          const sel = pick === oi;
          const isCorrect = checked && oi === exo.bonneReponse;
          const isWrong = checked && sel && oi !== exo.bonneReponse;
          const bgColor = isCorrect ? T.primarySoft : isWrong ? T.coral.soft : T.surface;
          const bdColor = isCorrect ? T.primary : isWrong ? T.coral.solid : T.line;
          return (
            <TouchableOpacity
              key={oi}
              disabled={checked}
              onPress={() => { setPick(oi); onAnswered?.(oi === exo.bonneReponse); }}
              style={[q.optRow, { backgroundColor: bgColor, borderColor: bdColor }]}
              activeOpacity={0.88}
            >
              <Text style={q.optLabel}>{opt}</Text>
              {isCorrect && <Ionicons name="checkmark-circle" size={22} color={T.primaryDeep} />}
              {isWrong && <Ionicons name="close-circle" size={22} color={T.coral.fg} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {checked && (
        <View style={[q.feedback, { backgroundColor: isRight ? T.primarySoft : T.amber.soft }]}>
          <Ionicons name={isRight ? 'checkmark-circle' : 'bulb-outline'} size={20} color={isRight ? T.primaryDeep : T.amber.fg} style={{ flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <Text style={[q.feedbackTitle, { color: isRight ? T.primaryDeep : T.amber.fg }]}>
              {isRight ? "Bravo, c'est exact !" : 'Presque !'}
            </Text>
            <Text style={q.feedbackSub}>{exo.explication}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const q = StyleSheet.create({
  chipRow: { marginBottom: 8 },
  questionChip: { alignSelf: 'flex-start', backgroundColor: T.amber.soft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  questionChipText: { fontSize: 12.5, fontWeight: '700', color: T.amber.fg },
  title: { fontSize: 17, fontWeight: '800', color: T.ink, letterSpacing: -0.3, lineHeight: 24 },
  optsList: { gap: 9, marginTop: 13 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 15, padding: 13, borderWidth: 2 },
  optLabel: { flex: 1, fontSize: 14.5, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 15, padding: 13, marginTop: 13 },
  feedbackTitle: { fontWeight: '800', fontSize: 14.5 },
  feedbackSub: { fontSize: 13, color: T.ink, fontWeight: '500', marginTop: 3, lineHeight: 19 },
});

// ─── Main screen ────────────────────────────────────────────────────────────

export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = (typeof params.kind === 'string' ? params.kind : 'fiche') as GeneratedKind;
  const meta = META[kind] ?? META.fiche;
  const { child, getGenerated, saveGenerated } = useChild();
  const lesson: LessonAnalysis | undefined = child ? getGenerated(child.id, 'lesson') : undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);

  // flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // mini-test scoring
  const [answers, setAnswers] = useState<boolean[]>([]);
  // controle corrections
  const [shownCorrections, setShownCorrections] = useState<Set<number>>(new Set());

  const generate = useCallback(async () => {
    if (!child || !lesson) return;
    setLoading(true);
    setError(null);
    setContent(null);
    setCardIndex(0);
    setFlipped(false);
    setAnswers([]);
    setShownCorrections(new Set());
    try {
      let result: any;
      if (kind === 'fiche') result = await generateRevisionSheet(lesson, child);
      else if (kind === 'flashcards') result = await generateFlashcards(lesson, child);
      else if (kind === 'exercices') result = await generateExercises(lesson, child);
      else if (kind === 'minitest') result = await generateMiniTest(lesson, child);
      else result = await generateMockExam(lesson, child);
      saveGenerated(child.id, kind, result);
      setContent(result);
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
  }, [kind, child?.id]);

  useEffect(() => { generate(); }, [generate]);

  if (!child || !lesson) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Ionicons name="scan-outline" size={42} color={T.faint} />
          <Text style={s.centerText}>Scannez une leçon avant de générer du contenu.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <View style={[s.loadingIcon, { backgroundColor: T[meta.accent].soft }]}>
            <Ionicons name="sparkles" size={30} color={T[meta.accent].fg} />
          </View>
          <ActivityIndicator color={T[meta.accent].solid} />
          <Text style={s.loadingTitle}>L'IA prépare…</Text>
          <Text style={s.centerText}>{meta.title} pour {child.name}, adapté au niveau {child.classe}.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={42} color={T.coral.fg} />
          <Text style={s.centerText}>{error}</Text>
          <Btn onPress={generate} icon={<Ionicons name="refresh" size={19} color="#fff" />}>Réessayer</Btn>
        </View>
      </SafeAreaView>
    );
  }

  // ── content renderers ──

  let body: React.ReactNode = null;

  if (kind === 'fiche' && content) {
    const fiche = content as RevisionSheet;
    body = (
      <>
        <Text style={s.contentTitle}>{fiche.titre}</Text>
        {(fiche.sections ?? []).map((sec, i) => (
          <Card key={i} pad={16} style={{ marginTop: 13 }}>
            <Text style={s.sectionTitle}>{sec.titre}</Text>
            <Text style={s.sectionText}>{sec.contenu}</Text>
            {sec.points_cles?.length > 0 && (
              <View style={s.chipsWrap}>
                {sec.points_cles.map((p, pi) => (
                  <Chip key={pi} accentKey={meta.accent}>{p}</Chip>
                ))}
              </View>
            )}
          </Card>
        ))}
      </>
    );
  }

  if (kind === 'flashcards' && content) {
    const fc = content as Flashcards;
    const cards = fc.cards ?? [];
    const card = cards[cardIndex];
    body = card ? (
      <>
        <Text style={s.counter}>{cardIndex + 1}/{cards.length}</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setFlipped((f) => !f)} style={[s.flashcard, flipped && s.flashcardBack]}>
          <Text style={s.flashLabel}>{flipped ? 'RÉPONSE' : 'QUESTION'}</Text>
          <Text style={[s.flashText, flipped && { color: '#fff' }]}>{flipped ? card.verso : card.recto}</Text>
          <View style={s.flipHint}>
            <Ionicons name="sync-outline" size={15} color={flipped ? 'rgba(255,255,255,0.7)' : T.faint} />
            <Text style={[s.flipHintText, flipped && { color: 'rgba(255,255,255,0.7)' }]}>Touchez pour retourner</Text>
          </View>
        </TouchableOpacity>
        <View style={s.navRow}>
          <GhostBtn
            onPress={() => { if (cardIndex > 0) { setCardIndex(cardIndex - 1); setFlipped(false); } }}
            icon={<Ionicons name="arrow-back" size={18} color={T.ink} />}
            style={{ flex: 1 }}
          >
            Précédente
          </GhostBtn>
          <Btn
            onPress={() => { if (cardIndex < cards.length - 1) { setCardIndex(cardIndex + 1); setFlipped(false); } }}
            disabled={cardIndex >= cards.length - 1}
            size="md"
            icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            iconRight
            style={{ flex: 1 }}
          >
            Suivante
          </Btn>
        </View>
      </>
    ) : null;
  }

  if (kind === 'exercices' && content) {
    const ex = content as Exercises;
    body = (
      <>
        {(ex.exercices ?? []).map((exo, i) => (
          <QcmBlock key={i} exo={exo} index={i} />
        ))}
      </>
    );
  }

  if (kind === 'minitest' && content) {
    const mt = content as MiniTest;
    const total = mt.exercices?.length ?? 0;
    const done = answers.length >= total && total > 0;
    const score = answers.filter(Boolean).length;
    body = (
      <>
        {(mt.exercices ?? []).map((exo, i) => (
          <QcmBlock key={i} exo={exo} index={i} onAnswered={(right) => setAnswers((prev) => [...prev, right])} />
        ))}
        {done && (
          <Card pad={18} style={{ marginTop: 4 }}>
            <View style={s.scoreRow}>
              <View style={[s.scoreBadge, { backgroundColor: score === total ? T.green.soft : T.amber.soft }]}>
                <Text style={[s.scoreText, { color: score === total ? T.green.fg : T.amber.fg }]}>{score}/{total}</Text>
              </View>
              <Text style={s.scoreLabel}>
                {score === total ? 'Excellent travail !' : score >= total / 2 ? 'Bien joué, continuez !' : 'Courage, on révise et on recommence !'}
              </Text>
            </View>
            {!!mt.conseil && (
              <View style={s.conseilBox}>
                <Ionicons name="bulb-outline" size={18} color={T.primaryDeep} />
                <Text style={s.conseilText}>{mt.conseil}</Text>
              </View>
            )}
          </Card>
        )}
      </>
    );
  }

  if (kind === 'controle' && content) {
    const exam = content as MockExam;
    body = (
      <>
        <Text style={s.contentTitle}>{exam.titre}</Text>
        <View style={s.examMeta}>
          <Chip accentKey="coral">{`Durée : ${exam.duree_min} min`}</Chip>
          <Chip accentKey="blue">{`${exam.questions?.length ?? 0} questions`}</Chip>
        </View>
        {(exam.questions ?? []).map((qu, i) => {
          const shown = shownCorrections.has(i);
          return (
            <Card key={i} pad={16} style={{ marginTop: 13 }}>
              <View style={s.examQHeader}>
                <Text style={s.examQNum}>Question {i + 1}</Text>
                <View style={s.pointsBadge}>
                  <Text style={s.pointsText}>{qu.points} pts</Text>
                </View>
              </View>
              <Text style={s.examEnonce}>{qu.enonce}</Text>
              <TouchableOpacity
                onPress={() => setShownCorrections((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i); else next.add(i);
                  return next;
                })}
                style={s.corrToggle}
              >
                <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={17} color={T.primary} />
                <Text style={s.corrToggleText}>{shown ? 'Masquer la correction' : 'Voir la correction'}</Text>
              </TouchableOpacity>
              {shown && (
                <View style={s.corrBox}>
                  <Text style={s.corrText}>{qu.correction}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T[meta.accent].solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>IA</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>{meta.title}</Text>
          <Text style={s.sub}>{lesson.matiere} · {lesson.titre} · pour {child.name}</Text>
        </View>

        {body}

        <View style={{ marginTop: 20 }}>
          <GhostBtn full onPress={generate} icon={<Ionicons name="refresh" size={19} color={T.ink} />}>
            Régénérer
          </GhostBtn>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28 },
  centerText: { fontSize: 14.5, color: T.sub, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
  loadingIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 19, fontWeight: '800', color: T.ink, letterSpacing: -0.4 },
  header: { marginTop: 18, marginBottom: 14 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 14, color: T.sub, marginTop: 6, fontWeight: '500' },
  contentTitle: { fontSize: 19, fontWeight: '800', color: T.ink, letterSpacing: -0.4, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: T.ink, letterSpacing: -0.3, marginBottom: 8 },
  sectionText: { fontSize: 14.5, color: T.sub, lineHeight: 22, fontWeight: '500' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  counter: { alignSelf: 'center', fontSize: 14, fontWeight: '800', color: T.sub, marginBottom: 12 },
  flashcard: {
    minHeight: 230, borderRadius: 26, padding: 24,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    alignItems: 'center', justifyContent: 'center', gap: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3,
  },
  flashcardBack: { backgroundColor: T.violet.solid, borderColor: T.violet.solid },
  flashLabel: { fontSize: 12, fontWeight: '800', color: T.faint, letterSpacing: 1 },
  flashText: { fontSize: 19, fontWeight: '800', color: T.ink, textAlign: 'center', letterSpacing: -0.3, lineHeight: 27 },
  flipHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  flipHintText: { fontSize: 12.5, color: T.faint, fontWeight: '600' },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  scoreBadge: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  scoreText: { fontSize: 21, fontWeight: '800' },
  scoreLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  conseilBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: T.primarySoft, borderRadius: 14, padding: 13, marginTop: 14 },
  conseilText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: T.primaryDeep, lineHeight: 20 },
  examMeta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  examQHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  examQNum: { fontSize: 13, fontWeight: '800', color: T.sub, letterSpacing: 0.2 },
  pointsBadge: { backgroundColor: T.coral.soft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pointsText: { fontSize: 12.5, fontWeight: '800', color: T.coral.fg },
  examEnonce: { fontSize: 15.5, fontWeight: '700', color: T.ink, lineHeight: 23, letterSpacing: -0.2 },
  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  corrToggleText: { color: T.primary, fontWeight: '800', fontSize: 13.5 },
  corrBox: { backgroundColor: T.surfaceAlt, borderRadius: 14, padding: 13, marginTop: 10 },
  corrText: { fontSize: 13.5, color: T.ink, fontWeight: '500', lineHeight: 21 },
});
