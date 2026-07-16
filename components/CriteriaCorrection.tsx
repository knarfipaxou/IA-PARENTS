import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { playSfx } from '../lib/sfx';
import { critKey } from '../lib/masteryScoring';
import type { OpenQuestion } from '../services/ai';

/**
 * Correction guidée par critères (mode PARENT) — utilisée par le devoir blanc
 * complet et par les missions du parcours de maîtrise.
 * L'énoncé est visible ; la zone de correction (réponse attendue, variantes,
 * critères cochables, erreurs fréquentes, explication, mini-leçon) est
 * masquée derrière un bouton « parent » question par question.
 */
export function CriteriaCorrection({
  questions, checks, onToggle, comments, onComment,
}: {
  questions: OpenQuestion[];
  checks: Record<string, boolean>;
  onToggle: (key: string, on: boolean) => void;
  comments: Record<number, string>;
  onComment: (qi: number, text: string) => void;
}) {
  const [openCorrections, setOpenCorrections] = useState<Set<number>>(new Set());

  return (
    <>
      {questions.map((qu, qi) => {
        const open = openCorrections.has(qi);
        const crits = qu.correction_criteria ?? [];
        const maxPts = crits.reduce((a, c) => a + (c.points || 0), 0);
        const okPts = crits.reduce((a, c, ci) => a + (checks[critKey(qi, ci)] ? (c.points || 0) : 0), 0);
        return (
          <LinearGradient
            key={qu.question_id ?? qi}
            colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.card}
          >
            <View style={s.qHeader}>
              <Text style={s.qNum}>QUESTION {qi + 1}</Text>
              <View style={[s.ptsBadge, okPts === maxPts && maxPts > 0 && s.ptsBadgeFull, okPts > 0 && okPts < maxPts && s.ptsBadgePartial]}>
                <Text style={[s.ptsText, okPts === maxPts && maxPts > 0 && { color: DK.green }, okPts > 0 && okPts < maxPts && { color: DK.gold }]}>
                  {okPts}/{maxPts} pts
                </Text>
              </View>
            </View>
            <Text style={s.enonce}>{qu.enonce}</Text>

            <TouchableOpacity
              onPress={() => setOpenCorrections((prev) => {
                const next = new Set(prev);
                if (next.has(qi)) next.delete(qi); else next.add(qi);
                return next;
              })}
              style={s.corrToggle}
            >
              <Ionicons name={open ? 'eye-off-outline' : 'eye-outline'} size={17} color={DK.cyan} />
              <Text style={s.corrToggleText}>{open ? 'Masquer la correction' : 'Corriger (parent)'}</Text>
            </TouchableOpacity>

            {open && (
              <View style={{ marginTop: 10, gap: 10 }}>
                <View style={s.block}>
                  <Text style={s.blockLabel}>RÉPONSE ATTENDUE</Text>
                  <Text style={s.blockText}>{qu.expected_answer}</Text>
                  {(qu.accepted_variants ?? []).length > 0 && (
                    <Text style={s.variants}>Accepter aussi : {qu.accepted_variants!.join(' · ')}</Text>
                  )}
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={s.blockLabel}>CRITÈRES DE RÉUSSITE</Text>
                  {crits.map((cr, ci) => {
                    const key = critKey(qi, ci);
                    const on = !!checks[key];
                    return (
                      <TouchableOpacity
                        key={cr.criterion_id ?? ci}
                        onPress={() => {
                          playSfx(on ? 'wrong' : 'correct');
                          onToggle(key, !on);
                        }}
                        style={[s.critRow, on && s.critRowOn]}
                        activeOpacity={0.8}
                      >
                        <View style={[s.critCheck, on && s.critCheckOn]}>
                          {on && <Ionicons name="checkmark" size={14} color="#062A14" />}
                        </View>
                        <Text style={[s.critText, on && { color: '#9FF0BE' }]}>
                          {cr.label}
                          {cr.required_for_mastery ? '  ★' : ''}
                        </Text>
                        <Text style={s.critPts}>{on ? cr.points : 0}/{cr.points} pt{cr.points > 1 ? 's' : ''}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {(qu.common_errors ?? []).length > 0 && (
                  <View style={s.block}>
                    <Text style={[s.blockLabel, { color: DK.red }]}>ERREURS FRÉQUENTES</Text>
                    {qu.common_errors!.map((err, i) => (
                      <Text key={i} style={s.blockText}>•  {err}</Text>
                    ))}
                  </View>
                )}
                {!!qu.explication && (
                  <View style={s.block}>
                    <Text style={s.blockLabel}>EXPLICATION</Text>
                    <Text style={s.blockText}>{qu.explication}</Text>
                  </View>
                )}
                {!!qu.mini_lecon && (
                  <View style={[s.block, s.miniLecon]}>
                    <Text style={[s.blockLabel, { color: DK.gold }]}>MINI-LEÇON SI ERREUR</Text>
                    <Text style={s.blockText}>{qu.mini_lecon}</Text>
                  </View>
                )}

                <TextInput
                  value={comments[qi] ?? ''}
                  onChangeText={(t) => onComment(qi, t)}
                  placeholder="Commentaire du parent (facultatif)…"
                  placeholderTextColor={DK.faint}
                  style={s.comment}
                  multiline
                />
              </View>
            )}
          </LinearGradient>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginTop: 13 },
  qHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  qNum: { fontSize: 12, fontWeight: '800', color: DK.sub, letterSpacing: 1 },
  ptsBadge: {
    backgroundColor: 'rgba(255,107,90,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,90,0.45)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  ptsText: { fontSize: 12.5, fontWeight: '800', color: DK.red },
  ptsBadgeFull: { backgroundColor: 'rgba(52,214,150,0.12)', borderColor: 'rgba(52,214,150,0.55)' },
  ptsBadgePartial: { backgroundColor: 'rgba(245,194,75,0.1)', borderColor: 'rgba(245,194,75,0.55)' },
  enonce: { fontSize: 15.5, fontWeight: '700', color: DK.ink, lineHeight: 23, letterSpacing: -0.2 },
  corrToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  corrToggleText: { color: DK.cyan, fontWeight: '800', fontSize: 13.5 },
  block: {
    backgroundColor: 'rgba(10,14,34,0.45)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.18)',
    borderRadius: 14, padding: 11,
  },
  blockLabel: { fontSize: 10.5, fontWeight: '800', color: DK.cyan, letterSpacing: 1, marginBottom: 5 },
  blockText: { fontSize: 13, color: 'rgba(230,236,255,0.9)', fontWeight: '600', lineHeight: 19 },
  variants: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 6, fontStyle: 'italic', lineHeight: 17 },
  critRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.2, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(10,14,34,0.45)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
  },
  critRowOn: { borderColor: 'rgba(110,230,150,0.65)', backgroundColor: 'rgba(110,230,150,0.1)' },
  critCheck: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  critCheckOn: { backgroundColor: DK.green, borderColor: DK.green },
  critText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: DK.ink, lineHeight: 19 },
  critPts: { fontSize: 11.5, fontWeight: '800', color: DK.faint },
  miniLecon: { borderColor: 'rgba(245,194,75,0.35)' },
  comment: {
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(10,14,34,0.45)',
    borderRadius: 14, padding: 11, color: DK.ink, fontSize: 13, fontWeight: '600', minHeight: 44,
  },
});
