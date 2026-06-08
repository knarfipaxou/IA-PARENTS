import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { T } from '../constants/theme';
import { Btn } from '../components/ui/Btn';

type Option = {
  id: string;
  label: string;
  frac: [number, number];
};

const OPTS: Option[] = [
  { id: 'a', label: '1/2', frac: [1, 2] },
  { id: 'b', label: '3/4', frac: [3, 4] },
  { id: 'c', label: '2/5', frac: [2, 5] },
];
const CORRECT = 'b';

function piePath(frac: number): string {
  const a = frac * 2 * Math.PI - Math.PI / 2;
  const x = 20 + 17 * Math.cos(a);
  const y = 20 + 17 * Math.sin(a);
  const large = frac > 0.5 ? 1 : 0;
  if (frac >= 1) return 'M20 3 A17 17 0 1 1 19.99 3 Z';
  return `M20 20 L20 3 A17 17 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

export default function MissionExo() {
  const router = useRouter();
  const [pick, setPick] = useState<string | null>(null);

  const checked = pick !== null;
  const isRight = pick === CORRECT;

  return (
    <SafeAreaView style={s.safe}>
      {/* progress */}
      <View style={s.topBar}>
        <View style={s.closeBtn}>
          <Ionicons name="close" size={20} color={T.sub} />
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: '50%' }]} />
        </View>
        <Text style={s.stepCount}>2/4</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.chipRow}>
          <View style={s.questionChip}>
            <Text style={s.questionChipText}>Question 1 · QCM</Text>
          </View>
        </View>

        <Text style={s.title}>Quelle fraction est la plus grande ?</Text>

        <View style={s.optsList}>
          {OPTS.map((o) => {
            const sel = pick === o.id;
            const isCorrect = checked && o.id === CORRECT;
            const isWrong = checked && sel && o.id !== CORRECT;
            const bgColor = isCorrect ? T.primarySoft : isWrong ? T.coral.soft : sel ? T.primarySoft : T.surface;
            const bdColor = isCorrect ? T.primary : isWrong ? T.coral.solid : sel ? T.primary : T.line;
            const fracVal = o.frac[0] / o.frac[1];

            return (
              <TouchableOpacity
                key={o.id}
                disabled={checked}
                onPress={() => setPick(o.id)}
                style={[s.optRow, { backgroundColor: bgColor, borderColor: bdColor }]}
                activeOpacity={0.88}
              >
                <Svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                  <Circle cx={20} cy={20} r={17} fill="none" stroke={T.lineStrong} strokeWidth={2.5} />
                  <Path d={piePath(fracVal)} fill={isWrong ? T.coral.solid : T.primary} opacity={0.85} />
                </Svg>
                <Text style={s.optLabel}>{o.label}</Text>
                {isCorrect && <Ionicons name="checkmark-circle" size={24} color={T.primaryDeep} />}
                {isWrong && <Ionicons name="close-circle" size={24} color={T.coral.fg} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {checked && (
          <View style={[s.feedback, { backgroundColor: isRight ? T.primarySoft : T.amber.soft }]}>
            <Ionicons
              name={isRight ? 'checkmark-circle' : 'bulb-outline'}
              size={22}
              color={isRight ? T.primaryDeep : T.amber.fg}
              style={{ flexShrink: 0 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[s.feedbackTitle, { color: isRight ? T.primaryDeep : T.amber.fg }]}>
                {isRight ? "Bravo, c'est exact !" : 'Presque !'}
              </Text>
              <Text style={s.feedbackSub}>
                3/4 remplit presque tout le cercle : c'est plus que la moitié (1/2) et bien plus que 2/5.
              </Text>
            </View>
          </View>
        )}

        <View style={{ minHeight: 16 }} />
        {checked ? (
          <Btn onPress={() => router.push('/mission-result' as any)} full icon={<Ionicons name="arrow-forward" size={20} color="#fff" />} iconRight>
            Continuer
          </Btn>
        ) : (
          <Btn onPress={() => {}} full disabled>
            Valider
          </Btn>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: { flex: 1, height: 12, borderRadius: 999, backgroundColor: T.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: T.primary },
  stepCount: { fontSize: 13, fontWeight: '800', color: T.sub },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  chipRow: { marginTop: 18 },
  questionChip: {
    alignSelf: 'flex-start', backgroundColor: T.amber.soft,
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
  },
  questionChipText: { fontSize: 12.5, fontWeight: '700', color: T.amber.fg },
  title: { fontSize: 23, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14, lineHeight: 30 },
  optsList: { gap: 11, marginTop: 22 },
  optRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 18, padding: 16, borderWidth: 2,
  },
  optLabel: { flex: 1, fontSize: 22, fontWeight: '800', color: T.ink, letterSpacing: -0.3 },
  feedback: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 18, padding: 15, marginBottom: 12, marginTop: 16,
  },
  feedbackTitle: { fontWeight: '800', fontSize: 15.5 },
  feedbackSub: { fontSize: 13.5, color: T.ink, fontWeight: '500', marginTop: 3, lineHeight: 20 },
});
