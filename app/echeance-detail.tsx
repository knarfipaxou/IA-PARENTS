import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { loadExamResults, analyzeExams, type ExamResult } from '../lib/examResults';
import { loadFlashMastery, masteryPct, type FlashMastery } from '../lib/flashMastery';
import { progressColor, progressGradient } from '../lib/progressColor';

import { subjectIcon } from '../lib/subjectIcons';

type PrepMode = 'controle' | 'flashcards' | 'both';

// cercle de statistique (anneau fin + icône, comme la maquette)
function StatRing({ pct, icon, label, value, valueColor, evaluated = true }: {
  pct: number; icon: string; label: string; value: string; valueColor?: string; evaluated?: boolean;
}) {
  const c = evaluated ? progressColor(pct) : DK.cyan;
  return (
    <View style={s.statCol}>
      <View style={s.statRing}>
        <View style={[s.statRingArc, { borderColor: 'rgba(148,168,255,0.2)' }]} />
        <View style={[
          s.statRingArc,
          {
            borderColor: c,
            opacity: Math.max(0.25, pct / 100),
            transform: [{ rotate: `${-45 + (pct / 100) * 180}deg` }],
          },
        ]} />
        <Ionicons name={icon as any} size={24} color={c} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color: valueColor ?? c }]}>{value}</Text>
    </View>
  );
}

