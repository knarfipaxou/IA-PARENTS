import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';

const STEPS = ['Rappel de la leçon', 'Reconnaître une fraction', 'Comparer deux fractions', 'Petit défi final'];

export default function MissionScreen() {
  const router = useRouter();
  const { child } = useChild();

  const missionTitle = child?.kind === 'college' ? child.mission?.notion ?? 'Mission du jour' : child?.activity?.label ?? 'Activité du jour';
  const missionMin = child?.kind === 'college' ? child.mission?.min : child?.activity?.min;
  const missionObj = child?.kind === 'college' ? child.mission?.obj : child?.activity?.obj;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        {/* Hero */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="flask-outline" size={40} color={T.primary} />
          </View>
          <View style={s.timeBadge}>
            <Ionicons name="time-outline" size={13} color="#fff" />
            <Text style={s.timeBadgeText}>{missionMin ?? 12} minutes</Text>
          </View>
          <Text style={s.heroTitle}>Mission du jour</Text>
          <Text style={s.heroSub}>
            Objectif : <Text style={{ color: '#fff', fontWeight: '700' }}>{missionObj ?? 'Comparer des fractions'}</Text>
          </Text>
        </LinearGradient>

        <Text style={s.stepsLabel}>{STEPS.length} ÉTAPES</Text>
        <View style={s.stepsList}>
          {STEPS.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={s.stepLabel}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 20 }} />
        <Btn onPress={() => router.push('/mission-rappel' as any)} full icon={<Ionicons name="play" size={17} color="#fff" />}>
          Commencer
        </Btn>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  hero: { borderRadius: 28, padding: 26, marginTop: 12, alignItems: 'center', overflow: 'hidden' },
  heroIcon: {
    width: 76, height: 76, borderRadius: 24, marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.amber.solid, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12,
  },
  timeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30, textAlign: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.74)', fontSize: 15, fontWeight: '500', marginTop: 8, lineHeight: 22, textAlign: 'center' },
  stepsLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 22, marginBottom: 11, letterSpacing: 0.2 },
  stepsList: { gap: 10, marginBottom: 24 },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: T.surface, borderRadius: 16, padding: 13, borderWidth: 1, borderColor: T.line,
  },
  stepNum: {
    width: 30, height: 30, borderRadius: 999, flexShrink: 0,
    backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontWeight: '800', fontSize: 14, color: T.primaryDeep },
  stepLabel: { fontSize: 15, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
});
