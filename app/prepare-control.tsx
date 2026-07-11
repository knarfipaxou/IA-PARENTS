import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { loadExamResults, analyzeExams, type ExamResult } from '../lib/examResults';

function noteColor(note: number) {
  return note >= 14 ? DK.green : note >= 10 ? DK.gold : DK.red;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getDate()} ${mois[d.getMonth()]}`;
}
function relDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days} jours`;
  return fmtDate(iso);
}

export default function PrepareControl() {
  const router = useRouter();
  const { child } = useChild();
  const [results, setResults] = useState<ExamResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (child) loadExamResults(child.id).then(setResults);
    }, [child?.id])
  );
  const an = analyzeExams(results);
  const last = an.last;

  const OPTIONS = [
    {
      img: DK_ICONS.scan,
      glow: DK.green,
      border: 'rgba(52,214,150,0.45)',
      title: 'Par photo',
      sub: "Photo de l'énoncé ou du sujet",
      route: '/scan',
    },
    {
      img: DK_ICONS.pencil,
      glow: DK.blue,
      border: 'rgba(90,140,255,0.45)',
      title: 'Manuel',
      sub: 'Date, matière et notions',
      route: '/manual-deadline',
    },
  ];

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={s.headRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Préparer un contrôle</Text>
              <Text style={s.sub}>Pour {child ? child.name : "l'enfant"} • choisissez le mode</Text>
            </View>
            <Image source={DK_ICONS.trophy} style={s.headIcon} />
          </View>

          {/* ═════ TABLEAU DE BORD DE PROGRESSION ═════ */}
          {last && (
            <>
              <Text style={s.sectionLabel}>DERNIER RÉSULTAT</Text>
              <LinearGradient
                colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.dashCard}
              >
                {/* note + contexte */}
                <View style={s.dashHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dashMatiere}>{last.matiere}</Text>
                    <Text style={s.dashDate}>Fait le {new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                    {an.delta !== undefined && an.delta !== 0 && (
                      <View style={[s.deltaPill, { borderColor: an.delta > 0 ? 'rgba(52,214,150,0.55)' : 'rgba(255,107,90,0.55)' }]}>
                        <Ionicons name={an.delta > 0 ? 'trending-up' : 'trending-down'} size={13} color={an.delta > 0 ? DK.green : DK.red} />
                        <Text style={{ color: an.delta > 0 ? DK.green : DK.red, fontWeight: '800', fontSize: 12.5 }}>
                          {an.delta > 0 ? '+' : ''}{an.delta} point{Math.abs(an.delta) > 1 ? 's' : ''} depuis le dernier contrôle
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[s.noteHuge, { color: noteColor(last.note) }]}>{last.note}<Text style={s.noteSur}> /20</Text></Text>
                  </View>
                </View>

                {/* jauge de maîtrise */}
                <View style={s.gaugeTrack}>
                  <LinearGradient
                    colors={last.note >= 12 ? ['#1FB8A8', DK.green] : last.note >= 8 ? ['#D9930F', DK.gold] : ['#D9452F', DK.red]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.gaugeFill, { width: `${Math.max(4, an.gaugePct)}%` }]}
                  />
                </View>
                <View style={s.gaugeRow}>
                  <Text style={s.gaugeText}>{an.gaugePct} % de maîtrise</Text>
                  <Text style={[s.gaugeTier, { color: noteColor(last.note) }]}>{an.gaugeLabel}</Text>
                </View>
                {!!an.motivation && <Text style={s.motivation}>{an.motivation}</Text>}
              </LinearGradient>

              {/* trois derniers résultats */}
              {an.last3.length > 1 && (
                <>
                  <Text style={s.sectionLabel}>DERNIERS RÉSULTATS</Text>
                  <View style={s.last3Row}>
                    {an.last3.map((r, i) => (
                      <View key={r.id} style={[s.last3Card, i === 0 && s.last3CardBig]}>
                        <Text style={[s.last3Note, { color: noteColor(r.note) }, i === 0 && { fontSize: 26 }]}>{r.note}/20</Text>
                        <Text style={s.last3Date}>{relDate(r.date)}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* points à améliorer */}
              {an.priorities.length > 0 && (
                <>
                  <Text style={s.sectionLabel}>POINTS À AMÉLIORER</Text>
                  <View style={{ gap: 9 }}>
                    {an.priorities.map((p, i) => (
                      <View key={p.notion} style={s.prioRow}>
                        <View style={[s.prioNum, i === 0 && { backgroundColor: 'rgba(255,107,90,0.18)', borderColor: 'rgba(255,107,90,0.55)' }]}>
                          <Text style={[s.prioNumText, i === 0 && { color: DK.red }]}>{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.prioTitle}>
                            <Text style={{ color: i === 0 ? DK.red : DK.gold }}>{p.label} : </Text>{p.notion}
                          </Text>
                          <Text style={s.prioDetail}>{p.detail}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* en amélioration */}
              {an.improvements.length > 0 && (
                <>
                  <Text style={s.sectionLabel}>EN AMÉLIORATION</Text>
                  <View style={{ gap: 9 }}>
                    {an.improvements.map((im) => (
                      <View key={im.notion} style={[s.prioRow, { borderColor: 'rgba(52,214,150,0.35)' }]}>
                        <Ionicons name="trending-up" size={18} color={DK.green} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.prioTitle}><Text style={{ color: DK.green }}>{im.notion}</Text></Text>
                          <Text style={s.prioDetail}>{im.detail}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* objectif */}
              {!!an.objectif && (
                <LinearGradient
                  colors={['rgba(53,228,210,0.12)', 'rgba(148,168,255,0.06)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.objectifBox}
                >
                  <Text style={s.objectifLabel}>OBJECTIF DU PROCHAIN CONTRÔLE</Text>
                  <Text style={s.objectifText}>{an.objectif}</Text>
                </LinearGradient>
              )}
            </>
          )}

          <Text style={s.sectionLabel}>COMMENT AJOUTER L'ÉCHÉANCE ?</Text>

          <View style={s.optionsList}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.route}
                onPress={() => router.push(opt.route as any)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[s.optionRow, { borderColor: opt.border }]}
                >
                  <Image source={opt.img} style={[s.optionIcon, { shadowColor: opt.glow }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.optionTitle}>{opt.title}</Text>
                    <Text style={s.optionSub}>{opt.sub}</Text>
                  </View>
                  <View style={[s.chevron, { borderColor: opt.border }]}>
                    <Ionicons name="chevron-forward" size={14} color={DK.ink} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info plan de révision */}
          <LinearGradient
            colors={['rgba(53,228,210,0.1)', 'rgba(148,168,255,0.05)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.infoBox}
          >
            <Ionicons name="information-circle-outline" size={19} color={DK.cyan} />
            <Text style={s.infoText}>
              L'échéance sera rattachée à {child ? child.name : 'cet enfant'} et déclenchera un plan de révision
              du type <Text style={{ color: DK.cyan, fontWeight: '800' }}>J-8 → Jour J</Text> : fiche, QCM,
              flashcards ciblées, contrôle blanc, relecture le matin du jour J.
            </Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 8 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  headIcon: {
    width: 44, height: 44,
    shadowColor: DK.violet, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
  },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)',
    marginTop: 14, marginBottom: 10, marginLeft: 4,
  },

  optionsList: { gap: 12 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 22, padding: 16,
  },
  optionIcon: {
    width: 54, height: 54,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 13,
  },
  optionTitle: { fontWeight: '800', fontSize: 16.5, color: DK.ink, letterSpacing: -0.3 },
  optionSub: { fontSize: 13, color: DK.sub, fontWeight: '500', marginTop: 2 },
  chevron: {
    width: 28, height: 28, borderRadius: 999, borderWidth: 1,
    backgroundColor: 'rgba(10,14,34,0.45)', alignItems: 'center', justifyContent: 'center',
  },

  dashCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16 },
  dashHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  dashMatiere: { fontSize: 17, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  dashDate: { fontSize: 12.5, fontWeight: '600', color: DK.sub, marginTop: 3 },
  deltaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1.2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginTop: 9,
  },
  noteHuge: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  noteSur: { fontSize: 15, fontWeight: '700', color: DK.sub },
  gaugeTrack: { height: 11, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 14 },
  gaugeFill: { height: '100%', borderRadius: 999 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  gaugeText: { fontSize: 13, fontWeight: '700', color: DK.ink },
  gaugeTier: { fontSize: 13, fontWeight: '800' },
  motivation: { fontSize: 13, fontWeight: '700', color: DK.cyan, marginTop: 10, lineHeight: 19 },
  last3Row: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  last3Card: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, paddingVertical: 13,
  },
  last3CardBig: {
    flex: 1.35, borderColor: 'rgba(53,228,210,0.45)', backgroundColor: 'rgba(53,228,210,0.07)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10,
  },
  last3Note: { fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  last3Date: { fontSize: 11, fontWeight: '600', color: DK.sub, marginTop: 4 },
  prioRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 11,
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, padding: 13,
  },
  prioNum: {
    width: 24, height: 24, borderRadius: 999, borderWidth: 1.2,
    borderColor: 'rgba(245,194,75,0.55)', backgroundColor: 'rgba(245,194,75,0.14)',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  prioNumText: { fontSize: 12.5, fontWeight: '900', color: DK.gold },
  prioTitle: { fontSize: 14, fontWeight: '800', color: DK.ink, lineHeight: 20 },
  prioDetail: { fontSize: 12.5, fontWeight: '500', color: DK.sub, lineHeight: 18, marginTop: 3 },
  objectifBox: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)', borderRadius: 20, padding: 15, marginTop: 16,
  },
  objectifLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2, color: DK.cyan },
  objectifText: { fontSize: 14.5, fontWeight: '700', color: DK.ink, lineHeight: 21, marginTop: 6 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, padding: 14, marginTop: 18,
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: '600', color: DK.sub, lineHeight: 20 },
});
