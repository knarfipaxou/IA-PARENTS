import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Btn, GhostBtn } from '../../components/ui/Btn';

const EXERCICES = [
  { q: 'Quelle fraction est la plus grande ?', opts: ['1/2', '3/4', '2/5'], correct: 1, diff: 'Facile' as const },
  { q: 'Le numérateur de 7/9 est :', opts: ['9', '7', '16'], correct: 1, diff: 'Moyen' as const },
  { q: 'Fraction équivalente à 1/2 :', opts: ['2/3', '3/6', '4/9'], correct: 1, diff: 'Moyen' as const },
];

function diffAccent(d: string) {
  if (d === 'Facile') return 'green' as const;
  if (d === 'Moyen') return 'amber' as const;
  return 'coral' as const;
}

export default function ExercisesScreen() {
  const router = useRouter();
  const [picks, setPicks] = useState<Record<number, number>>({});

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Exercices du jour</Text>
        <Text style={s.sub}>Fractions · séance de 15 minutes</Text>

        <View style={s.objective}>
          <Ionicons name="trophy-outline" size={20} color={T.primaryDeep} />
          <Text style={s.objectiveText}>Objectif : comparer et reconnaître des fractions</Text>
        </View>

        <View style={s.list}>
          {EXERCICES.map((ex, i) => (
            <Card key={i} pad={16}>
              <View style={s.exoHeader}>
                <Text style={s.exoNum}>EXERCICE {i + 1}</Text>
                <Chip accentKey={diffAccent(ex.diff)} fontSize={11}>
                  <Text style={{ color: T[diffAccent(ex.diff)].fg, fontSize: 11, fontWeight: '700' }}>{ex.diff}</Text>
                </Chip>
              </View>
              <Text style={s.exoQuestion}>{ex.q}</Text>
              <View style={s.options}>
                {ex.opts.map((opt, j) => {
                  const picked = picks[i] === j;
                  return (
                    <TouchableOpacity
                      key={j}
                      onPress={() => setPicks(p => ({ ...p, [i]: j }))}
                      style={[
                        s.optionBtn,
                        picked && {
                          backgroundColor: T.primary, borderColor: T.primary,
                          shadowColor: T.primaryDeep, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
                        },
                      ]}
                    >
                      <Text style={[s.optionText, picked && { color: '#fff' }]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>

        <Btn full onPress={() => router.push('/correction')} style={{ marginTop: 18 }} icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}>
          Voir la correction
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => router.push('/(tabs)')} icon={<Ionicons name="time-outline" size={18} color={T.ink} />}>
            Terminer plus tard
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
  sub: { fontSize: 14.5, color: T.sub, marginTop: 3, fontWeight: '500', marginBottom: 16 },
  objective: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: T.primarySoft, borderRadius: 16, padding: 13, marginBottom: 16 },
  objectiveText: { flex: 1, fontSize: 14, fontWeight: '700', color: T.primaryDeep, letterSpacing: -0.2 },
  list: { gap: 13 },
  exoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  exoNum: { fontSize: 12.5, fontWeight: '800', color: T.faint },
  exoQuestion: { fontSize: 15.5, fontWeight: '700', color: T.ink, letterSpacing: -0.2, marginBottom: 12 },
  options: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: { borderRadius: 13, paddingVertical: 11, paddingHorizontal: 18, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent' },
  optionText: { fontWeight: '800', fontSize: 15.5, letterSpacing: -0.2, color: T.ink },
});
