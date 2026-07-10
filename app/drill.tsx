import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { Confetti } from '../components/anim/Confetti';
import { CountUp } from '../components/anim/CountUp';
import { BadgeCelebration } from '../components/anim/BadgeCelebration';
import { playSfx } from '../lib/sfx';
import type { BadgeId } from '../lib/gamification';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useChild } from '../contexts/ChildContext';
import { buildSystemPrompt } from '../lib/systemPrompt';
import { buildDrillHtml } from '../lib/drillPrint';
import { buildAdaptationConsignes } from '../lib/adaptation';
import { generateDrill, AiError } from '../services/ai';
import type { DrillExerciseAI } from '../services/ai';
import type { DrillSession, DrillExercise, DrillResult, ErrorType } from '../types/childProfile';

const ERROR_TYPES: { key: ErrorType; label: string }[] = [
  { key: 'calcul', label: 'Calcul' },
  { key: 'methode', label: 'Méthode' },
  { key: 'consigne', label: 'Consigne' },
  { key: 'orthographe', label: 'Orthographe' },
  { key: 'accord', label: 'Accord' },
  { key: 'justification', label: 'Justification' },
  { key: 'soin', label: 'Soin' },
  { key: 'raisonnement', label: 'Autre' },
];

const LEVEL_MAP: Record<string, string> = {
  fragile: 'Fragile', moyen: 'Moyen', bon: 'Bon', avance: 'Avancé', tres_avance: 'Très avancé',
};
const OBJ_MAP: Record<string, string> = {
  consolidation: 'Consolidation', bon_niveau: 'Bon niveau', excellence: 'Excellence', concours: 'Concours',
};

/** Teintes néon par type d'exercice (carte + pilule matière), comme la maquette. */
type Tint = {
  grad: [string, string]; border: string;
  pillBg: string; pillBorder: string; pillText: string;
};
const TINTS: Record<string, Tint> = {
  violet: {
    grad: ['rgba(60,45,120,0.45)', 'rgba(19,26,58,0.65)'], border: 'rgba(139,124,246,0.35)',
    pillBg: 'rgba(139,124,246,0.18)', pillBorder: 'rgba(139,124,246,0.55)', pillText: '#C9A0FF',
  },
  pink: {
    grad: ['rgba(120,35,70,0.35)', 'rgba(19,26,58,0.65)'], border: 'rgba(255,61,138,0.35)',
    pillBg: 'rgba(255,61,138,0.15)', pillBorder: 'rgba(255,61,138,0.5)', pillText: '#FF8DB8',
  },
  amber: {
    grad: ['rgba(120,80,25,0.4)', 'rgba(19,26,58,0.65)'], border: 'rgba(255,158,44,0.35)',
    pillBg: 'rgba(255,158,44,0.15)', pillBorder: 'rgba(255,158,44,0.55)', pillText: '#FFB27A',
  },
  blue: {
    grad: ['rgba(35,60,130,0.45)', 'rgba(19,26,58,0.65)'], border: 'rgba(90,140,255,0.35)',
    pillBg: 'rgba(90,140,255,0.16)', pillBorder: 'rgba(90,140,255,0.55)', pillText: '#9DB9FF',
  },
  green: {
    grad: ['rgba(22,110,80,0.4)', 'rgba(19,26,58,0.65)'], border: 'rgba(52,214,150,0.35)',
    pillBg: 'rgba(52,214,150,0.14)', pillBorder: 'rgba(52,214,150,0.55)', pillText: '#7BE6A0',
  },
  coral: {
    grad: ['rgba(130,50,35,0.4)', 'rgba(19,26,58,0.65)'], border: 'rgba(255,107,90,0.35)',
    pillBg: 'rgba(255,107,90,0.15)', pillBorder: 'rgba(255,107,90,0.55)', pillText: '#FF9B8A',
  },
};
const TYPE_TINT: Record<string, keyof typeof TINTS> = {
  calcul: 'amber', geometrie: 'blue', francais: 'pink', lecture: 'violet',
  science: 'green', histoire: 'amber', anglais: 'coral', autre: 'blue',
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function todayFr() {
  const d = new Date();
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}
function jourSemaine() {
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return jours[new Date().getDay()];
}

/** Rebond vert sur "Réussi", secousse sur "Erreur". */
function FeedbackWrap({ res, children }: { res?: 'ok' | 'err'; children: React.ReactNode }) {
  const tx = useSharedValue(0);
  const sc = useSharedValue(1);
  const prev = useRef<'ok' | 'err' | undefined>(undefined);
  useEffect(() => {
    if (res && res !== prev.current) {
      if (res === 'ok') {
        sc.value = withSequence(withSpring(1.03, { damping: 7, stiffness: 320 }), withSpring(1, { damping: 12 }));
      } else {
        tx.value = withSequence(
          withTiming(-9, { duration: 55 }), withTiming(9, { duration: 55 }),
          withTiming(-6, { duration: 55 }), withTiming(6, { duration: 55 }),
          withTiming(0, { duration: 55 }),
        );
      }
    }
    prev.current = res;
  }, [res]);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: sc.value }],
  }));
  return <Animated.View style={anim}>{children}</Animated.View>;
}

