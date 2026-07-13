import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../../constants/darkTheme';
import { QcmBlock } from './QcmBlock';
import type { MiniTest } from '../../services/ai';
import type { XPReason } from '../../lib/gamification';

export function MiniTestView({
  mt, onAnswered,
}: { mt: MiniTest; onAnswered: (right: boolean, reason: XPReason) => void }) {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const total = mt.exercices?.length ?? 0;
  const done = answers.length >= total && total > 0;
  const score = answers.filter(Boolean).length;
  const pct = total > 0 ? (score / total) * 100 : 0;

  return (
    <>
      {(mt.exercices ?? []).map((exo, i) => (
        <QcmBlock
          key={i} exo={exo} index={i}
          onAnswered={(right) => {
            setAnswers((prev) => [...prev, right]);
            onAnswered(right, right ? 'qcm_correct' : 'qcm_wrong');
          }}
        />
      ))}
      {done && (
        <LinearGradient
          colors={['rgba(90,70,20,0.35)', 'rgba(19,26,58,0.65)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.scoreCard}
        >
          <Image source={DK_ICONS.trophy} style={s.scoreTrophy} />
          <Text style={s.scoreBig}>{score} / {total}</Text>
          <View style={s.scoreTrack}>
            <LinearGradient
              colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.scoreFill, { width: `${Math.max(4, pct)}%` }]}
            />
          </View>
          <Text style={s.scoreLabel}>
            {score === total ? 'Excellent travail !' : score >= total / 2 ? 'Bien joué, continue !' : 'Courage, on révise et on recommence !'}
          </Text>
          {!!mt.conseil && (
            <View style={s.conseilBox}>
              <Ionicons name="bulb-outline" size={18} color={DK.gold} />
              <Text style={s.conseilText}>{mt.conseil}</Text>
            </View>
          )}
        </LinearGradient>
      )}
    </>
  );
}

const s = StyleSheet.create({
  scoreCard: {
    borderWidth: 1, borderColor: 'rgba(245,194,75,0.45)', borderRadius: 26,
    padding: 22, marginTop: 6, alignItems: 'center',
  },
  scoreTrophy: {
    width: 64, height: 64,
    shadowColor: DK.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  scoreBig: {
    fontSize: 44, fontWeight: '800', marginTop: 10, color: DK.gold,
    textShadowColor: 'rgba(245,194,75,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 26,
  },
  scoreTrack: {
    alignSelf: 'stretch', height: 9, borderRadius: 5, marginTop: 14,
    backgroundColor: 'rgba(148,168,255,0.15)', overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 5 },
  scoreLabel: { fontSize: 15, fontWeight: '700', color: DK.ink, letterSpacing: -0.2, marginTop: 14, textAlign: 'center' },
  conseilBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9, alignSelf: 'stretch',
    backgroundColor: 'rgba(255,194,75,0.1)', borderWidth: 1, borderColor: 'rgba(255,194,75,0.4)',
    borderRadius: 16, padding: 13, marginTop: 14,
  },
  conseilText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FFE3B0', lineHeight: 20 },
});
