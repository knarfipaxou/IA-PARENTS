import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Btn } from '../../components/ui/Btn';
import { Chip } from '../../components/ui/Chip';
import { Squircle } from '../../components/ui/Squircle';

const STEPS = [
  { d: 'J-7', label: 'Relire la leçon', state: 'done' as const },
  { d: 'J-6', label: 'Exercices guidés', state: 'done' as const },
  { d: 'J-5', label: "Problèmes d'application", state: 'today' as const },
  { d: 'J-4', label: 'Entraînement ciblé', state: 'next' as const },
  { d: 'J-3', label: 'Exercices type contrôle', state: 'next' as const },
  { d: 'J-2', label: 'Contrôle blanc', state: 'next' as const, route: '/mock-test' },
  { d: 'J-1', label: 'Révision finale', state: 'next' as const },
];

function dotColor(state: 'done' | 'today' | 'next') {
  if (state === 'done') return T.primary;
  if (state === 'today') return T.amber.solid;
  return T.lineStrong;
}

export default function PlanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Plan de révision</Text>
        <Text style={s.sub}>Adapté au rythme de Maxime.</Text>

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.examCard}>
          <View style={[s.examIcon, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
            <Ionicons name="calculator-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.examTitle}>Contrôle de Maths</Text>
            <Text style={s.examDate}>Jeudi 24 avril · dans 5 jours</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.examDays}>5</Text>
            <Text style={s.examDaysLabel}>jours</Text>
          </View>
        </LinearGradient>

        <View style={s.timeline}>
          {STEPS.map((step, i) => (
            <View key={step.d} style={s.stepRow}>
              <View style={s.stepLeft}>
                <View style={[s.stepDot, {
                  backgroundColor: step.state === 'next' ? T.surface : dotColor(step.state),
                  borderWidth: step.state === 'next' ? 2 : 0,
                  borderColor: T.lineStrong,
                }]}>
                  {step.state === 'done' && <Ionicons name="checkmark" size={15} color="#fff" />}
                  {step.state === 'today' && <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#fff' }} />}
                  {step.state === 'next' && <Text style={s.stepNum}>{i + 1}</Text>}
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.stepLine, { backgroundColor: step.state === 'done' ? T.primary : T.line }]} />
                )}
              </View>

              <TouchableOpacity
                onPress={() => step.route ? router.push(step.route as any) : step.state === 'today' ? router.push('/(tabs)/exercises') : null}
                style={[s.stepCard, step.state === 'today' && s.stepCardToday]}
              >
                <View style={{ flex: 1 }}>
                  <View style={s.stepCardTop}>
                    <Text style={[s.stepD, { color: step.state === 'today' ? T.amber.fg : T.faint }]}>{step.d}</Text>
                    {step.state === 'today' && <Chip accentKey="amber" fontSize={11}><Text style={{ color: T.amber.fg, fontSize: 11, fontWeight: '700' }}>Aujourd'hui</Text></Chip>}
                  </View>
                  <Text style={[s.stepLabel, step.state === 'next' && { color: T.sub }]}>{step.label}</Text>
                </View>
                {(step.state === 'today' || step.route) && <Ionicons name="chevron-forward" size={18} color={T.faint} />}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Btn full onPress={() => router.push('/(tabs)/exercises')} iconRight icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}>
          Voir les exercices du jour
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 14.5, color: T.sub, marginTop: 3, fontWeight: '500', marginBottom: 16 },
  examCard: { borderRadius: 22, padding: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  examIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  examTitle: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
  examDate: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: '600', marginTop: 2 },
  examDays: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 24 },
  examDaysLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  timeline: { marginBottom: 18 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepLeft: { alignItems: 'center', width: 30, flexShrink: 0 },
  stepDot: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepLine: { width: 2.5, flex: 1, minHeight: 26 },
  stepNum: { fontSize: 11, fontWeight: '800', color: T.faint },
  stepCard: { flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingTop: 4, paddingBottom: 4 },
  stepCardToday: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 16, padding: 12, shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  stepCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepD: { fontSize: 12.5, fontWeight: '800' },
  stepLabel: { fontSize: 15, fontWeight: '700', color: T.ink, letterSpacing: -0.2, marginTop: 2 },
});
