import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { ProgressRing, ProgressBar } from '../components/ui/Progress';
import { TopBar } from '../components/ui/TopBar';

const RANGES = ['Semaine', 'Mois', 'Trimestre'];
const BARS = [40, 65, 55, 80, 70, 90, 60];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MATIERES = [
  { s: 'Mathématiques', v: 78, a: 'green' as const, icon: 'calculator-outline' },
  { s: 'Français', v: 64, a: 'violet' as const, icon: 'book-outline' },
  { s: 'Sciences', v: 71, a: 'coral' as const, icon: 'flask-outline' },
];

export default function ProgressScreen() {
  const router = useRouter();
  const [range, setRange] = useState('Semaine');

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />
        <View style={s.header}>
          <Text style={s.title}>Suivi de Maxime</Text>
          <Text style={s.sub}>Progression et points clés.</Text>
        </View>

        {/* Segment */}
        <View style={s.seg}>
          {RANGES.map(r => (
            <TouchableOpacity key={r} onPress={() => setRange(r)} style={[s.segBtn, range === r && s.segBtnActive]}>
              <Text style={[s.segText, range === r && { color: T.ink }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Global progress */}
        <Card pad={18} style={s.globalCard}>
          <ProgressRing value={72} size={72} sw={8}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: T.ink }}>72%</Text>
          </ProgressRing>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.globalTitle}>Progression globale</Text>
            <View style={s.trendRow}>
              <Ionicons name="trending-up" size={17} color={T.primaryDeep} />
              <Text style={s.trendText}>+12% cette {range.toLowerCase()}</Text>
            </View>
          </View>
        </Card>

        {/* Chart */}
        <Card pad={18} style={{ marginTop: 13 }}>
          <Text style={s.chartTitle}>Temps de révision</Text>
          <View style={s.chart}>
            {BARS.map((b, i) => (
              <View key={i} style={s.chartBar}>
                <View style={s.chartBarInner}>
                  <View style={[s.chartBarFill, { height: `${(b / 100) * 100}%`, backgroundColor: i === 5 ? T.primary : T.primarySoft }]} />
                </View>
                <Text style={s.chartDay}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Points forts / à améliorer */}
        <View style={s.highlightRow}>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle accentKey="green" icon={<Ionicons name="trending-up" size={20} color={T.green.fg} />} size={38} r={12} />
            <Text style={s.highlightLabel}>POINT FORT</Text>
            <Text style={s.highlightValue}>Calcul mental</Text>
          </Card>
          <Card pad={15} style={{ flex: 1 }}>
            <Squircle accentKey="coral" icon={<Ionicons name="trophy-outline" size={20} color={T.coral.fg} />} size={38} r={12} />
            <Text style={s.highlightLabel}>À AMÉLIORER</Text>
            <Text style={s.highlightValue}>Problèmes</Text>
          </Card>
        </View>

        <Text style={s.sectionLabel}>MATIÈRES SUIVIES</Text>
        <Card pad={8}>
          {MATIERES.map((m, i) => (
            <View key={m.s} style={[s.matiereRow, i < MATIERES.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.line }]}>
              <Squircle accentKey={m.a} icon={<Ionicons name={m.icon as any} size={20} color={T[m.a].fg} />} size={38} r={12} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={s.matiereHeader}>
                  <Text style={s.matiereName}>{m.s}</Text>
                  <Text style={[s.matiereScore, { color: T[m.a].fg }]}>{m.v}%</Text>
                </View>
                <ProgressBar value={m.v} color={T[m.a].solid} h={7} />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  header: { marginTop: 14 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 6, fontWeight: '500', marginBottom: 14 },
  seg: { flexDirection: 'row', backgroundColor: T.surfaceAlt, borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center' },
  segBtnActive: { backgroundColor: T.surface, shadowColor: '#102818', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  segText: { fontWeight: '700', fontSize: 13.5, letterSpacing: -0.2, color: T.sub },
  globalCard: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  globalTitle: { fontSize: 15.5, fontWeight: '800', color: T.ink },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  trendText: { color: T.primaryDeep, fontWeight: '700', fontSize: 13.5 },
  chartTitle: { fontSize: 15.5, fontWeight: '800', color: T.ink, marginBottom: 14 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 110 },
  chartBar: { flex: 1, alignItems: 'center', gap: 8 },
  chartBarInner: { width: '100%', height: 90, justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderRadius: 7 },
  chartDay: { fontSize: 11.5, fontWeight: '700', color: T.faint },
  highlightRow: { flexDirection: 'row', gap: 11, marginTop: 13 },
  highlightLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 10 },
  highlightValue: { fontSize: 15, fontWeight: '800', color: T.ink, marginTop: 2, letterSpacing: -0.2 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginLeft: 2, marginTop: 20, marginBottom: 11 },
  matiereRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  matiereHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  matiereName: { fontSize: 14.5, fontWeight: '700', color: T.ink },
  matiereScore: { fontSize: 13.5, fontWeight: '800' },
});