export default function EcheanceDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { child, lessons, updateEcheance } = useChild();

  const echeance = id
    ? child?.echeances?.find((e) => e.id === id)
    : child?.echeances?.[0];

  const [exams, setExams] = useState<ExamResult[]>([]);
  const [flash, setFlash] = useState<FlashMastery | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!child || !echeance) return;
      loadExamResults(child.id).then((all) => {
        const byEch = all.filter((r) => r.echeanceId === echeance.id);
        setExams(byEch.length > 0 ? byEch : all.filter((r) => (r.matiere ?? '').toLowerCase() === echeance.subj.toLowerCase()));
      });
      loadFlashMastery(`${child.id}:${echeance.id}`).then(setFlash);
    }, [child?.id, echeance?.id])
  );

  if (!child || !echeance) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <View style={s.centerBox}>
            <Ionicons name="calendar-outline" size={42} color={DK.faint} />
            <Text style={s.centerText}>Échéance introuvable.</Text>
            <TouchableOpacity onPress={() => router.back()} style={s.ghostBtn} activeOpacity={0.85}>
              <Text style={s.ghostBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const mode: PrepMode = echeance.prepMode ?? 'both';
  const hasControle = mode !== 'flashcards';
  const hasFlash = mode !== 'controle';
  const linked = lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id));

  function setMode(target: 'controle' | 'flashcards', on: boolean) {
    if (!child || !echeance) return;
    let next: PrepMode;
    const c = target === 'controle' ? on : mode !== 'flashcards';
    const f = target === 'flashcards' ? on : mode !== 'controle';
    if (c && f) next = 'both';
    else if (c) next = 'controle';
    else if (f) next = 'flashcards';
    else return; // au moins une méthode doit rester active
    updateEcheance(child.id, echeance.id, { prepMode: next });
  }

  const an = analyzeExams(exams);
  const lastNote = an.last?.note ?? null;
  const flashPct = masteryPct(flash);

  // pourcentage principal : uniquement le contrôle blanc (sauf mode flashcards seules)
  const mainPct = hasControle
    ? (lastNote === null ? null : Math.round((lastNote / 20) * 100))
    : flashPct;
  const mainTitle = hasControle ? 'Prêt' : 'maîtrisé';
  const deltaPct = hasControle && an.delta !== undefined ? Math.round((an.delta / 20) * 100) : null;
  const cardsToReview = flash ? flash.total - flash.known : null;
  const objectifNote = lastNote !== null ? Math.min(20, lastNote + 1) : null;

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* ── En-tête ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Retour aux échéances</Text>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.push(`/echeance-edit?id=${echeance.id}` as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={17} color={DK.cyan} />
            </TouchableOpacity>
          </View>

          <View style={s.heroRow}>
            <Image source={subjectIcon(echeance.subj, 'dark')} style={s.heroIcon} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.heroTitle}>{echeance.subj}</Text>
              <Text style={s.heroSub}>{echeance.type} du {echeance.date}</Text>
            </View>
          </View>
          <View style={s.pillRow}>
            <View style={s.jPill}>
              <Text style={s.jPillText}>{echeance.days === 0 ? 'Auj.' : `J-${echeance.days}`}</Text>
            </View>
            <TouchableOpacity
              style={s.metaPill}
              onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)}
              activeOpacity={0.8}
            >
              <Text style={s.metaPillText}>• {linked.length} {linked.length > 1 ? 'leçons liées' : 'leçon liée'}</Text>
            </TouchableOpacity>
            <View style={[s.metaPill, echeance.urg && { borderColor: 'rgba(255,107,90,0.5)' }]}>
              <Text style={[s.metaPillText, echeance.urg && { color: DK.red }]}>Priorité {echeance.urg ? 'haute' : 'normale'}</Text>
            </View>
          </View>

          {/* ── Niveau principal ── */}
          <View style={s.mainCard}>
            {mainPct === null ? (
              <>
                <Text style={s.mainNonEvalue}>Non évalué</Text>
                <Text style={s.mainHint}>
                  {hasControle
                    ? 'Lance un premier contrôle blanc pour mesurer le niveau de préparation.'
                    : 'Fais une première session de flashcards pour mesurer la maîtrise.'}
                </Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
                  <Text style={[s.mainPct, { color: progressColor(mainPct) }]}>{mainPct}<Text style={s.mainPctSign}> %</Text></Text>
                  <Text style={s.mainLabel}>{mainTitle}</Text>
                </View>
                <View style={s.mainTrack}>
                  <LinearGradient
                    colors={progressGradient(mainPct)}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.mainFill, { width: `${Math.max(4, mainPct)}%` }]}
                  />
                  <View style={[s.mainThumb, {
                    left: `${Math.min(96, Math.max(2, mainPct - 2))}%`,
                    backgroundColor: progressColor(mainPct), shadowColor: progressColor(mainPct),
                  }]} />
                </View>
              </>
            )}
            {!hasControle && <Text style={s.mainSubtitle}>Maîtrise de la leçon</Text>}

            {/* résultats des méthodes sélectionnées */}
            <View style={s.statsRow}>
              {hasControle && (
                <StatRing
                  pct={lastNote !== null ? (lastNote / 20) * 100 : 0}
                  icon="clipboard-outline"
                  label="Contrôle blanc"
                  value={lastNote !== null ? `${lastNote} / 20` : 'Non évalué'}
                  evaluated={lastNote !== null}
                />
              )}
              {hasControle && hasFlash && <View style={s.statDivider} />}
              {hasFlash && (
                <StatRing
                  pct={flashPct ?? 0}
                  icon="albums-outline"
                  label="Flashcards"
                  value={flashPct !== null ? `${flashPct} % maîtrisé` : 'Non évalué'}
                  evaluated={flashPct !== null}
                />
              )}
              {hasControle && deltaPct !== null && deltaPct !== 0 && (
                <>
                  <View style={s.statDivider} />
                  <StatRing
                    pct={Math.min(100, Math.abs(deltaPct))}
                    icon="trending-up-outline"
                    label="Progression"
                    value={`${deltaPct > 0 ? '+' : ''}${deltaPct} %`}
                    valueColor={deltaPct > 0 ? DK.cyan : DK.red}
                  />
                </>
              )}
            </View>
          </View>

          {/* ── Analyse rapide ── */}
          {hasControle && an.last && (
            <View style={s.analyseCard}>
              <Text style={s.analyseTitle}>Analyse rapide</Text>
              <View style={s.analyseCols}>
                <View style={{ flex: 1 }}>
                  <View style={s.analyseHead}>
                    <Ionicons name="checkmark-circle-outline" size={17} color={DK.green} />
                    <Text style={[s.analyseHeadText, { color: DK.green }]}>Points solides</Text>
                  </View>
                  {(an.last.acquis.length > 0 ? an.last.acquis.slice(0, 3) : ['—']).map((a) => (
                    <Text key={a} style={s.analyseItem}>•  {a}</Text>
                  ))}
                </View>
                <View style={s.analyseDivider} />
                <View style={{ flex: 1 }}>
                  <View style={s.analyseHead}>
                    <Ionicons name="warning-outline" size={17} color={DK.gold} />
                    <Text style={[s.analyseHeadText, { color: DK.gold }]}>À renforcer</Text>
                  </View>
                  {(an.priorities.length > 0
                    ? an.priorities.slice(0, 3).map((p) => p.notion)
                    : an.last.aRenforcer.slice(0, 3).length > 0 ? an.last.aRenforcer.slice(0, 3) : ['—']
                  ).map((a) => (
                    <Text key={a} style={s.analyseItem}>•  {a}</Text>
                  ))}
                </View>
              </View>
              {an.priorities.length > 0 && (
                <View style={s.freqBox}>
                  <View style={s.analyseHead}>
                    <Ionicons name="close-circle-outline" size={17} color={DK.red} />
                    <Text style={[s.analyseHeadText, { color: DK.red }]}>Erreur fréquente</Text>
                  </View>
                  <Text style={s.freqText}>{an.priorities[0].notion} — {an.priorities[0].detail}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Actions ── */}
          {hasFlash && (
            <TouchableOpacity
              onPress={() => router.push(`/generate?kind=flashcards&echeanceId=${echeance.id}` as any)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['rgba(120,80,230,0.35)', 'rgba(40,30,90,0.45)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
                style={[s.ctaRow, { borderColor: 'rgba(150,110,255,0.5)' }]}
              >
                <View style={[s.ctaIcon, { backgroundColor: 'rgba(150,110,255,0.2)' }]}>
                  <Ionicons name="albums" size={26} color="#C9A0FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ctaTitle}>Continuer les flashcards</Text>
                  <Text style={s.ctaSub}>
                    {cardsToReview !== null && cardsToReview > 0
                      ? `${cardsToReview} carte${cardsToReview > 1 ? 's' : ''} à revoir  •  ~ ${Math.max(1, Math.ceil(cardsToReview / 3))} min`
                      : 'Mémoriser les notions essentielles'}
                  </Text>
                </View>
                <View style={[s.ctaChevron, { backgroundColor: '#3D7BFF' }]}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {hasControle && (
            <TouchableOpacity
              onPress={() => router.push(`/generate?kind=controle&echeanceId=${echeance.id}` as any)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['rgba(40,90,220,0.35)', 'rgba(15,30,80,0.45)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
                style={[s.ctaRow, { borderColor: 'rgba(90,140,255,0.55)' }]}
              >
                <View style={[s.ctaIcon, { backgroundColor: 'rgba(90,140,255,0.2)' }]}>
                  <Ionicons name="clipboard" size={26} color="#7CB4FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ctaTitle}>Lancer un contrôle blanc</Text>
                  <Text style={s.ctaSub}>
                    {objectifNote !== null ? `Objectif : atteindre ${objectifNote}/20` : 'Première évaluation notée sur 20'}
                  </Text>
                </View>
                <View style={[s.ctaChevron, { backgroundColor: '#3D7BFF' }]}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {linked.length === 0 && (
            <TouchableOpacity
              onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)}
              style={s.warnBox}
              activeOpacity={0.85}
            >
              <Ionicons name="warning" size={18} color={DK.red} />
              <Text style={s.warnText}>Aucune leçon rattachée : rattachez une leçon pour générer flashcards et contrôle blanc.</Text>
            </TouchableOpacity>
          )}

          {/* ── Mode de préparation ── */}
          <Text style={s.sectionLabel}>MODE DE PRÉPARATION</Text>
          {([
            { key: 'controle' as const, on: hasControle, icon: 'clipboard-outline', title: 'Contrôle blanc', sub: 'Évaluer le niveau avec une note sur 20' },
            { key: 'flashcards' as const, on: hasFlash, icon: 'albums-outline', title: 'Flashcards', sub: 'Mémoriser les notions essentielles' },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setMode(opt.key, !opt.on)}
              style={[s.modeRow, opt.on ? s.modeRowOn : s.modeRowOff]}
              activeOpacity={0.85}
            >
              <View style={[s.modeCheck, opt.on && s.modeCheckOn]}>
                {opt.on && <Ionicons name="checkmark" size={15} color="#052A26" />}
              </View>
              <Ionicons name={opt.icon as any} size={21} color={opt.on ? DK.cyan : DK.faint} />
              <View style={{ flex: 1 }}>
                <Text style={[s.modeTitle, !opt.on && { color: DK.faint }]}>{opt.title}</Text>
                <Text style={[s.modeSub, !opt.on && { color: DK.faint }]}>{opt.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={s.modeHint}>Au moins une méthode reste toujours active. Le pourcentage principal est basé sur le contrôle blanc dès qu'il est activé.</Text>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: DK.sub, fontWeight: '600', textAlign: 'center' },
  ghostBtn: {
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingHorizontal: 22, paddingVertical: 11,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 16.5, fontWeight: '700', color: DK.ink, letterSpacing: -0.2 },

  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 13 },
  heroIcon: { width: 86, height: 92, borderRadius: 22 },
  heroTitle: { color: DK.ink, fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
  heroSub: { color: DK.sub, fontSize: 15, fontWeight: '600', marginTop: 3 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 16 },
  jPill: {
    borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 14, paddingHorizontal: 15, paddingVertical: 9,
  },
  jPillText: { color: DK.cyan, fontWeight: '800', fontSize: 13.5 },
  metaPill: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, justifyContent: 'center',
  },
  metaPillText: { color: DK.sub, fontWeight: '700', fontSize: 12.5 },

  mainCard: {
    backgroundColor: 'rgba(19,26,58,0.55)', borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 26, padding: 20, marginBottom: 14,
  },
  mainPct: { color: DK.cyan, fontSize: 74, fontWeight: '900', letterSpacing: -2 },
  mainPctSign: { fontSize: 38, fontWeight: '800' },
  mainLabel: { color: DK.ink, fontSize: 24, fontWeight: '700' },
  mainSubtitle: { color: DK.sub, fontSize: 13, fontWeight: '700', marginTop: 6 },
  mainNonEvalue: { color: DK.sub, fontSize: 34, fontWeight: '900', letterSpacing: -0.6 },
  mainHint: { color: DK.faint, fontSize: 13, fontWeight: '600', marginTop: 8, lineHeight: 19 },
  mainTrack: {
    height: 12, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.15)',
    marginTop: 10, overflow: 'visible',
  },
  mainFill: { height: '100%', borderRadius: 999 },
  mainThumb: {
    position: 'absolute', top: -4, width: 20, height: 20, borderRadius: 999,
    backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 6,
  },

  statsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 24 },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(148,168,255,0.15)', marginHorizontal: 4 },
  statRing: {
    width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
  },
  statRingArc: {
    position: 'absolute', width: 72, height: 72, borderRadius: 999, borderWidth: 3.5,
  },
  statLabel: { color: DK.ink, fontSize: 13.5, fontWeight: '700', marginTop: 9, textAlign: 'center' },
  statValue: { color: DK.cyan, fontSize: 15, fontWeight: '900', marginTop: 3, textAlign: 'center' },

  analyseCard: {
    backgroundColor: 'rgba(19,26,58,0.55)', borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 24, padding: 17, marginBottom: 14,
  },
  analyseTitle: { color: DK.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 13 },
  analyseCols: { flexDirection: 'row', gap: 12 },
  analyseDivider: { width: 1, backgroundColor: 'rgba(148,168,255,0.15)' },
  analyseHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  analyseHeadText: { fontSize: 13.5, fontWeight: '800' },
  analyseItem: { color: 'rgba(230,236,255,0.85)', fontSize: 12.5, fontWeight: '600', lineHeight: 21 },
  freqBox: { marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(148,168,255,0.12)' },
  freqText: { color: 'rgba(230,236,255,0.85)', fontSize: 12.5, fontWeight: '600', lineHeight: 19 },

  ctaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    borderWidth: 1.2, borderRadius: 22, padding: 15, marginBottom: 12,
  },
  ctaIcon: {
    width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: DK.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  ctaSub: { color: DK.sub, fontSize: 13, fontWeight: '600', marginTop: 3 },
  ctaChevron: {
    width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
  },

  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(255,107,90,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
    borderRadius: 18, padding: 13, marginBottom: 12,
  },
  warnText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: DK.red, lineHeight: 18 },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: 'rgba(200,210,255,0.55)',
    letterSpacing: 2, marginTop: 14, marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: 20, padding: 15, marginBottom: 10,
  },
  modeRowOn: { borderColor: 'rgba(53,228,210,0.55)', backgroundColor: 'rgba(53,228,210,0.06)' },
  modeRowOff: { borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.4)' },
  modeCheck: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  modeCheckOn: { backgroundColor: DK.cyan, borderColor: DK.cyan },
  modeTitle: { color: DK.ink, fontSize: 15.5, fontWeight: '800' },
  modeSub: { color: DK.sub, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  modeHint: { color: DK.faint, fontSize: 11.5, fontWeight: '600', lineHeight: 17, marginTop: 2 },
});
