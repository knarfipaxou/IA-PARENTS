import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { FONT } from '../../constants/handoff';
import { useChild } from '../../contexts/ChildContext';
import { isControle } from '../../lib/matiere';
import { useScheme } from '../../lib/useScheme';
import { loadExamResults, type ExamResult } from '../../lib/examResults';
import { masteryForSubject, upcomingDeadlines } from '../../lib/deadlines';
import { DeadlineCard } from '../../components/DeadlineCard';

export default function EcheancesScreen() {
  const router = useRouter();
  const { child, lessons } = useChild();
  const lessonTitlesFor = (ids?: string[]) =>
    (ids ?? []).map((id) => lessons.find((l) => l.id === id)?.titre).filter((t): t is string => !!t);
  const scheme = useScheme();
  // uniquement les échéances à venir (dépassées exclues), jours recalculés,
  // triées de la plus proche à la plus lointaine
  const echeances = upcomingDeadlines(child?.echeances ?? []);

  const [exams, setExams] = useState<ExamResult[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (child) loadExamResults(child.id).then(setExams);
    }, [child?.id])
  );
  // maîtrise (dernier devoir blanc) par matière ; null = non évalué
  const masteryFor = (subj: string) => masteryForSubject(exams, subj);

  return (
    <LinearGradient colors={scheme === 'light' ? ['#F3F5FA', '#EEF1F8'] : [DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.titleRowTop}>
            <View style={{ flex: 1 }}>
              <Text style={[s.title, scheme === 'light' && { color: '#1B2559' }]}>Échéances</Text>
              <Text style={[s.sub, scheme === 'light' && { color: '#6B7699' }]}>
                {child ? 'Tous tes contrôles et devoirs à venir' : 'Aucun enfant sélectionné'}
              </Text>
            </View>
            {child && (
              <TouchableOpacity
                onPress={() => router.push('/manual-deadline' as any)}
                style={[s.addBtn, scheme === 'light' && { backgroundColor: '#12B886' }]}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={26} color={scheme === 'light' ? '#fff' : '#052A26'} />
              </TouchableOpacity>
            )}
          </View>
          {child && (
            <Text style={[s.count, scheme === 'light' && { color: '#6B7699' }]}>
              {echeances.length} {echeances.length > 1 ? 'évaluations à venir' : 'évaluation à venir'} pour {child.name}
            </Text>
          )}

          {child && (
            <View style={s.addRowWrap}>
              <TouchableOpacity onPress={() => router.push('/manual-deadline' as any)} style={s.addRow} activeOpacity={0.85}>
                <Ionicons name="create-outline" size={18} color={DK.cyan} />
                <Text style={s.addRowText}>Ajouter manuellement</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/scan-agenda' as any)} style={s.addRow} activeOpacity={0.85}>
                <Ionicons name="camera-outline" size={18} color={DK.cyan} />
                <Text style={s.addRowText}>Scanner l'agenda</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.list}>
            {echeances.map((it) => {
              const nb = (it.lessonIds ?? []).length;
              const noLesson = isControle(it.type) && nb === 0;
              return (
                <TouchableOpacity
                  key={it.id}
                  onPress={() => router.push(`/echeance-detail?id=${it.id}` as any)}
                  activeOpacity={0.88}
                >
                  <DeadlineCard e={it} mastery={masteryFor(it.subj)} scheme={scheme} noLesson={noLesson} lessonTitles={lessonTitlesFor(it.lessonIds)} />
                </TouchableOpacity>
              );
            })}

            {echeances.length === 0 && child && (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={42} color={DK.faint} />
                <Text style={s.emptyText}>Aucune échéance enregistrée.</Text>
                <Text style={s.emptySub}>Scanne l'agenda ou ajoute une échéance manuellement.</Text>
              </View>
            )}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  titleRowTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  title: { fontFamily: FONT.num, fontSize: 26, color: DK.ink, letterSpacing: -0.4 },
  sub: { fontFamily: FONT.body, fontSize: 14, color: DK.sub, marginTop: 4 },
  count: { fontFamily: FONT.body, fontSize: 13, color: DK.faint, marginTop: 6, marginBottom: 4 },
  addBtn: {
    width: 48, height: 48, borderRadius: 999, backgroundColor: DK.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 5,
  },
  addRowWrap: { flexDirection: 'row', gap: 10, marginTop: 12 },
  addRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.4)', borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 13,
  },
  addRowText: { color: DK.cyan, fontSize: 13.5, fontFamily: FONT.bodyBold },
  list: { gap: 12, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  rowIcon: { width: 56, height: 60, borderRadius: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { flex: 1, fontSize: 15.5, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  typeChip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  typeChipControle: { backgroundColor: 'rgba(139,124,246,0.16)' },
  typeChipDevoir: { backgroundColor: 'rgba(255,141,184,0.16)' },
  typeChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  rowSub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  statusText: { fontSize: 12, fontWeight: '700' },
  urgChip: {
    backgroundColor: 'rgba(255,107,90,0.16)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.5)',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
  },
  urgText: { fontSize: 10.5, fontWeight: '800', color: DK.red },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  warnText: { fontSize: 11.5, fontWeight: '800', color: DK.red },
  jPill: {
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8,
  },
  jPillText: { color: DK.cyan, fontWeight: '900', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 9 },
  emptyText: { fontFamily: FONT.num, fontSize: 15, color: DK.sub },
  emptySub: { fontFamily: FONT.body, fontSize: 12.5, color: DK.faint, textAlign: 'center' },
});
