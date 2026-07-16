import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { playSfx } from '../../lib/sfx';
import { computeCriteriaScore, type CriteriaScore } from '../../lib/masteryScoring';
import { analyzeExams, type ExamResult } from '../../lib/examResults';
import { ExamDashboard } from '../ExamDashboard';
import { CriteriaCorrection } from '../CriteriaCorrection';
import type { DevoirBlanc } from '../../services/ai';

export function DevoirBlancView({
  devoir, examHistory, onPrint, onFinish,
}: {
  devoir: DevoirBlanc;
  examHistory: ExamResult[];
  /** impression du sujet élève (PDF A4, sans aucune réponse) */
  onPrint: () => void;
  /** Appelé à la fin de la correction : à l'appelant d'enregistrer le résultat et de réinjecter les erreurs. */
  onFinish: (score: CriteriaScore, checks: Record<string, boolean>) => void;
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);

  const questions = devoir.questions ?? [];
  const score = computeCriteriaScore(questions, checks);

  function finish() {
    onFinish(score, checks);
    playSfx(score.note >= 14 ? 'success' : 'correct');
    setDone(true);
  }

  return (
    <>
      {/* tableau de bord de progression (historique des devoirs blancs) */}
      <ExamDashboard an={analyzeExams(examHistory)} />

      <Text style={s.title}>{devoir.titre}</Text>
      <View style={s.meta}>
        <View style={s.chip}><Text style={s.chipText}>Durée : {devoir.duree_min} min</Text></View>
        <View style={s.chip}><Text style={s.chipText}>{questions.length} questions · /{score.totalMax} pts</Text></View>
      </View>
      {!!devoir.consignes && <Text style={s.consignes}>{devoir.consignes}</Text>}

      {/* imprimer le sujet élève */}
      <TouchableOpacity onPress={onPrint} activeOpacity={0.88}>
        <LinearGradient
          colors={['rgba(40,90,220,0.35)', 'rgba(15,30,80,0.45)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
          style={s.printRow}
        >
          <View style={s.printIcon}><Ionicons name="print" size={24} color="#7CB4FF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.printTitle}>Imprimer le devoir enfant</Text>
            <Text style={s.printSub}>Sujet A4 sans aucune réponse ni correction</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={DK.sub} />
        </LinearGradient>
      </TouchableOpacity>

      <Text style={s.hint}>
        L'enfant compose sur papier (ou à l'oral), puis le parent corrige ici en cochant
        les critères de réussite : la note se met à jour en direct. ★ = critère indispensable.
      </Text>

      <CriteriaCorrection
        questions={questions}
        checks={checks}
        onToggle={(key, on) => setChecks((prev) => ({ ...prev, [key]: on }))}
        comments={comments}
        onComment={(qi, t) => setComments((prev) => ({ ...prev, [qi]: t }))}
      />

      <View style={s.totalCard}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalNote}>
            {score.totalOk}/{score.totalMax}  ·  <Text style={{ color: score.note >= 14 ? DK.green : score.note >= 10 ? DK.gold : DK.red }}>{score.note}/20</Text>
          </Text>
        </View>
        {!done ? (
          <TouchableOpacity onPress={finish} activeOpacity={0.88} style={{ marginTop: 12 }}>
            <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.finishBtn}>
              <Ionicons name="checkmark-done" size={18} color="#052620" />
              <Text style={s.finishBtnText}>Terminer la correction</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <>
            <View style={s.synthBlock}>
              <Text style={s.synthLabel}>✅ ACQUIS</Text>
              <Text style={s.synthText}>{score.acquis.length > 0 ? score.acquis.join(' · ') : 'Aucune notion entièrement maîtrisée sur ce devoir.'}</Text>
            </View>
            <View style={s.synthBlock}>
              <Text style={[s.synthLabel, { color: DK.gold }]}>🔶 À RENFORCER</Text>
              <Text style={s.synthText}>{score.aRenforcer.length > 0 ? score.aRenforcer.join(' · ') : 'Rien à signaler, tout est juste !'}</Text>
            </View>
            <Text style={s.synthHint}>
              Ces points faibles sont enregistrés : les prochains drills cibleront ces notions.
            </Text>
            <TouchableOpacity onPress={() => { setChecks({}); setDone(false); }} style={s.retryRow}>
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
  title: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.4, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.45)', backgroundColor: 'rgba(53,228,210,0.08)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  chipText: { fontSize: 11.5, fontWeight: '700', color: DK.cyan },
  consignes: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 10, lineHeight: 18 },
  printRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.2, borderColor: 'rgba(90,140,255,0.55)', borderRadius: 20, padding: 14, marginTop: 14,
  },
  printIcon: {
    width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(90,140,255,0.2)',
  },
  printTitle: { color: DK.ink, fontSize: 15.5, fontWeight: '800', letterSpacing: -0.2 },
  printSub: { color: DK.sub, fontSize: 12, fontWeight: '600', marginTop: 2 },
  hint: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 12, lineHeight: 18 },
  totalCard: {
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
    borderRadius: 22, padding: 16, marginTop: 16,
  },
  totalLabel: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1.5 },
  totalNote: { fontSize: 22, fontWeight: '900', color: DK.ink, letterSpacing: -0.4 },
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
