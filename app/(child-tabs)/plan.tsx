import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { Btn, GhostBtn } from '../../components/ui/Btn';
import { useChild } from '../../contexts/ChildContext';

const MISSIONS = [
  { id: 1, d: 'J-5', label: 'Relire la leçon', min: 10, done: true },
  { id: 2, d: 'J-4', label: 'Exercices guidés', min: 15, done: true },
  { id: 3, d: 'J-3', label: "Problèmes d'application", min: 15, done: false },
  { id: 4, d: 'J-2', label: 'Contrôle blanc', min: 20, done: false },
  { id: 5, d: 'J-1', label: 'Révision finale', min: 10, done: false },
];

export default function PlanScreen() {
  const router = useRouter();
  const { child } = useChild();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Planning</Text>
        {child && <Text style={s.sub}>Plan de révision pour {child.name}</Text>}

        <View style={s.planHero}>
          <Squircle
            accentKey="green"
            size={48}
            icon={<Ionicons name="calculator-outline" size={24} color={T.green.fg} />}
            style={{ marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.planHeroTitle}>Contrôle de Maths</Text>
            <Text style={s.planHeroSub}>Jeudi 24 avril · 5 missions · 70 min au total</Text>
          </View>
        </View>

        <View style={s.headerRow}>
          <Text style={s.sectionLabel}>MISSIONS PROPOSÉES</Text>
          <Text style={s.totalLabel}>5 jours</Text>
        </View>
        <Card pad={8} style={{ marginBottom: 20 }}>
          {MISSIONS.map((m, i) => (
            <View
              key={m.id}
              style={[s.missionRow, i < MISSIONS.length - 1 && s.missionBorder]}
            >
              <View style={[s.dayBadge, m.done && s.dayBadgeDone]}>
                <Text style={[s.dayText, m.done && s.dayTextDone]}>{m.d}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.missionLabel, m.done && s.missionLabelDone]}>{m.label}</Text>
                <Text style={s.missionMin}>{m.min} minutes</Text>
              </View>
              {m.done && <Ionicons name="checkmark-circle" size={20} color={T.green.solid} />}
            </View>
          ))}
        </Card>

        <Btn onPress={() => router.push('/mission' as any)} full icon={<Ionicons name="play" size={18} color="#fff" />}>
          Lancer la mission du jour
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn onPress={() => router.push('/plan-edit' as any)} full icon={<Ionicons name="create-outline" size={18} color={T.ink} />}>
            Modifier le planning
          </GhostBtn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 14, color: T.sub, marginTop: 3, fontWeight: '500', marginBottom: 18 },
  planHero: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 22, padding: 16, backgroundColor: T.primarySoft, marginBottom: 18,
  },
  planHeroTitle: { fontWeight: '800', fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  planHeroSub: { fontSize: 13, color: T.sub, fontWeight: '600', marginTop: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, letterSpacing: 0.2 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: T.faint },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 10 },
  missionBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  dayBadge: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  dayBadgeDone: { backgroundColor: T.green.soft },
  dayText: { fontWeight: '800', fontSize: 13.5, color: T.primaryDeep },
  dayTextDone: { color: T.green.fg },
  missionLabel: { fontSize: 15, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  missionLabelDone: { color: T.sub, textDecorationLine: 'line-through' },
  missionMin: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 1 },
});
