import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { playSfx } from '../lib/sfx';
import { saveExamResult } from '../lib/examResults';
import { useChild, type GeneratedKind, type SavedLesson } from '../contexts/ChildContext';
import {
  AiError,
  generateForControl,
  generatePlanning,
  type Planning,
  type ControlKind,
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

const META: Record<string, { title: string; accent: string }> = {
  fiche: { title: 'Fiche de révision', accent: DK.blue },
  flashcards: { title: 'Flashcards', accent: DK.violet },
  exercices: { title: 'Exercices', accent: DK.amber },
  minitest: { title: 'Mini-test', accent: DK.gold },
  controle: { title: 'Contrôle blanc', accent: DK.red },
  piege: { title: 'Test piégeux', accent: DK.amber },
  planning: { title: 'Planning J-10 → J-1', accent: DK.blue },
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ─── Boutons sombres réutilisés localement ───────────────────────────────────

function CyanBtn({ label, icon, onPress, style }: { label: string; icon?: React.ReactNode; onPress: () => void; style?: any }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={style}>
      <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cyanBtn}>
        {icon}
        <Text style={s.cyanBtnText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function DarkGhostBtn({ label, icon, onPress, style }: { label: string; icon?: React.ReactNode; onPress: () => void; style?: any }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[s.ghostBtn, style]}>
      {icon}
      <Text style={s.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Bloc QCM (feedback vert / rouge néon — wireframe 3b) ────────────────────

function QcmBlock({ exo, index, onAnswered }: { exo: QcmExercise; index: number; onAnswered?: (right: boolean) => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const checked = pick !== null;
  const isRight = pick === exo.bonneReponse;

  return (
    <View style={q.card}>
      <LinearGradient
        colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={q.questionCard}
      >
        <View style={q.questionChip}>
          <Text style={q.questionChipText}>Question {index + 1} · QCM</Text>
        </View>
        <Text style={q.title}>{exo.question}</Text>
      </LinearGradient>
      <View style={q.optsList}>
        {exo.options.map((opt, oi) => {
          const sel = pick === oi;
          const isCorrect = checked && oi === exo.bonneReponse;
          const isWrong = checked && sel && oi !== exo.bonneReponse;
          return (
            <TouchableOpacity
              key={oi}
              disabled={checked}
              onPress={() => { setPick(oi); playSfx(oi === exo.bonneReponse ? 'correct' : 'wrong'); onAnswered?.(oi === exo.bonneReponse); }}
              style={[q.optRow, isCorrect && q.optRowRight, isWrong && q.optRowWrong]}
              activeOpacity={0.88}
            >
              {isCorrect ? (
                <View style={[q.optBadge, { backgroundColor: DK.green, borderWidth: 0 }]}>
                  <Ionicons name="checkmark" size={15} color="#062A14" />
                </View>
              ) : isWrong ? (
                <View style={[q.optBadge, { backgroundColor: DK.red, borderWidth: 0 }]}>
                  <Ionicons name="close" size={15} color="#fff" />
                </View>
              ) : (
                <View style={q.optBadge}>
                  <Text style={q.optBadgeText}>{LETTERS[oi] ?? '?'}</Text>
                </View>
              )}
              <Text style={[q.optLabel, isCorrect && { color: '#9FF0BE', fontWeight: '800' }, isWrong && { color: '#FFB3A8', fontWeight: '800' }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {checked && (
        <View style={[q.feedback, isRight ? q.feedbackRight : q.feedbackWrong]}>
          <Ionicons
            name={isRight ? 'checkmark-circle' : 'bulb-outline'}
            size={20}
            color={isRight ? DK.green : DK.red}
            style={{ flexShrink: 0 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[q.feedbackTitle, { color: isRight ? DK.green : DK.red }]}>
              {isRight ? "Bonne réponse !" : 'Presque !'}
            </Text>
            <Text style={q.feedbackSub}>{exo.explication}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const q = StyleSheet.create({
  card: { marginBottom: 15 },
  questionCard: {
    borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 24, padding: 18,
  },
  questionChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(53,228,210,0.09)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10,
  },
  questionChipText: { fontSize: 12, fontWeight: '800', color: DK.cyan },
  title: { fontSize: 16, fontWeight: '800', color: DK.ink, letterSpacing: -0.2, lineHeight: 23 },
  optsList: { gap: 9, marginTop: 12 },
  optRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(19,26,58,0.5)',
  },
  optRowRight: {
    borderColor: 'rgba(110,230,150,0.7)', backgroundColor: 'rgba(110,230,150,0.12)',
    shadowColor: DK.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  optRowWrong: {
    borderColor: 'rgba(255,107,90,0.7)', backgroundColor: 'rgba(255,107,90,0.1)',
    shadowColor: DK.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  optBadge: {
    width: 26, height: 26, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  optBadgeText: { fontSize: 12, fontWeight: '800', color: '#B9C6FF' },
  optLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, letterSpacing: -0.2 },
  feedback: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 18, padding: 13, marginTop: 12, borderWidth: 1,
  },
  feedbackRight: { backgroundColor: 'rgba(110,230,150,0.1)', borderColor: 'rgba(110,230,150,0.45)' },
  feedbackWrong: { backgroundColor: 'rgba(255,107,90,0.08)', borderColor: 'rgba(255,107,90,0.45)' },
  feedbackTitle: { fontWeight: '800', fontSize: 14.5 },
  feedbackSub: { fontSize: 12.5, color: 'rgba(230,236,255,0.9)', fontWeight: '500', marginTop: 3, lineHeight: 19 },
});

// ─── Écran principal ─────────────────────────────────────────────────────────

const LESSON_FIELD: Record<string, keyof SavedLesson> = {
  fiche: 'fiche',
  flashcards: 'flashcards',
  exercices: 'exercices',
  minitest: 'minitest',
  controle: 'controleBlanc',
};

export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string; lessonId?: string; echeanceId?: string }>();
  const kind = (typeof params.kind === 'string' ? params.kind : 'fiche') as string;
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : undefined;
  const echeanceId = typeof params.echeanceId === 'string' ? params.echeanceId : undefined;
  const meta = META[kind] ?? META.fiche;
  const { child, lessons, updateLesson, updateEcheance, addXP, addDrillResult } = useChild();

  // ── mode échéance (contrôle global) ──
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
  // un contrôle blanc de l'ancien format (sans sous-questions) est périmé :
  // on le régénère pour obtenir la notation 1 point par sous-question
  const cachedStale = kind === 'controle' && cachedRaw
    && !(cachedRaw.questions ?? []).some((q: any) => (q.sousQuestions ?? []).length > 0);
  const cached = cachedStale ? undefined : cachedRaw;

  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<any>(cached ?? null);

  // flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // mini-test scoring
  const [answers, setAnswers] = useState<boolean[]>([]);
  // controle corrections
  const [shownCorrections, setShownCorrections] = useState<Set<number>>(new Set());
  // controle blanc : notation par sous-question (clé "qi-si" → juste)
  const [subChecks, setSubChecks] = useState<Record<string, boolean>>({});
  const [examDone, setExamDone] = useState(false);

  const generate = useCallback(async () => {
    if (!child) return;
    if (echeanceMode ? (!echeance || linkedLessons.length === 0) : !lesson) return;
    setLoading(true);
    setError(null);
    setContent(null);
    setCardIndex(0);
    setFlipped(false);
    setAnswers([]);
    setShownCorrections(new Set());
    setSubChecks({});
    setExamDone(false);
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
        else if (kind === 'flashcards') result = await generateFlashcards(lesson, child);
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
          fiche: 'fiche', flashcards: 'flashcard_set', exercices: 'exercise',
          minitest: 'minitest', controle: 'controle', planning: 'fiche',
        };
        const reason = (xpMap[kind] ?? 'fiche') as import('../lib/gamification').XPReason;
        const amountMap: Partial<Record<import('../lib/gamification').XPReason, number>> = {
          fiche: 5, flashcard_set: 5, exercise: 5, minitest: 15, controle: 30,
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

  // ── rendus des contenus ──

  let body: React.ReactNode = null;

  if (kind === 'fiche' && content) {
    const fiche = content as RevisionSheet;
    body = (
      <>
        <Text style={s.contentTitle}>{fiche.titre}</Text>
        {(fiche.sections ?? []).map((sec, i) => (
          <LinearGradient
            key={i}
            colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.ficheCard}
          >
            <Text style={s.ficheLabel}>{i + 1} · {sec.titre.toUpperCase()}</Text>
            <Text style={s.ficheText}>{sec.contenu}</Text>
            {sec.points_cles?.length > 0 && (
              <View style={s.pointsBox}>
                <Text style={s.pointsLabel}>★ POINTS CLÉS</Text>
                {sec.points_cles.map((p, pi) => (
                  <View key={pi} style={s.pointRow}>
                    <Text style={s.pointBullet}>•</Text>
                    <Text style={s.pointText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
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
        <Text style={s.counter}>Carte {cardIndex + 1} / {cards.length}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { setFlipped((f) => !f); if (child && !flipped) addXP(child.id, 2, 'flashcard_flip'); }}
        >
          <LinearGradient
            colors={flipped ? ['rgba(20,110,95,0.55)', 'rgba(14,40,50,0.8)'] : ['rgba(85,50,130,0.5)', 'rgba(25,20,60,0.75)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.flashcard, flipped ? s.flashcardBack : null]}
          >
            <Text style={[s.flashLabel, { color: flipped ? DK.cyan : '#C9A0FF' }]}>{flipped ? 'RÉPONSE' : 'QUESTION'}</Text>
            <Text style={s.flashText}>{flipped ? card.verso : card.recto}</Text>
            <View style={s.flipHint}>
              <Ionicons name="sync-outline" size={15} color="rgba(220,210,255,0.6)" />
              <Text style={s.flipHintText}>Touche la carte pour la retourner</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {/* points de progression */}
        <View style={s.dotsRow}>
          {cards.map((_, di) => (
            <View
              key={di}
              style={[
                s.dot,
                di < cardIndex && { backgroundColor: DK.cyan },
                di === cardIndex && s.dotActive,
              ]}
            />
          ))}
        </View>
        <View style={s.navBtnRow}>
          <DarkGhostBtn
            label="Précédente"
            icon={<Ionicons name="arrow-back" size={18} color="#DDE4FF" />}
            onPress={() => { if (cardIndex > 0) { setCardIndex(cardIndex - 1); setFlipped(false); } }}
            style={{ flex: 1 }}
          />
          <CyanBtn
            label="Suivante"
            icon={<Ionicons name="arrow-forward" size={18} color="#052A26" />}
            onPress={() => { if (cardIndex < cards.length - 1) { setCardIndex(cardIndex + 1); setFlipped(false); } }}
            style={{ flex: 1 }}
          />
        </View>
      </>
    ) : null;
  }

  if ((kind === 'exercices' || kind === 'piege') && content) {
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
    const pct = total > 0 ? (score / total) * 100 : 0;
    body = (
      <>
        {(mt.exercices ?? []).map((exo, i) => (
          <QcmBlock key={i} exo={exo} index={i} onAnswered={(right) => { setAnswers((prev) => [...prev, right]); if (child) addXP(child.id, right ? 5 : 1, right ? 'qcm_correct' : 'qcm_wrong'); }} />
        ))}
        {done && (
          <LinearGradient
            colors={['rgba(90,70,20,0.35)', 'rgba(19,26,58,0.65)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.scoreCard}
          >
            <Image source={DK_ICONS.trophy} style={s.scoreTrophy} />
            <Text style={s.scoreBig}>{score} / {total}</Text>
            <View style={s.scoreTrack}>
              <LinearGradient
                colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.scoreFill, { width: `${Math.max(4, pct)}%` }]}
              />
            </View>
            <Text style={s.scoreLabel}>
              {score === total ? 'Excellent travail !' : score >= total / 2 ? 'Bien joué, continue !' : 'Courage, on révise et on recommence !'}
            </Text>
            {!!mt.conseil && (
              <View style={s.conseilBox}>
                <Ionicons name="bulb-outline" size={18} color={DK.gold} />
                <Text style={s.conseilText}>{mt.conseil}</Text>
              </View>
            )}
          </LinearGradient>
        )}
      </>
    );
  }

  if (kind === 'planning' && content) {
    const plan = content as Planning;
    body = (
      <>
        {(plan.jours ?? []).map((j, i) => (
          <View key={i} style={s.planCard}>
            <View style={s.planHeader}>
              <View style={s.planBadge}>
                <Text style={s.planBadgeText}>{j.jour}</Text>
              </View>
              <Text style={s.planTotal}>
                {(j.taches ?? []).reduce((acc, t) => acc + (t.min || 0), 0)} min
              </Text>
            </View>
            {(j.taches ?? []).map((t, ti) => (
              <View key={ti} style={s.planTask}>
                <Ionicons name="ellipse-outline" size={14} color={DK.cyan} />
                <Text style={s.planTaskLabel}>{t.label}</Text>
                <Text style={s.planTaskMin}>{t.min} min</Text>
              </View>
            ))}
          </View>
        ))}
      </>
    );
  }

  if (kind === 'controle' && content) {
    const exam = content as MockExam;
    // normalisation : ancien format (correction seule) → une sous-question unique
    const questions = (exam.questions ?? []).map((qu) => ({
      ...qu,
      sousQuestions: (qu.sousQuestions && qu.sousQuestions.length > 0)
        ? qu.sousQuestions
        : [{ texte: qu.enonce, reponse: qu.correction ?? '', notion: echeanceMode ? (echeance?.subj ?? 'général') : (lesson?.matiere ?? 'général') }],
    }));
    const totalMax = questions.reduce((acc, qu) => acc + qu.sousQuestions.length, 0);
    const totalOk = questions.reduce((acc, qu, qi) =>
      acc + qu.sousQuestions.filter((_, si) => subChecks[`${qi}-${si}`]).length, 0);
    const note = totalMax > 0 ? Math.round((totalOk / totalMax) * 20) : 0;

    // classement des erreurs / acquis par notion
    const notions: Record<string, { ok: number; total: number }> = {};
    questions.forEach((qu, qi) => qu.sousQuestions.forEach((sq, si) => {
      const n = sq.notion || 'général';
      notions[n] = notions[n] ?? { ok: 0, total: 0 };
      notions[n].total += 1;
      if (subChecks[`${qi}-${si}`]) notions[n].ok += 1;
    }));
    const acquis = Object.entries(notions).filter(([, v]) => v.ok === v.total && v.total > 0).map(([n]) => n);
    const aRenforcer = Object.entries(notions).filter(([, v]) => v.ok < v.total).map(([n, v]) => `${n} (${v.ok}/${v.total})`);

    function finishExam() {
      if (!child) return;
      const matiere = echeanceMode ? (echeance?.subj ?? 'Contrôle') : (lesson?.matiere ?? 'Contrôle');
      const now = new Date().toISOString();
      const today = now.slice(0, 10);
      const sessionId = `controle-${Date.now()}`;
      // réinjection dans le moteur d'adaptation : un résultat par sous-question
      questions.forEach((qu, qi) => qu.sousQuestions.forEach((sq, si) => {
        addDrillResult({
          id: `${sessionId}-${qi}-${si}`,
          sessionId,
          exerciseId: `${sessionId}-q${qi}${String.fromCharCode(97 + si)}`,
          childId: child.id,
          date: today,
          matiere,
          competence: sq.notion || 'général',
          reussite: !!subChecks[`${qi}-${si}`],
        } as any);
      }));
      // mémorisation du résultat pour le tableau de bord des contrôles blancs
      saveExamResult({
        id: sessionId,
        childId: child.id,
        date: now,
        titre: exam.titre,
        matiere,
        note,
        totalOk,
        totalMax,
        acquis,
        aRenforcer,
      });
      playSfx(note >= 14 ? 'success' : 'correct');
      setExamDone(true);
    }

    body = (
      <>
        <Text style={s.contentTitle}>{exam.titre}</Text>
        <View style={s.examMeta}>
          <View style={s.examChip}>
            <Text style={s.examChipText}>Durée : {exam.duree_min} min</Text>
          </View>
          <View style={s.examChip}>
            <Text style={s.examChipText}>{questions.length} questions · /{totalMax} pts</Text>
          </View>
        </View>
        <Text style={s.examHint}>Cochez chaque sous-question réussie : le score se met à jour en direct.</Text>

        {questions.map((qu, i) => {
          const shown = shownCorrections.has(i);
          const nSub = qu.sousQuestions.length;
          const nOk = qu.sousQuestions.filter((_, si) => subChecks[`${i}-${si}`]).length;
          return (
            <LinearGradient
              key={i}
              colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.examCard}
            >
              <View style={s.examQHeader}>
                <Text style={s.examQNum}>QUESTION {i + 1}</Text>
                <View style={[s.pointsBadge, nOk === nSub && s.pointsBadgeFull, nOk > 0 && nOk < nSub && s.pointsBadgePartial]}>
                  <Text style={[s.pointsText, nOk === nSub && { color: DK.green }, nOk > 0 && nOk < nSub && { color: DK.gold }]}>
                    {nOk}/{nSub} pts
                  </Text>
                </View>
              </View>
              <Text style={s.examEnonce}>{qu.enonce}</Text>

              {/* sous-questions cochables */}
              <View style={{ gap: 8, marginTop: 12 }}>
                {qu.sousQuestions.map((sq, si) => {
                  const key = `${i}-${si}`;
                  const on = !!subChecks[key];
                  return (
                    <View key={si}>
                      <TouchableOpacity
                        onPress={() => {
                          playSfx(on ? 'wrong' : 'correct');
                          setSubChecks((prev) => ({ ...prev, [key]: !on }));
                        }}
                        style={[s.subQRow, on && s.subQRowOn]}
                        activeOpacity={0.8}
                      >
                        <View style={[s.subQCheck, on && s.subQCheckOn]}>
                          {on && <Ionicons name="checkmark" size={14} color="#062A14" />}
                        </View>
                        <Text style={[s.subQText, on && { color: '#9FF0BE' }]}>{sq.texte}</Text>
                        <Text style={s.subQPoint}>{on ? '1 pt' : '0 pt'}</Text>
                      </TouchableOpacity>
                      {shown && !!sq.reponse && (
                        <Text style={s.subQAnswer}>→ {sq.reponse}</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setShownCorrections((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i); else next.add(i);
                  return next;
                })}
                style={s.corrToggle}
              >
                <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={17} color={DK.cyan} />
                <Text style={s.corrToggleText}>{shown ? 'Masquer les réponses' : 'Voir les réponses (parent)'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          );
        })}

        {/* total en direct + fin de contrôle */}
        <View style={s.examTotalCard}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={s.examTotalLabel}>TOTAL</Text>
            <Text style={s.examTotalNote}>{totalOk}/{totalMax}  ·  <Text style={{ color: note >= 14 ? DK.green : note >= 10 ? DK.gold : DK.red }}>{note}/20</Text></Text>
          </View>
          {!examDone ? (
            <TouchableOpacity onPress={finishExam} activeOpacity={0.88} style={{ marginTop: 12 }}>
              <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishBtn}>
                <Ionicons name="checkmark-done" size={18} color="#052620" />
                <Text style={s.finishBtnText}>Terminer le contrôle</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              {/* synthèse des acquis / points à retravailler */}
              <View style={s.synthBlock}>
                <Text style={s.synthLabel}>✅ ACQUIS</Text>
                <Text style={s.synthText}>{acquis.length > 0 ? acquis.join(' · ') : 'Aucune notion entièrement maîtrisée sur ce contrôle.'}</Text>
              </View>
              <View style={s.synthBlock}>
                <Text style={[s.synthLabel, { color: DK.gold }]}>🔶 À RENFORCER</Text>
                <Text style={s.synthText}>{aRenforcer.length > 0 ? aRenforcer.join(' · ') : 'Rien à signaler, tout est juste !'}</Text>
              </View>
              <Text style={s.synthHint}>
                Ces points faibles sont enregistrés : les prochains drills de {child.name} cibleront ces notions.
              </Text>
              <TouchableOpacity
                onPress={() => { setSubChecks({}); setExamDone(false); }}
                style={s.retryRow}
              >
                <Ionicons name="refresh" size={15} color={DK.sub} />
                <Text style={s.retryText}>Recommencer la correction</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </>
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
        label="Régénérer"
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

  cyanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 15, paddingHorizontal: 18,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8,
  },
  cyanBtnText: { color: '#052A26', fontSize: 15, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },

  contentTitle: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.4, marginTop: 4 },

  // fiche (wireframe 3a)
  ficheCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginTop: 13 },
  ficheLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: DK.cyan },
  ficheText: { fontSize: 13.5, lineHeight: 21, marginTop: 8, color: 'rgba(230,236,255,0.9)', fontWeight: '500' },
  pointsBox: {
    marginTop: 12, borderRadius: 16, padding: 13,
    backgroundColor: 'rgba(245,194,75,0.07)', borderWidth: 1, borderColor: 'rgba(245,194,75,0.4)',
  },
  pointsLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: DK.gold, marginBottom: 8 },
  pointRow: { flexDirection: 'row', gap: 9, marginTop: 5 },
  pointBullet: { color: DK.gold, fontWeight: '800', fontSize: 13 },
  pointText: { flex: 1, fontSize: 13, lineHeight: 19, color: 'rgba(235,240,255,0.9)', fontWeight: '500' },

  // flashcards (wireframe 3c)
  counter: { alignSelf: 'center', fontSize: 14, fontWeight: '800', color: DK.sub, marginBottom: 14 },
  flashcard: {
    minHeight: 330, borderRadius: 28, padding: 26,
    borderWidth: 1.5, borderColor: 'rgba(190,140,255,0.45)',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    shadowColor: DK.violet, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 40, elevation: 8,
  },
  flashcardBack: { borderColor: 'rgba(53,228,210,0.5)', shadowColor: DK.cyan },
  flashLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  flashText: { fontSize: 21, fontWeight: '800', color: DK.ink, textAlign: 'center', letterSpacing: -0.3, lineHeight: 30 },
  flipHint: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  flipHintText: { fontSize: 12, color: 'rgba(220,210,255,0.6)', fontWeight: '600' },
  dotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 18 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.3)' },
  dotActive: { width: 16, borderRadius: 3, backgroundColor: '#C9A0FF' },
  navBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },

  // score mini-test (wireframe 3d)
  scoreCard: {
    borderWidth: 1, borderColor: 'rgba(245,194,75,0.45)', borderRadius: 26,
    padding: 22, marginTop: 6, alignItems: 'center',
  },
  scoreTrophy: {
    width: 64, height: 64,
    shadowColor: DK.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  scoreBig: {
    fontSize: 44, fontWeight: '800', marginTop: 10, color: DK.gold,
    textShadowColor: 'rgba(245,194,75,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 26,
  },
  scoreTrack: {
    alignSelf: 'stretch', height: 9, borderRadius: 5, marginTop: 14,
    backgroundColor: 'rgba(148,168,255,0.15)', overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 5 },
  scoreLabel: { fontSize: 15, fontWeight: '700', color: DK.ink, letterSpacing: -0.2, marginTop: 14, textAlign: 'center' },
  conseilBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9, alignSelf: 'stretch',
    backgroundColor: 'rgba(255,194,75,0.1)', borderWidth: 1, borderColor: 'rgba(255,194,75,0.4)',
    borderRadius: 16, padding: 13, marginTop: 14,
  },
  conseilText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FFE3B0', lineHeight: 20 },

  // contrôle blanc
  examMeta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  examChip: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  examChipText: { fontSize: 11.5, fontWeight: '700', color: DK.cyan },
  examCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginTop: 13 },
  examQHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  examQNum: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1 },
  pointsBadge: {
    backgroundColor: 'rgba(255,107,90,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.45)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  pointsText: { fontSize: 12.5, fontWeight: '800', color: DK.red },
  pointsBadgeFull: { backgroundColor: 'rgba(52,214,150,0.12)', borderColor: 'rgba(52,214,150,0.55)' },
  pointsBadgePartial: { backgroundColor: 'rgba(245,194,75,0.1)', borderColor: 'rgba(245,194,75,0.55)' },
  examHint: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 10, lineHeight: 18 },
  subQRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.2, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(10,14,34,0.45)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
  },
  subQRowOn: {
    borderColor: 'rgba(110,230,150,0.65)', backgroundColor: 'rgba(110,230,150,0.1)',
  },
  subQCheck: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  subQCheckOn: { backgroundColor: DK.green, borderColor: DK.green },
  subQText: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, lineHeight: 20 },
  subQPoint: { fontSize: 11.5, fontWeight: '800', color: DK.faint },
  subQAnswer: { fontSize: 12.5, color: DK.cyan, fontWeight: '600', marginTop: 5, marginLeft: 12, lineHeight: 18 },
  examTotalCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 22, padding: 16, marginTop: 16,
  },
  examTotalLabel: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1.5 },
  examTotalNote: { fontSize: 22, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 14,
  },
  finishBtnText: { color: '#052620', fontSize: 15, fontWeight: '800' },
  synthBlock: { marginTop: 13 },
  synthLabel: { fontSize: 11.5, fontWeight: '800', color: DK.green, letterSpacing: 0.8 },
  synthText: { fontSize: 13.5, color: 'rgba(230,236,255,0.9)', fontWeight: '600', lineHeight: 20, marginTop: 4 },
  synthHint: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 12, lineHeight: 17, fontStyle: 'italic' },
  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 13 },
  retryText: { fontSize: 12.5, fontWeight: '700', color: DK.sub },
  examEnonce: { fontSize: 15.5, fontWeight: '700', color: DK.ink, lineHeight: 23, letterSpacing: -0.2 },
  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  corrToggleText: { color: DK.cyan, fontWeight: '800', fontSize: 13.5 },
  corrBox: {
    backgroundColor: 'rgba(10,14,34,0.6)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.14)',
    borderRadius: 14, padding: 13, marginTop: 10,
  },
  corrText: { fontSize: 13.5, color: 'rgba(230,236,255,0.9)', fontWeight: '500', lineHeight: 21 },

  // planning
  planCard: {
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 15, marginTop: 13,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  planBadge: {
    backgroundColor: 'rgba(90,140,255,0.14)', borderWidth: 1, borderColor: 'rgba(90,140,255,0.45)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  planBadgeText: { fontSize: 13.5, fontWeight: '800', color: '#7CB4FF' },
  planTotal: { fontSize: 12.5, fontWeight: '800', color: DK.sub },
  planTask: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6 },
  planTaskLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, lineHeight: 20 },
  planTaskMin: { fontSize: 12.5, fontWeight: '800', color: DK.amber },
});