/** Bouton pilule dégradé (principal). */
function GradientBtn({ colors, textColor, glow, onPress, children, style }: {
  colors: [string, string]; textColor: string; glow: string;
  onPress: () => void; children: React.ReactNode; style?: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <LinearGradient
        colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[s.gradBtn, { shadowColor: glow }]}
      >
        <Text style={[s.gradBtnText, { color: textColor }]}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/** Bouton pilule contour (secondaire). */
function OutlineBtn({ onPress, children, style }: { onPress: () => void; children: React.ReactNode; style?: any }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.outlineBtn, style]}>
      <Text style={s.outlineBtnText}>{children}</Text>
    </TouchableOpacity>
  );
}

export default function DrillScreen() {
  const router = useRouter();
  const { child, getProfile, getDrillResults, getDrillSessions, addDrillSession, addDrillResult, addXP } = useChild();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<DrillSession | null>(null);
  const [showCorrection, setShowCorrection] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, 'ok' | 'err'>>({});
  const [errorTypes, setErrorTypes] = useState<Record<number, ErrorType>>({});
  const [done, setDone] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);

  const profile = child ? getProfile(child.id) : undefined;
  const pastSessions = child ? getDrillSessions(child.id).filter((ds) => ds.status === 'done') : [];
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!child) return;
    setLoading(true);
    setError(null);
    setSession(null);
    setShowCorrection({});
    setResults({});
    setErrorTypes({});
    setDone(false);
    try {
      const prof = getProfile(child.id);
      const systemPrompt = prof
        ? buildSystemPrompt(child, prof)
        : `Tu es un professeur particulier pour ${child.name}, ${child.age} ans, classe de ${child.classe}.`;

      const allResults = getDrillResults(child.id);
      const recentErrors = allResults
        .slice(0, 10)
        .filter((r) => !r.reussite && r.typeErreur)
        .map((r) => `${r.competence} (${r.typeErreur})`);
      const consignesAdaptation = buildAdaptationConsignes(allResults);

      const urgentEcheance = (child.echeances ?? [])
        .filter((e) => e.days <= 7)
        .map((e) => `${e.type} de ${e.subj} dans ${e.days} jour${e.days > 1 ? 's' : ''}`)[0];

      const drill = await generateDrill({
        childName: child.name,
        classe: child.classe,
        date: todayFr(),
        jourSemaine: jourSemaine(),
        dureeMin: prof ? (prof.dureeQuotidienne === 'custom' ? 30 : prof.dureeQuotidienne as number) : 20,
        matieres: prof ? prof.matieresPrioritaires : (child.matieres?.map((m) => m.s) ?? ['Mathématiques', 'Français']),
        niveauEstime: prof ? LEVEL_MAP[prof.niveauEstime] : 'Moyen',
        objectif: prof ? OBJ_MAP[prof.objectif] : 'Bon niveau',
        pointsFaibles: prof ? prof.pointsFaibles : (child.faibles ?? []),
        recentErrors: recentErrors.slice(0, 5),
        controleAVenir: urgentEcheance,
        consignesAdaptation,
      }, systemPrompt);

      const exercises: DrillExercise[] = drill.exercises.map((ex: DrillExerciseAI, i) => ({
        id: `ex-${Date.now()}-${i}`,
        matiere: ex.matiere,
        competence: ex.competence,
        niveau: ex.niveau,
        consigne: ex.consigne,
        correction: ex.correction,
        phraseParent: ex.phraseParent,
        type: ex.type,
      }));

      const s: DrillSession = {
        id: `drill-${Date.now()}`,
        childId: child.id,
        date: todayStr(),
        dureeMin: drill.dureeEstimee,
        exercises,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setSession(s);
    } catch (e) {
      if (e instanceof AiError && e.code === 'NO_KEY') {
        setError('Clé API manquante. Ajoutez votre clé dans Réglages.');
      } else {
        setError(e instanceof Error ? e.message : 'Erreur lors de la génération du drill.');
      }
    } finally {
      setLoading(false);
    }
  }, [child, getProfile, getDrillResults]);

  function toggleCorrection(i: number) {
    setShowCorrection((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function markResult(i: number, ok: boolean) {
    playSfx(ok ? 'correct' : 'wrong');
    setResults((prev) => ({ ...prev, [i]: ok ? 'ok' : 'err' }));
    if (ok) setErrorTypes((prev) => { const next = { ...prev }; delete next[i]; return next; });
  }

  const [printing, setPrinting] = useState(false);
  async function printDrill() {
    if (!session || !child) return;
    setPrinting(true);
    try {
      const html = buildDrillHtml(session, child.name, child.classe, todayFr());
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Drill imprimable' });
      } else {
        await Print.printAsync({ uri });
      }
    } catch {
      Alert.alert('Impression impossible', "La génération du PDF a échoué. Réessayez.");
    } finally {
      setPrinting(false);
    }
  }

  function finish() {
    if (!session || !child) return;
    const total = session.exercises.length;
    const ok = Object.values(results).filter((v) => v === 'ok').length;
    const score = total > 0 ? Math.round((ok / total) * 100) : 0;
    const finalSession: DrillSession = { ...session, status: 'done', scoreGlobal: score };
    addDrillSession(finalSession);

    session.exercises.forEach((ex, i) => {
      const reussite = results[i] === 'ok';
      const r: DrillResult = {
        id: `result-${Date.now()}-${i}`,
        sessionId: session.id,
        exerciseId: ex.id,
        childId: child.id,
        date: todayStr(),
        matiere: ex.matiere,
        competence: ex.competence,
        reussite,
        typeErreur: reussite ? undefined : errorTypes[i],
      };
      addDrillResult(r);
    });

    const unlocked = addXP(child.id, Math.max(5, ok * 3), 'exercise');
    setNewBadges(unlocked);
    if (score >= 80) playSfx('success');
    setDone(true);
  }

  if (!child) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <View style={s.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
          </View>
          <View style={s.center}>
            <Text style={s.noChild}>Aucun enfant sélectionné</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (done && session) {
    const total = session.exercises.length;
    const ok = Object.values(results).filter((v) => v === 'ok').length;
    const err = total - ok;
    const score = total > 0 ? Math.round((ok / total) * 100) : 0;
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.topNav}>
              <TouchableOpacity onPress={() => router.back()} style={s.backCircle}>
                <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
              </TouchableOpacity>
            </View>
            <View style={s.doneBox}>
              <Animated.Text entering={ZoomIn.springify().damping(9)} style={s.doneEmoji}>
                {score >= 80 ? '🎉' : score >= 50 ? '💪' : '📚'}
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(150)} style={s.doneTitle}>Bravo {child.name} !</Animated.Text>
              <Text style={s.doneSub}>Séance du jour terminée</Text>
              <CountUp value={score} suffix=" %" style={s.doneScore} />
              <Text style={s.doneDetail}>{ok} réussi{ok > 1 ? 's' : ''} • {err} erreur{err > 1 ? 's' : ''}</Text>
              <View style={s.doneTrack}>
                <LinearGradient
                  colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.doneFill, { width: `${Math.max(3, score)}%` }]}
                />
              </View>
              <Animated.View entering={FadeInDown.delay(600)} style={s.xpPill}>
                <Text style={s.xpPillText}>+{Math.max(5, ok * 3)} XP</Text>
              </Animated.View>
            </View>
            <GradientBtn
              colors={['#1FB8A8', DK.cyan]} textColor="#052A26" glow={DK.cyan}
              onPress={() => router.back()}
            >
              Retour à l'espace
            </GradientBtn>
            <OutlineBtn onPress={() => { setDone(false); generate(); }} style={{ marginTop: 12 }}>
              Nouveau drill
            </OutlineBtn>
            <View style={{ height: 32 }} />
          </ScrollView>
          {score >= 80 && <Confetti />}
          <BadgeCelebration badges={newBadges} onFinished={() => setNewBadges([])} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.title}>Drill du jour</Text>
              <Text style={s.dateLine}>
                {session
                  ? `${Object.keys(results).length} / ${session.exercises.length} exercices faits`
                  : todayFr()}
              </Text>
            </View>
            <Image source={DK_ICONS.avatar} style={s.avatar} />
          </View>

          {/* Barre de progression de la séance */}
          {session && (
            <View style={s.sessionTrack}>
              <LinearGradient
                colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.sessionFill, {
                  width: `${Math.max(2, Math.round((Object.keys(results).length / Math.max(1, session.exercises.length)) * 100))}%`,
                }]}
              />
            </View>
          )}

          {/* Profil du jour ou CTA pour compléter le profil */}
          {!profile ? (
            <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.profileCTA} activeOpacity={0.85}>
              <Ionicons name="person-add-outline" size={20} color={DK.cyan} />
              <View style={{ flex: 1 }}>
                <Text style={s.profileCTATitle}>Complétez le profil de {child.name}</Text>
                <Text style={s.profileCTASub}>Niveau, objectif, difficultés → drills ultra-personnalisés</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={DK.cyan} />
            </TouchableOpacity>
          ) : !session && (
            <LinearGradient
              colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.profileCard}
            >
              <Text style={s.profileLabel}>TON PROFIL DU JOUR</Text>
              <View style={s.pillRow}>
                {profile.matieresPrioritaires.map((m) => (
                  <View key={m} style={[s.pill, s.pillViolet]}>
                    <Text style={[s.pillText, { color: '#C9A8FF' }]}>{m} prioritaire</Text>
                  </View>
                ))}
                <View style={[s.pill, s.pillCyan]}>
                  <Text style={[s.pillText, { color: DK.cyan }]}>
                    {profile.dureeQuotidienne === 'custom' ? 'Durée libre' : `${profile.dureeQuotidienne} min / jour`}
                  </Text>
                </View>
                <View style={[s.pill, s.pillPink]}>
                  <Text style={[s.pillText, { color: '#FF8DB8' }]}>
                    {LEVEL_MAP[profile.niveauEstime]} · {OBJ_MAP[profile.objectif]}
                  </Text>
                </View>
                {profile.pointsFaibles.slice(0, 2).map((pf) => (
                  <View key={pf} style={[s.pill, s.pillOrange]}>
                    <Text style={[s.pillText, { color: '#FFB27A' }]}>Point faible : {pf}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          )}

          {/* Bouton génération */}
          {!session && !loading && (
            <View style={s.generateSection}>
              <GradientBtn
                colors={[DK.xpMid, DK.xpTo]} textColor="#2A1600" glow="#FF9640"
                onPress={generate}
              >
                ⚡ Générer le drill du jour
              </GradientBtn>
              <Text style={s.generateHint}>L'IA adapte les exercices au profil de {child.name}</Text>
            </View>
          )}

          {/* Historique des séances */}
          {!session && !loading && pastSessions.length > 0 && (
            <>
              <Text style={s.histSectionLabel}>SÉANCES PRÉCÉDENTES</Text>
              {pastSessions.slice(0, 15).map((ds) => {
                const open = openHistory === ds.id;
                const scoreColor = (ds.scoreGlobal ?? 0) >= 80 ? '#7BE6A0' : (ds.scoreGlobal ?? 0) >= 50 ? DK.gold : '#FF9B8A';
                const d = new Date(ds.date + 'T12:00:00');
                const dateLabel = `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                return (
                  <TouchableOpacity
                    key={ds.id}
                    onPress={() => setOpenHistory(open ? null : ds.id)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['rgba(47,60,112,0.4)', 'rgba(19,26,58,0.55)']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={s.histCard}
                    >
                      <View style={s.histHead}>
                        <Image source={DK_ICONS.lightning} style={s.histIcon} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.histDate}>{dateLabel}</Text>
                          <Text style={s.histMeta}>{ds.exercises.length} exercices · ~{ds.dureeMin} min</Text>
                        </View>
                        <Text style={[s.histScore, { color: scoreColor }]}>{ds.scoreGlobal ?? 0} %</Text>
                        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color="rgba(185,198,255,0.6)" style={{ marginLeft: 8 }} />
                      </View>
                      {open && (
                        <View style={s.histDetail}>
                          {ds.exercises.map((ex, i) => (
                            <Text key={ex.id} style={s.histExo} numberOfLines={2}>
                              {i + 1}. [{ex.matiere}] {ex.competence}
                            </Text>
                          ))}
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {loading && (
            <LinearGradient
              colors={['rgba(35,80,110,0.4)', 'rgba(19,26,58,0.6)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.loadingBox}
            >
              <ActivityIndicator size="large" color={DK.cyan} />
              <View style={{ flex: 1 }}>
                <Text style={s.loadingText}>L'IA prépare tes exercices…</Text>
                <Text style={s.loadingHint}>Analyse de tes dernières erreurs et de tes leçons</Text>
              </View>
            </LinearGradient>
          )}

          {error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={22} color="#FF9B8A" />
              <Text style={s.errorText}>{error}</Text>
              <GradientBtn
                colors={['#1FB8A8', DK.cyan]} textColor="#052A26" glow={DK.cyan}
                onPress={generate} style={{ marginTop: 12, alignSelf: 'stretch' }}
              >
                Réessayer
              </GradientBtn>
            </View>
          )}

          {/* Exercices du drill */}
          {session && (
            <>
              <View style={s.drillMeta}>
                <Text style={s.drillTitle}>{session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}</Text>
                <Text style={s.drillDuree}>~{session.dureeMin} min</Text>
              </View>

              {session.exercises.map((ex, i) => {
                const tint = TINTS[TYPE_TINT[ex.type] ?? 'blue'];
                const res = results[i];
                const corrShown = showCorrection[i];

                return (
                  <Animated.View key={ex.id} entering={FadeInDown.delay(Math.min(i, 6) * 80).springify().damping(16)}>
                  <FeedbackWrap res={res}>
                  <LinearGradient
                    colors={tint.grad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[s.exCard, { borderColor: tint.border }]}
                  >
                    {/* En-tête exercice */}
                    <View style={s.exHeader}>
                      <View style={[s.exMatPill, { backgroundColor: tint.pillBg, borderColor: tint.pillBorder }]}>
                        <Text style={[s.exMatPillText, { color: tint.pillText }]}>{ex.matiere.toUpperCase()}</Text>
                      </View>
                      <Text style={s.exCompetence} numberOfLines={1}>{ex.competence}</Text>
                      <Text style={s.exNumber}>n° {i + 1}/{session.exercises.length}</Text>
                    </View>

                    {/* Consigne */}
                    <Text style={s.consigne}>{ex.consigne}</Text>

                    {/* Correction (parent) */}
                    <TouchableOpacity onPress={() => toggleCorrection(i)} style={s.corrToggle} activeOpacity={0.8}>
                      <Ionicons name={corrShown ? 'eye-off-outline' : 'eye-outline'} size={16} color="#DDE4FF" />
                      <Text style={s.corrToggleText}>{corrShown ? 'Masquer la correction' : 'Afficher la correction parent'}</Text>
                    </TouchableOpacity>

                    {corrShown && (
                      <View style={s.corrBox}>
                        <Text style={s.corrTitle}>CORRECTION</Text>
                        <Text style={s.corrText}>{ex.correction}</Text>
                        {ex.phraseParent && (
                          <View style={s.phraseParentBox}>
                            <Ionicons name="chatbubble-outline" size={14} color={DK.cyan} />
                            <Text style={s.phraseParentText}>{ex.phraseParent}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Boutons résultat */}
                    <View style={s.resultRow}>
                      <TouchableOpacity
                        onPress={() => markResult(i, true)}
                        style={[s.resultBtn, s.resultBtnOkIdle, res === 'ok' && s.resultBtnOk]}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.resultBtnText, { color: res === 'ok' ? '#7BE6A0' : 'rgba(123,230,160,0.6)' }]}>Réussi ✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => markResult(i, false)}
                        style={[s.resultBtn, s.resultBtnErrIdle, res === 'err' && s.resultBtnErr]}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.resultBtnText, { color: res === 'err' ? '#FF9B8A' : 'rgba(255,155,138,0.6)' }]}>Erreur ✕</Text>
                      </TouchableOpacity>
                    </View>

                    {res === 'err' && (
                      <View style={s.errTypeBox}>
                        <Text style={s.errTypeLabel}>TYPE D'ERREUR</Text>
                        <View style={s.errTypeRow}>
                          {ERROR_TYPES.map((et) => {
                            const on = errorTypes[i] === et.key;
                            return (
                              <TouchableOpacity
                                key={et.key}
                                onPress={() => setErrorTypes((prev) => ({ ...prev, [i]: et.key }))}
                                style={[s.errTypeChip, on && s.errTypeChipOn]}
                                activeOpacity={0.8}
                              >
                                <Text style={[s.errTypeChipText, on && s.errTypeChipTextOn]}>{et.label}{on ? ' ✓' : ''}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                  </FeedbackWrap>
                  </Animated.View>
                );
              })}

              <View style={{ height: 8 }} />
              <GradientBtn
                colors={['#1FB8A8', DK.cyan]} textColor="#052A26" glow={DK.cyan}
                onPress={finish}
              >
                Terminer la séance
              </GradientBtn>
              <View style={s.secondaryRow}>
                <OutlineBtn onPress={printDrill} style={{ flex: 1 }}>
                  {printing ? 'Génération du PDF…' : 'Version imprimable'}
                </OutlineBtn>
                <OutlineBtn onPress={generate} style={{ flex: 1 }}>
                  Régénérer
                </OutlineBtn>
              </View>
              <View style={{ height: 32 }} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noChild: { fontSize: 16, color: DK.sub, textAlign: 'center' },
  topNav: { flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 0 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(148,168,255,0.12)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: DK.ink, letterSpacing: -0.5 },
  dateLine: { fontSize: 13, color: DK.sub, fontWeight: '500', marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.4)' },

  sessionTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(148,168,255,0.15)', overflow: 'hidden', marginBottom: 16 },
  sessionFill: { height: '100%', borderRadius: 4 },

  profileCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: 'rgba(53,228,210,0.09)', borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)',
    borderRadius: 20, padding: 14, marginBottom: 18,
  },
  profileCTATitle: { fontSize: 14.5, fontWeight: '800', color: DK.ink },
  profileCTASub: { fontSize: 12.5, color: DK.sub, fontWeight: '500', marginTop: 2 },

  profileCard: {
    borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginBottom: 16,
  },
  profileLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(200,210,255,0.55)', marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pill: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1 },
  pillText: { fontSize: 11.5, fontWeight: '700' },
  pillViolet: { backgroundColor: 'rgba(139,124,246,0.12)', borderColor: 'rgba(139,124,246,0.5)' },
  pillCyan: { backgroundColor: 'rgba(53,228,210,0.08)', borderColor: 'rgba(53,228,210,0.45)' },
  pillPink: { backgroundColor: 'rgba(255,61,138,0.1)', borderColor: 'rgba(255,61,138,0.45)' },
  pillOrange: { backgroundColor: 'rgba(255,122,61,0.1)', borderColor: 'rgba(255,122,61,0.5)' },

  gradBtn: {
    borderRadius: 999, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  gradBtnText: { fontSize: 15.5, fontWeight: '800' },
  outlineBtn: {
    borderRadius: 999, paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)',
  },
  outlineBtnText: { color: '#DDE4FF', fontSize: 13.5, fontWeight: '700' },
  secondaryRow: { flexDirection: 'row', gap: 9, marginTop: 10 },

  generateSection: { marginBottom: 20 },
  generateHint: { fontSize: 12.5, color: DK.faint, fontWeight: '500', textAlign: 'center', marginTop: 10 },

  loadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.3)', borderRadius: 22, padding: 16, marginBottom: 16,
  },
  loadingText: { fontSize: 13.5, fontWeight: '800', color: DK.cyan },
  loadingHint: { fontSize: 11.5, color: 'rgba(210,220,255,0.65)', marginTop: 3 },

  errorBox: {
    alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,90,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,90,60,0.4)',
    borderRadius: 22, padding: 20, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: '#FF9B8A', fontWeight: '600', textAlign: 'center', lineHeight: 20 },

  drillMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  drillTitle: { fontSize: 16, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  drillDuree: { fontSize: 13, color: DK.sub, fontWeight: '700' },

  exCard: { borderWidth: 1, borderRadius: 24, padding: 16, marginBottom: 14 },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  exMatPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  exMatPillText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  exCompetence: { flex: 1, fontSize: 11.5, color: 'rgba(210,220,255,0.65)', fontWeight: '600' },
  exNumber: { fontSize: 11.5, fontWeight: '800', color: 'rgba(210,220,255,0.55)' },
  consigne: { fontSize: 15.5, color: DK.ink, fontWeight: '700', lineHeight: 23, marginBottom: 12 },

  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  corrToggleText: { fontSize: 12.5, color: '#DDE4FF', fontWeight: '700' },
  corrBox: {
    backgroundColor: 'rgba(10,14,34,0.55)', borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, padding: 14, marginBottom: 12,
  },
  corrTitle: { fontSize: 11, fontWeight: '800', color: 'rgba(200,210,255,0.5)', letterSpacing: 1, marginBottom: 7 },
  corrText: { fontSize: 14, color: DK.ink, fontWeight: '500', lineHeight: 22 },
  phraseParentBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10,
    backgroundColor: 'rgba(53,228,210,0.08)', borderWidth: 1, borderColor: 'rgba(53,228,210,0.35)',
    borderRadius: 12, padding: 10,
  },
  phraseParentText: { flex: 1, fontSize: 13, color: DK.cyan, fontWeight: '600', lineHeight: 19 },

  resultRow: { flexDirection: 'row', gap: 9, marginTop: 2 },
  resultBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderRadius: 999, paddingVertical: 12,
  },
  resultBtnOkIdle: { backgroundColor: 'rgba(110,230,150,0.08)', borderColor: 'rgba(110,230,150,0.35)' },
  resultBtnErrIdle: { backgroundColor: 'rgba(255,90,60,0.1)', borderColor: 'rgba(255,90,60,0.35)' },
  resultBtnOk: {
    backgroundColor: 'rgba(110,230,150,0.2)', borderColor: 'rgba(110,230,150,0.7)',
    shadowColor: DK.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  resultBtnErr: {
    backgroundColor: 'rgba(255,90,60,0.22)', borderColor: '#FF5A3C',
    shadowColor: '#FF5A3C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  resultBtnText: { fontSize: 14, fontWeight: '800' },

  errTypeBox: { marginTop: 14 },
  errTypeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: 'rgba(200,210,255,0.5)', marginBottom: 8 },
  errTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  errTypeChip: {
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.3)',
  },
  errTypeChipOn: {
    backgroundColor: 'rgba(53,228,210,0.12)', borderColor: 'rgba(53,228,210,0.6)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10,
  },
  errTypeChipText: { fontSize: 11, fontWeight: '700', color: 'rgba(210,220,255,0.7)' },
  errTypeChipTextOn: { color: DK.cyan, fontWeight: '800' },

  histSectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)', marginTop: 8, marginBottom: 11 },
  histCard: { borderWidth: 1, borderColor: 'rgba(148,168,255,0.16)', borderRadius: 18, padding: 13, marginBottom: 8 },
  histHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  histIcon: { width: 34, height: 34 },
  histDate: { fontSize: 13.5, fontWeight: '700', color: DK.ink },
  histMeta: { fontSize: 11.5, color: 'rgba(210,220,255,0.6)', fontWeight: '600', marginTop: 2 },
  histScore: { fontSize: 13.5, fontWeight: '800' },
  histDetail: { marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: 'rgba(148,168,255,0.16)', gap: 5 },
  histExo: { fontSize: 13, color: DK.sub, fontWeight: '600', lineHeight: 18 },

  doneBox: { alignItems: 'center', paddingVertical: 28, gap: 4 },
  doneEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: DK.ink, letterSpacing: -0.6, marginTop: 12 },
  doneSub: { fontSize: 14, color: 'rgba(210,220,255,0.7)', fontWeight: '500', marginTop: 2 },
  doneScore: {
    fontSize: 60, fontWeight: '800', color: DK.cyan, marginTop: 16,
    textShadowColor: 'rgba(53,228,210,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24,
  },
  doneDetail: { fontSize: 12.5, color: 'rgba(210,220,255,0.65)', fontWeight: '600', marginTop: 2 },
  doneTrack: {
    alignSelf: 'stretch', height: 10, borderRadius: 6, marginTop: 18, marginHorizontal: 12,
    backgroundColor: 'rgba(148,168,255,0.15)', overflow: 'hidden',
  },
  doneFill: { height: '100%', borderRadius: 6 },
  xpPill: {
    marginTop: 22, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999,
    backgroundColor: 'rgba(255,120,90,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,150,90,0.55)',
    shadowColor: '#FF9640', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 18,
  },
  xpPillText: { fontSize: 18, fontWeight: '800', color: DK.xpTo },
});
