import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { useChild } from '../../contexts/ChildContext';
import { isControle } from '../../lib/matiere';
import { useScheme } from '../../lib/useScheme';
import { subjectIcon } from '../../lib/subjectIcons';
import { loadExamResults, type ExamResult } from '../../lib/examResults';
import { AlertPulse } from '../../components/AlertPulse';

export default function EcheancesScreen() {
  const router = useRouter();
  const { child } = useChild();
  const scheme = useScheme();
  const echeances = child?.echeances ?? [];

  const [exams, setExams] = useState<ExamResult[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (child) loadExamResults(child.id).then(setExams);
    }, [child?.id])
  );
  // maîtrise (dernier contrôle blanc) par matière → % ; null = non évalué
  function masteryPctFor(subj: string): number | null {
    const r = exams.find((x) => (x.matiere ?? '').toLowerCase() === subj.toLowerCase());
    return r ? Math.round((r.note / 20) * 100) : null;
  }

  return (
    <LinearGradient colors={scheme === 'light' ? ['#F3F5FA', '#EEF1F8'] : [DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={[s.title, scheme === 'light' && { color: '#1B2559' }]}>Échéances</Text>
          <Text style={[s.sub, scheme === 'light' && { color: '#6B7699' }]}>
            {child ? 'Tous tes contrôles et devoirs à venir' : 'Aucun enfant sélectionné'}
          </Text>
          {child && (
            <Text style={[s.count, scheme === 'light' && { color: '#6B7699' }]}>
              {echeances.length} {echeances.length > 1 ? 'évaluations à venir' : 'évaluation à venir'} pour {child.name}
            </Text>
          )}

          <View style={s.list}>
            {echeances.map((it) => {
              const nb = (it.lessonIds ?? []).length;
              const noLesson = isControle(it.type) && nb === 0;
              const pct = masteryPctFor(it.subj);
              // état d'alerte : non évalué OU maîtrise < 80 %
              const alert = pct === null || pct < 80;
              const neutral = {
                borderWidth: 1, borderColor: DK.cardBorder,
                backgroundColor: scheme === 'light' ? '#FFFFFF' : 'rgba(47,60,112,0.4)',
              };
              return (
                <TouchableOpacity
                  key={it.id}
                  onPress={() => router.push(`/echeance-detail?id=${it.id}` as any)}
                  activeOpacity={0.88}
                >
                  <AlertPulse active={alert} scheme={scheme} neutralStyle={neutral}>
                    <View style={s.row}>
                      <Image source={subjectIcon(it.subj, scheme)} style={s.rowIcon} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={s.titleRow}>
                          <Text style={[s.rowTitle, scheme === 'light' && { color: '#1B2559' }]} numberOfLines={1}>
                            {it.type} de {it.subj}
                          </Text>
                          <View style={[s.typeChip, isControle(it.type) ? s.typeChipControle : s.typeChipDevoir]}>
                            <Text style={[s.typeChipText, { color: isControle(it.type) ? '#C9A0FF' : '#FF8DB8' }]}>
                              {it.type.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={[s.rowSub, scheme === 'light' && { color: '#6B7699' }]}>
                          {it.date} • {nb} {nb > 1 ? 'leçons liées' : 'leçon liée'}
                        </Text>
                        {/* niveau de préparation */}
                        <View style={s.statusRow}>
                          {alert ? (
                            <>
                              <Ionicons name="alert-circle" size={13} color={scheme === 'light' ? '#D6353A' : '#FF6B6B'} />
                              <Text style={[s.statusText, { color: scheme === 'light' ? '#D6353A' : '#FF8A80' }]}>
                                {pct === null ? 'À préparer — non évalué' : `À renforcer — ${pct} % prêt`}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="checkmark-circle" size={13} color={DK.green} />
                              <Text style={[s.statusText, { color: DK.green }]}>Prêt — {pct} %</Text>
                            </>
                          )}
                          {it.urg && (
                            <View style={s.urgChip}><Text style={s.urgText}>Urgent</Text></View>
                          )}
                        </View>
                        {noLesson && (
                          <View style={s.warnRow}>
                            <Ionicons name="warning" size={12} color={DK.red} />
                            <Text style={s.warnText}>Aucune leçon rattachée</Text>
                          </View>
                        )}
                      </View>
                      <View style={s.jPill}>
                        <Text style={s.jPillText}>{it.days === 0 ? 'Auj.' : `J-${it.days}`}</Text>
                      </View>
                    </View>
                  </AlertPulse>
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
  title: { fontSize: 26, fontWeight: '900', color: DK.ink, letterSpacing: -0.6, marginTop: 6 },
  sub: { fontSize: 14, color: DK.sub, fontWeight: '600', marginTop: 4 },
  count: { fontSize: 13, color: DK.faint, fontWeight: '600', marginTop: 6, marginBottom: 4 },
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
  emptyText: { fontSize: 15, fontWeight: '700', color: DK.sub },
  emptySub: { fontSize: 12.5, color: DK.faint, fontWeight: '500', textAlign: 'center' },
});
