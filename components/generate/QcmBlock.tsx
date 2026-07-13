import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { playSfx } from '../../lib/sfx';
import type { QcmExercise } from '../../services/ai';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Bloc QCM avec feedback vert/rouge néon (exercices, mini-test, test piégeux). */
export function QcmBlock({ exo, index, onAnswered }: { exo: QcmExercise; index: number; onAnswered?: (right: boolean) => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const checked = pick !== null;
  const isRight = pick === exo.bonneReponse;

  return (
    <View style={s.card}>
      <LinearGradient
        colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.questionCard}
      >
        <View style={s.questionChip}>
          <Text style={s.questionChipText}>Question {index + 1} · QCM</Text>
        </View>
        <Text style={s.title}>{exo.question}</Text>
      </LinearGradient>
      <View style={s.optsList}>
        {exo.options.map((opt, oi) => {
          const sel = pick === oi;
          const isCorrect = checked && oi === exo.bonneReponse;
          const isWrong = checked && sel && oi !== exo.bonneReponse;
          return (
            <TouchableOpacity
              key={oi}
              disabled={checked}
              onPress={() => { setPick(oi); playSfx(oi === exo.bonneReponse ? 'correct' : 'wrong'); onAnswered?.(oi === exo.bonneReponse); }}
              style={[s.optRow, isCorrect && s.optRowRight, isWrong && s.optRowWrong]}
              activeOpacity={0.88}
            >
              {isCorrect ? (
                <View style={[s.optBadge, { backgroundColor: DK.green, borderWidth: 0 }]}>
                  <Ionicons name="checkmark" size={15} color="#062A14" />
                </View>
              ) : isWrong ? (
                <View style={[s.optBadge, { backgroundColor: DK.red, borderWidth: 0 }]}>
                  <Ionicons name="close" size={15} color="#fff" />
                </View>
              ) : (
                <View style={s.optBadge}>
                  <Text style={s.optBadgeText}>{LETTERS[oi] ?? '?'}</Text>
                </View>
              )}
              <Text style={[s.optLabel, isCorrect && { color: '#9FF0BE', fontWeight: '800' }, isWrong && { color: '#FFB3A8', fontWeight: '800' }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {checked && (
        <View style={[s.feedback, isRight ? s.feedbackRight : s.feedbackWrong]}>
          <Ionicons
            name={isRight ? 'checkmark-circle' : 'bulb-outline'}
            size={20}
            color={isRight ? DK.green : DK.red}
            style={{ flexShrink: 0 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[s.feedbackTitle, { color: isRight ? DK.green : DK.red }]}>
              {isRight ? 'Bonne réponse !' : 'Presque !'}
            </Text>
            <Text style={s.feedbackSub}>{exo.explication}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: 15 },
  questionCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 24, padding: 18 },
  questionChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(53,228,210,0.09)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10,
  },
  questionChipText: { fontSize: 12, fontWeight: '800', color: DK.cyan },
  title: { fontSize: 16, fontWeight: '800', color: DK.ink, letterSpacing: -0.2, lineHeight: 23 },
  optsList: { gap: 9, marginTop: 12 },
  optRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(19,26,58,0.5)',
  },
  optRowRight: {
    borderColor: 'rgba(110,230,150,0.7)', backgroundColor: 'rgba(110,230,150,0.12)',
    shadowColor: DK.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  optRowWrong: {
    borderColor: 'rgba(255,107,90,0.7)', backgroundColor: 'rgba(255,107,90,0.1)',
    shadowColor: DK.red, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  optBadge: {
    width: 26, height: 26, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  optBadgeText: { fontSize: 12, fontWeight: '800', color: '#B9C6FF' },
  optLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, letterSpacing: -0.2 },
  feedback: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 18, padding: 13, marginTop: 12, borderWidth: 1,
  },
  feedbackRight: { backgroundColor: 'rgba(110,230,150,0.1)', borderColor: 'rgba(110,230,150,0.45)' },
  feedbackWrong: { backgroundColor: 'rgba(255,107,90,0.08)', borderColor: 'rgba(255,107,90,0.45)' },
  feedbackTitle: { fontWeight: '800', fontSize: 14.5 },
  feedbackSub: { fontSize: 12.5, color: 'rgba(230,236,255,0.9)', fontWeight: '500', marginTop: 3, lineHeight: 19 },
});
