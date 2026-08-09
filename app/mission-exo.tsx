import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { HC, FONT } from '../constants/handoff';
import { PhysicalButton } from '../components/ui/PhysicalButton';
import { Kitsune, useKitsuneReaction } from '../components/ui/Kitsune';

type Option = { id: string; label: string; frac: [number, number] };
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
  const kit = useKitsuneReaction();
  const [pick, setPick] = useState<string | null>(null);

  const checked = pick !== null;
  const isRight = pick === CORRECT;

  function choose(id: string) {
    if (checked) return;
    setPick(id);
    kit.react(null, id === CORRECT ? 'hop' : 'tilt');
  }

  const coach = !checked
    ? 'Compare les parts de chaque cercle.'
    : isRight
      ? 'Exact ! 3/4 remplit presque tout le cercle.'
      : 'Presque ! Quelle part est la plus grande ?';

  return (
    <LinearGradient colors={['#0C2E36', HC.bgApp]} locations={[0, 0.6]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <View style={s.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={22} color={HC.faint} />
          </Pressable>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '50%' }]} />
          </View>
          <Text style={s.stepCount}>2/4</Text>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.kitRow}>
            <Kitsune width={72} move={kit.move} tick={kit.tick} />
            <View style={s.bubble}>
              <Text style={[s.bubbleTxt, checked ? { color: isRight ? HC.greenLight : HC.coralLight } : null]}>{coach}</Text>
            </View>
          </View>

          <View style={s.questionCard}>
            <Text style={s.qKicker}>QUESTION 1 SUR 4</Text>
            <Text style={s.qTitle}>Quelle fraction est la plus grande&nbsp;?</Text>
          </View>

          <View style={s.optsList}>
            {OPTS.map((o) => {
              const sel = pick === o.id;
              const isCorrect = checked && o.id === CORRECT;
              const isWrong = checked && sel && o.id !== CORRECT;
              const bg = isCorrect ? 'rgba(22,178,110,0.12)' : isWrong ? 'rgba(255,107,90,0.10)' : '#1B2238';
              const bd = isCorrect ? HC.green : isWrong ? HC.coral : sel ? HC.cyan : 'rgba(255,255,255,0.09)';
              const fg = isCorrect ? HC.greenLight : isWrong ? HC.coralLight : HC.ink;
              const fracVal = o.frac[0] / o.frac[1];
              return (
                <Pressable
                  key={o.id}
                  disabled={checked}
                  onPress={() => choose(o.id)}
                  style={[s.optRow, { backgroundColor: bg, borderColor: bd }]}
                >
                  <Svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                    <Circle cx={20} cy={20} r={17} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2.5} />
                    <Path d={piePath(fracVal)} fill={isWrong ? HC.coral : HC.cyan} opacity={0.9} />
                  </Svg>
                  <Text style={[s.optLabel, { color: fg }]}>{o.label}</Text>
                  {isCorrect && <Ionicons name="checkmark-circle" size={24} color={HC.greenLight} />}
                  {isWrong && <Ionicons name="close-circle" size={24} color={HC.coralLight} />}
                </Pressable>
              );
            })}
          </View>

          <View style={{ minHeight: 18 }} />
          {checked ? (
            <PhysicalButton label="CONTINUER" variant="enfant" onPress={() => router.push('/mission-result' as any)} />
          ) : (
            <PhysicalButton label="VALIDER" variant="neutral" disabled onPress={() => {}} />
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  progressTrack: { flex: 1, height: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: HC.cyan },
  stepCount: { fontFamily: FONT.num, fontSize: 14, color: HC.sub },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32, paddingTop: 14, gap: 16 },
  kitRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  bubble: { flex: 1, backgroundColor: '#1B2238', borderWidth: 2, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 },
  bubbleTxt: { fontFamily: FONT.num, fontSize: 15.5, lineHeight: 21, color: HC.ink },
  questionCard: { backgroundColor: '#1B2238', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 18, gap: 6 },
  qKicker: { fontFamily: FONT.bodyBold, fontSize: 11, letterSpacing: 1, color: HC.faint },
  qTitle: { fontFamily: FONT.num, fontSize: 20, color: HC.ink, lineHeight: 27 },
  optsList: { gap: 11 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 18, padding: 16, borderWidth: 2 },
  optLabel: { flex: 1, fontFamily: FONT.num, fontSize: 22, letterSpacing: -0.3 },
});
