import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { playSfx } from '../../lib/sfx';
import { normalizeExamQuestions, computeExamScore, type ExamQuestionNormalized } from '../../lib/examScoring';
import { analyzeExams, type ExamResult } from '../../lib/examResults';
import { ExamDashboard } from '../ExamDashboard';
import type { MockExam } from '../../services/ai';

export function ControleBlancView({
  exam, examHistory, fallbackNotion, onFinish,
}: {
  exam: MockExam;
  examHistory: ExamResult[];
  fallbackNotion: string;
  /** Appelé à la fin de la correction : à l'appelant d'enregistrer le résultat et de réinjecter les erreurs. */
  onFinish: (
    questions: ExamQuestionNormalized[],
    score: ReturnType<typeof computeExamScore>,
    subChecks: Record<string, boolean>,
  ) => void;
}) {
  const [subChecks, setSubChecks] = useState<Record<string, boolean>>({});
  const [shownCorrections, setShownCorrections] = useState<Set<number>>(new Set());
  const [examDone, setExamDone] = useState(false);

  const questions = normalizeExamQuestions(exam.questions, fallbackNotion);
  const score = computeExamScore(questions, subChecks);
  const { totalMax, totalOk, note, acquis, aRenforcer } = score;

  function finishExam() {
    onFinish(questions, score, subChecks);
    playSfx(note >= 14 ? 'success' : 'correct');
    setExamDone(true);
  }

  return (
    <>
      {/* tableau de bord de progression pour cette leçon/matière */}
      <ExamDashboard an={analyzeExams(examHistory)} />

      <Text style={s.contentTitle}>{exam.titre}</Text>
      <View style={s.examMeta}>
        <View style={s.examChip}>
          <Text style={s.examChipText}>Durée : {exam.duree_min} min</Text>
        </View>
        <View style={s.examChip}>
          <Text style={s.examChipText}>{questions.length} questions · /{totalMax} pts</Text>
        </View>
      </View>
      <Text style={s.examHint}>Cochez chaque sous-question réussie : le score se met à jour en direct.</Text>

      {questions.map((qu, i) => {
        const shown = shownCorrections.has(i);
        const nSub = qu.sousQuestions.length;
        const nOk = qu.sousQuestions.filter((_, si) => subChecks[`${i}-${si}`]).length;
        return (
          <LinearGradient
            key={i}
            colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.examCard}
          >
            <View style={s.examQHeader}>
              <Text style={s.examQNum}>QUESTION {i + 1}</Text>
              <View style={[s.pointsBadge, nOk === nSub && s.pointsBadgeFull, nOk > 0 && nOk < nSub && s.pointsBadgePartial]}>
                <Text style={[s.pointsText, nOk === nSub && { color: DK.green }, nOk > 0 && nOk < nSub && { color: DK.gold }]}>
                  {nOk}/{nSub} pts
                </Text>
              </View>
            </View>
            <Text style={s.examEnonce}>{qu.enonce}</Text>

            <View style={{ gap: 8, marginTop: 12 }}>
              {qu.sousQuestions.map((sq, si) => {
                const key = `${i}-${si}`;
                const on = !!subChecks[key];
                return (
                  <View key={si}>
                    <TouchableOpacity
                      onPress={() => {
                        playSfx(on ? 'wrong' : 'correct');
                        setSubChecks((prev) => ({ ...prev, [key]: !on }));
                      }}
                      style={[s.subQRow, on && s.subQRowOn]}
                      activeOpacity={0.8}
                    >
                      <View style={[s.subQCheck, on && s.subQCheckOn]}>
                        {on && <Ionicons name="checkmark" size={14} color="#062A14" />}
                      </View>
                      <Text style={[s.subQText, on && { color: '#9FF0BE' }]}>{sq.texte}</Text>
                      <Text style={s.subQPoint}>{on ? '1 pt' : '0 pt'}</Text>
                    </TouchableOpacity>
                    {shown && !!sq.reponse && <Text style={s.subQAnswer}>→ {sq.reponse}</Text>}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setShownCorrections((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i); else next.add(i);
                return next;
              })}
              style={s.corrToggle}
            >
              <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={17} color={DK.cyan} />
              <Text style={s.corrToggleText}>{shown ? 'Masquer les réponses' : 'Voir les réponses (parent)'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        );
      })}

      <View style={s.examTotalCard}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={s.examTotalLabel}>TOTAL</Text>
          <Text style={s.examTotalNote}>{totalOk}/{totalMax}  ·  <Text style={{ color: note >= 14 ? DK.green : note >= 10 ? DK.gold : DK.red }}>{note}/20</Text></Text>
        </View>
        {!examDone ? (
          <TouchableOpacity onPress={finishExam} activeOpacity={0.88} style={{ marginTop: 12 }}>
            <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishBtn}>
              <Ionicons name="checkmark-done" size={18} color="#052620" />
              <Text style={s.finishBtnText}>Terminer le contrôle</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <>
            <View style={s.synthBlock}>
              <Text style={s.synthLabel}>✅ ACQUIS</Text>
              <Text style={s.synthText}>{acquis.length > 0 ? acquis.join(' · ') : 'Aucune notion entièrement maîtrisée sur ce contrôle.'}</Text>
            </View>
            <View style={s.synthBlock}>
              <Text style={[s.synthLabel, { color: DK.gold }]}>🔶 À RENFORCER</Text>
              <Text style={s.synthText}>{aRenforcer.length > 0 ? aRenforcer.join(' · ') : 'Rien à signaler, tout est juste !'}</Text>
            </View>
            <Text style={s.synthHint}>
              Ces points faibles sont enregistrés : les prochains drills cibleront ces notions.
            </Text>
            <TouchableOpacity onPress={() => { setSubChecks({}); setExamDone(false); }} style={s.retryRow}>
              <Ionicons name="refresh" size={15} color={DK.sub} />
              <Text style={s.retryText}>Recommencer la correction</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  contentTitle: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.4, marginTop: 4 },
  examMeta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  examChip: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  examChipText: { fontSize: 11.5, fontWeight: '700', color: DK.cyan },
  examCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginTop: 13 },
  examQHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  examQNum: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1 },
  pointsBadge: {
    backgroundColor: 'rgba(255,107,90,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.45)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  pointsText: { fontSize: 12.5, fontWeight: '800', color: DK.red },
  pointsBadgeFull: { backgroundColor: 'rgba(52,214,150,0.12)', borderColor: 'rgba(52,214,150,0.55)' },
  pointsBadgePartial: { backgroundColor: 'rgba(245,194,75,0.1)', borderColor: 'rgba(245,194,75,0.55)' },
  examHint: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 10, lineHeight: 18 },
  examEnonce: { fontSize: 15.5, fontWeight: '700', color: DK.ink, lineHeight: 23, letterSpacing: -0.2 },
  subQRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.2, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(10,14,34,0.45)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
  },
  subQRowOn: { borderColor: 'rgba(110,230,150,0.65)', backgroundColor: 'rgba(110,230,150,0.1)' },
  subQCheck: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  subQCheckOn: { backgroundColor: DK.green, borderColor: DK.green },
  subQText: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, lineHeight: 20 },
  subQPoint: { fontSize: 11.5, fontWeight: '800', color: DK.faint },
  subQAnswer: { fontSize: 12.5, color: DK.cyan, fontWeight: '600', marginTop: 5, marginLeft: 12, lineHeight: 18 },
  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  corrToggleText: { color: DK.cyan, fontWeight: '800', fontSize: 13.5 },
  examTotalCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 22, padding: 16, marginTop: 16,
  },
  examTotalLabel: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1.5 },
  examTotalNote: { fontSize: 22, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 14,
  },
  finishBtnText: { color: '#052620', fontSize: 15, fontWeight: '800' },
  synthBlock: { marginTop: 13 },
  synthLabel: { fontSize: 11.5, fontWeight: '800', color: DK.green, letterSpacing: 0.8 },
  synthText: { fontSize: 13.5, color: 'rgba(230,236,255,0.9)', fontWeight: '600', lineHeight: 20, marginTop: 4 },
  synthHint: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 12, lineHeight: 17, fontStyle: 'italic' },
  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 13 },
  retryText: { fontSize: 12.5, fontWeight: '700', color: DK.sub },
});
