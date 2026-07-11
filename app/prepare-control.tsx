import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { loadExamResults, type ExamResult } from '../lib/examResults';

function noteColor(note: number) {
  return note >= 14 ? DK.green : note >= 10 ? DK.gold : DK.red;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
  const last = results[0];

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

          {/* ===== Tableau de bord des contrôles blancs ===== */}
          {last && (
            <>
              <Text style={s.sectionLabel}>RÉSULTATS DES CONTRÔLES BLANCS</Text>
              <LinearGradient
                colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.dashCard}
              >
                <View style={s.dashHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dashKicker}>DERNIER CONTRÔLE • {fmtDate(last.date)}</Text>
                    <Text style={s.dashTitle} numberOfLines={2}>{last.titre}</Text>
                    <Text style={s.dashMeta}>{last.matiere} · {last.totalOk}/{last.totalMax} points</Text>
                  </View>
                  <View style={[s.noteCircle, { borderColor: noteColor(last.note) }]}>
                    <Text style={[s.noteBig, { color: noteColor(last.note) }]}>{last.note}</Text>
                    <Text style={s.noteSur}>/20</Text>
                  </View>
                </View>
                {last.acquis.length > 0 && (
                  <View style={s.dashBlock}>
                    <Text style={[s.dashLabel, { color: DK.green }]}>✅ ACQUIS</Text>
                    <Text style={s.dashText}>{last.acquis.join(' · ')}</Text>
                  </View>
                )}
                {last.aRenforcer.length > 0 && (
                  <View style={s.dashBlock}>
                    <Text style={[s.dashLabel, { color: DK.gold }]}>🔶 À RENFORCER</Text>
                    <Text style={s.dashText}>{last.aRenforcer.join(' · ')}</Text>
                  </View>
                )}
              </LinearGradient>

              {results.length > 1 && (
                <View style={s.histList}>
                  {results.slice(1, 5).map((r) => (
                    <View key={r.id} style={s.histRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.histTitle} numberOfLines={1}>{r.titre}</Text>
                        <Text style={s.histMeta}>{r.matiere} · {fmtDate(r.date)}</Text>
                      </View>
                      <Text style={[s.histNote, { color: noteColor(r.note) }]}>{r.note}/20</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

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
  dashHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dashKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, color: DK.sub },
  dashTitle: { fontSize: 16.5, fontWeight: '800', color: DK.ink, letterSpacing: -0.3, marginTop: 4, lineHeight: 22 },
  dashMeta: { fontSize: 12.5, fontWeight: '600', color: DK.sub, marginTop: 3 },
  noteCircle: {
    width: 74, height: 74, borderRadius: 999, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  noteBig: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  noteSur: { fontSize: 11, fontWeight: '700', color: DK.sub, marginTop: -2 },
  dashBlock: { marginTop: 12 },
  dashLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  dashText: { fontSize: 13, color: 'rgba(230,236,255,0.9)', fontWeight: '600', lineHeight: 19, marginTop: 4 },
  histList: { gap: 8, marginTop: 10 },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11,
  },
  histTitle: { fontSize: 13.5, fontWeight: '700', color: DK.ink },
  histMeta: { fontSize: 11.5, fontWeight: '600', color: DK.sub, marginTop: 2 },
  histNote: { fontSize: 15.5, fontWeight: '900' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, padding: 14, marginTop: 18,
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: '600', color: DK.sub, lineHeight: 20 },
});
