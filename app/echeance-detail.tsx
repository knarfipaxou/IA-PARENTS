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
import { effectiveDays } from '../lib/deadlines';
import {
  MISSION_DEFS, loadMasteryPath, missionsValidated, currentMission, bestPct,
  type MasteryPath,
} from '../lib/masteryPath';
import { progressColor, progressGradient } from '../lib/progressColor';
import { subjectIcon } from '../lib/subjectIcons';

export default function EcheanceDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { child, lessons } = useChild();

  const echeance = id
    ? child?.echeances?.find((e) => e.id === id)
    : child?.echeances?.[0];

  const [exams, setExams] = useState<ExamResult[]>([]);
  const [path, setPath] = useState<MasteryPath>({ missions: {} });

  useFocusEffect(
    useCallback(() => {
      if (!child || !echeance) return;
      loadExamResults(child.id).then((all) => {
        const byEch = all.filter((r) => r.echeanceId === echeance.id);
        setExams(byEch.length > 0 ? byEch : all.filter((r) => (r.matiere ?? '').toLowerCase() === echeance.subj.toLowerCase()));
      });
      loadMasteryPath(`${child.id}:${echeance.id}`).then(setPath);
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

  const linked = lessons.filter((l) => (echeance.lessonIds ?? []).includes(l.id));

  const an = analyzeExams(exams);
  const lastNote = an.last?.note ?? null;
  const lastDate = an.last ? an.last.date.slice(0, 10).split('-').reverse().join('/') : null;

  // pourcentage principal de préparation : UNIQUEMENT le devoir blanc complet
  const mainPct = lastNote === null ? null : Math.round((lastNote / 20) * 100);
  const deltaPct = an.delta !== undefined ? Math.round((an.delta / 20) * 100) : null;
  const objectifNote = lastNote !== null ? Math.min(20, lastNote + 1) : null;

  // parcours de maîtrise
  const validated = missionsValidated(path);
  const current = currentMission(path);
  const currentDef = current ? MISSION_DEFS[current] : null;
  const currentBest = current ? bestPct(path, current) : null;
  const parcoursStarted = validated > 0 || Object.keys(path.missions).length > 0;

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
              <Text style={s.jPillText}>{(() => {
                const d = effectiveDays(echeance);
                return d <= 0 ? 'Auj.' : `J-${d}`;
              })()}</Text>
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

          {/* ── Niveau de préparation (basé sur le devoir blanc uniquement) ── */}
          <View style={s.mainCard}>
            {mainPct === null ? (
              <>
                <Text style={s.mainNonEvalue}>Non évalué</Text>
                <Text style={s.mainHint}>
                  Génère un premier devoir blanc complet pour mesurer le niveau de préparation.
                </Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
                  <Text style={[s.mainPct, { color: progressColor(mainPct) }]}>{mainPct}<Text style={s.mainPctSign}> %</Text></Text>
                  <Text style={s.mainLabel}>Prêt</Text>
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
                <Text style={s.mainSubtitle}>
                  Dernier devoir blanc : {lastNote}/20{lastDate ? ` · ${lastDate}` : ''}
                  {deltaPct !== null && deltaPct !== 0 ? `  ·  ${deltaPct > 0 ? '+' : ''}${deltaPct} %` : ''}
                </Text>
              </>
            )}
          </View>

          {/* ── Analyse rapide ── */}
          {an.last && (
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

          {/* ── 1. Parcours de maîtrise ── */}
          <TouchableOpacity
            onPress={() => router.push(`/parcours?echeanceId=${echeance.id}` as any)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['rgba(120,80,230,0.35)', 'rgba(40,30,90,0.45)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
              style={[s.ctaCard, { borderColor: 'rgba(150,110,255,0.5)' }]}
            >
              <View style={s.ctaHead}>
                <View style={[s.ctaIcon, { backgroundColor: 'rgba(150,110,255,0.2)' }]}>
                  <Ionicons name="map" size={26} color="#C9A0FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ctaTitle}>Parcours de maîtrise</Text>
                  <Text style={s.ctaSub}>{validated}/4 missions validées</Text>
                </View>
                <View style={[s.ctaChevron, { backgroundColor: '#3D7BFF' }]}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </View>
              <View style={s.ctaDetail}>
                {currentDef ? (
                  <Text style={s.ctaDetailText}>
                    Mission actuelle : <Text style={{ color: '#C9A0FF', fontWeight: '800' }}>{currentDef.title}</Text>
                    {currentBest !== null ? ` · dernier score ${currentBest} %` : ''}
                  </Text>
                ) : validated === 4 ? (
                  <Text style={[s.ctaDetailText, { color: DK.green }]}>Toutes les missions sont maîtrisées ! 🎉</Text>
                ) : (
                  <Text style={s.ctaDetailText}>4 missions : Mémoire → Compréhension → Application → Défi final</Text>
                )}
              </View>
              <View style={s.miniBtn}>
                <Text style={s.miniBtnText}>{parcoursStarted ? 'Continuer le parcours' : 'Commencer le parcours'}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── 2. Devoir blanc complet ── */}
          <TouchableOpacity
            onPress={() => router.push(`/generate?kind=controle&echeanceId=${echeance.id}` as any)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['rgba(40,90,220,0.35)', 'rgba(15,30,80,0.45)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
              style={[s.ctaCard, { borderColor: 'rgba(90,140,255,0.55)' }]}
            >
              <View style={s.ctaHead}>
                <View style={[s.ctaIcon, { backgroundColor: 'rgba(90,140,255,0.2)' }]}>
                  <Ionicons name="clipboard" size={26} color="#7CB4FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ctaTitle}>Devoir blanc complet</Text>
                  <Text style={s.ctaSub}>
                    {lastNote !== null ? `Dernier devoir blanc : ${lastNote}/20${lastDate ? ` · ${lastDate}` : ''}` : 'Évaluation notée sur 20, imprimable'}
                  </Text>
                </View>
                <View style={[s.ctaChevron, { backgroundColor: '#3D7BFF' }]}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </View>
              <View style={s.ctaDetail}>
                <Text style={s.ctaDetailText}>
                  {objectifNote !== null
                    ? `Objectif : atteindre ${objectifNote}/20. Mélange les 4 dimensions de la leçon.`
                    : 'Mélange mémoire, compréhension, application et défi. Le % de préparation est basé sur ce devoir.'}
                </Text>
              </View>
              <View style={s.miniBtn}>
                <Text style={s.miniBtnText}>{lastNote !== null ? 'Refaire le devoir blanc' : 'Générer un devoir blanc complet'}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {linked.length === 0 && (
            <TouchableOpacity
              onPress={() => router.push(`/link-lessons?echeanceId=${echeance.id}` as any)}
              style={s.warnBox}
              activeOpacity={0.85}
            >
              <Ionicons name="warning" size={18} color={DK.red} />
              <Text style={s.warnText}>Aucune leçon rattachée : rattachez une leçon pour lancer le parcours de maîtrise et le devoir blanc.</Text>
            </TouchableOpacity>
          )}

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
  mainSubtitle: { color: DK.sub, fontSize: 13, fontWeight: '700', marginTop: 12 },
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

  ctaCard: { borderWidth: 1.2, borderRadius: 22, padding: 15, marginBottom: 12 },
  ctaHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  ctaIcon: {
    width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: DK.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  ctaSub: { color: DK.sub, fontSize: 13, fontWeight: '600', marginTop: 3 },
  ctaChevron: {
    width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
  },
  ctaDetail: { marginTop: 11 },
  ctaDetailText: { color: 'rgba(230,236,255,0.8)', fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
  miniBtn: {
    borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 999, paddingVertical: 10, alignItems: 'center', marginTop: 12,
  },
  miniBtnText: { color: DK.cyan, fontSize: 13.5, fontWeight: '800' },

  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(255,107,90,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
    borderRadius: 18, padding: 13, marginBottom: 12,
  },
  warnText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: DK.red, lineHeight: 18 },
});
