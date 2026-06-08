import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';

const MISSIONS = [
  { d: 'J-5', label: 'Relire la leçon', min: 10 },
  { d: 'J-4', label: 'Exercices guidés', min: 15 },
  { d: 'J-3', label: "Problèmes d'application", min: 15 },
  { d: 'J-2', label: 'Contrôle blanc', min: 20 },
  { d: 'J-1', label: 'Révision finale', min: 10 },
];

export default function PlanCreate() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar
          onBack={() => router.back()}
          right={
            <View style={s.proposeBadge}>
              <Ionicons name="sparkles" size={13} color="#fff" />
              <Text style={s.proposeBadgeText}>Proposé</Text>
            </View>
          }
        />

        <Text style={s.title}>Votre planning est prêt</Text>
        <Text style={s.sub}>Généré à partir de l'échéance détectée. Ajustez-le si besoin.</Text>

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.planHero}>
          <Squircle
            accentKey="green"
            size={48}
            icon={<Ionicons name="calculator-outline" size={24} color="#fff" />}
            style={{ backgroundColor: 'rgba(255,255,255,0.14)', marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.planHeroTitle}>Contrôle de Maths</Text>
            <Text style={s.planHeroSub}>Jeudi 24 avril · 5 missions · 70 min au total</Text>
          </View>
        </LinearGradient>

        <View style={s.headerRow}>
          <Text style={s.sectionLabel}>MISSIONS PROPOSÉES</Text>
          <Text style={s.totalLabel}>5 jours</Text>
        </View>
        <Card pad={8} style={{ marginBottom: 20 }}>
          {MISSIONS.map((m, i) => (
            <View key={i} style={[s.missionRow, i < MISSIONS.length - 1 && s.missionBorder]}>
              <View style={s.dayBadge}>
                <Text style={s.dayText}>{m.d}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.missionLabel}>{m.label}</Text>
                <Text style={s.missionMin}>{m.min} minutes</Text>
              </View>
            </View>
          ))}
        </Card>

        <Btn onPress={() => router.push('/(child-tabs)/plan' as any)} full icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Accepter le planning
        </Btn>
        <View style={s.actions}>
          <View style={{ flex: 1 }}>
            <GhostBtn onPress={() => router.push('/plan-edit' as any)} full icon={<Ionicons name="create-outline" size={18} color={T.ink} />}>
              Modifier
            </GhostBtn>
          </View>
          <View style={{ flex: 1 }}>
            <GhostBtn onPress={() => router.back()} full icon={<Ionicons name="trash-outline" size={18} color={T.ink} />}>
              Supprimer
            </GhostBtn>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  proposeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: T.green.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
  },
  proposeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 13.5, color: T.sub, fontWeight: '500', marginTop: 6, marginBottom: 16 },
  planHero: { borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  planHeroTitle: { color: '#fff', fontWeight: '800', fontSize: 16.5, letterSpacing: -0.3 },
  planHeroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, letterSpacing: 0.2 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: T.faint },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 10 },
  missionBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  dayBadge: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontWeight: '800', fontSize: 13.5, color: T.primaryDeep },
  missionLabel: { fontSize: 15, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  missionMin: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
