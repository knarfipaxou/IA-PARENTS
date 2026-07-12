import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import type { ExamAnalysis } from '../lib/examResults';
import { progressColor, progressGradient } from '../lib/progressColor';

export function noteColor(note: number) {
  return note >= 14 ? DK.green : note >= 10 ? DK.gold : DK.red;
}
function fmtShort(iso: string) {
  const d = new Date(iso);
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getDate()} ${mois[d.getMonth()]}`;
}
function relDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days} jours`;
  return fmtShort(iso);
}

/** Tableau de bord de progression des contrôles blancs (par leçon/matière). */
export function ExamDashboard({ an }: { an: ExamAnalysis }) {
  const last = an.last;
  if (!last) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={s.sectionLabel}>DERNIER RÉSULTAT</Text>
      <LinearGradient
        colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.dashCard}
      >
        <View style={s.dashHead}>
          <View style={{ flex: 1 }}>
            <Text style={s.dashMatiere}>{last.matiere}</Text>
            <Text style={s.dashDate}>Fait le {new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            {an.delta !== undefined && an.delta !== 0 && (
              <View style={[s.deltaPill, { borderColor: an.delta > 0 ? 'rgba(52,214,150,0.55)' : 'rgba(255,107,90,0.55)' }]}>
                <Ionicons name={an.delta > 0 ? 'trending-up' : 'trending-down'} size={13} color={an.delta > 0 ? DK.green : DK.red} />
                <Text style={{ color: an.delta > 0 ? DK.green : DK.red, fontWeight: '800', fontSize: 12.5 }}>
                  {an.delta > 0 ? '+' : ''}{an.delta} point{Math.abs(an.delta) > 1 ? 's' : ''} depuis le dernier contrôle
                </Text>
              </View>
            )}
          </View>
          <Text style={[s.noteHuge, { color: noteColor(last.note) }]}>{last.note}<Text style={s.noteSur}> /20</Text></Text>
        </View>

        <View style={s.gaugeTrack}>
          <LinearGradient
            colors={progressGradient(an.gaugePct)}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.gaugeFill, { width: `${Math.max(4, an.gaugePct)}%` }]}
          />
        </View>
        <View style={s.gaugeRow}>
          <Text style={s.gaugeText}>{an.gaugePct} % de maîtrise</Text>
          <Text style={[s.gaugeTier, { color: progressColor(an.gaugePct) }]}>{an.gaugeLabel}</Text>
        </View>
        {!!an.motivation && <Text style={s.motivation}>{an.motivation}</Text>}
      </LinearGradient>

      {an.last3.length > 1 && (
        <>
          <Text style={s.sectionLabel}>DERNIERS RÉSULTATS</Text>
          <View style={s.last3Row}>
            {an.last3.map((r, i) => (
              <View key={r.id} style={[s.last3Card, i === 0 && s.last3CardBig]}>
                <Text style={[s.last3Note, { color: noteColor(r.note) }, i === 0 && { fontSize: 26 }]}>{r.note}/20</Text>
                <Text style={s.last3Date}>{relDate(r.date)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {an.priorities.length > 0 && (
        <>
          <Text style={s.sectionLabel}>POINTS À AMÉLIORER</Text>
          <View style={{ gap: 9 }}>
            {an.priorities.map((p, i) => (
              <View key={p.notion} style={s.prioRow}>
                <View style={[s.prioNum, i === 0 && { backgroundColor: 'rgba(255,107,90,0.18)', borderColor: 'rgba(255,107,90,0.55)' }]}>
                  <Text style={[s.prioNumText, i === 0 && { color: DK.red }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.prioTitle}>
                    <Text style={{ color: i === 0 ? DK.red : DK.gold }}>{p.label} : </Text>{p.notion}
                  </Text>
                  <Text style={s.prioDetail}>{p.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {an.improvements.length > 0 && (
        <>
          <Text style={s.sectionLabel}>EN AMÉLIORATION</Text>
          <View style={{ gap: 9 }}>
            {an.improvements.map((im) => (
              <View key={im.notion} style={[s.prioRow, { borderColor: 'rgba(52,214,150,0.35)' }]}>
                <Ionicons name="trending-up" size={18} color={DK.green} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.prioTitle}><Text style={{ color: DK.green }}>{im.notion}</Text></Text>
                  <Text style={s.prioDetail}>{im.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {!!an.objectif && (
        <LinearGradient
          colors={['rgba(53,228,210,0.12)', 'rgba(148,168,255,0.06)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.objectifBox}
        >
          <Text style={s.objectifLabel}>OBJECTIF DU PROCHAIN CONTRÔLE</Text>
          <Text style={s.objectifText}>{an.objectif}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)',
    marginTop: 16, marginBottom: 10, marginLeft: 4,
  },
  dashCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16 },
  dashHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  dashMatiere: { fontSize: 17, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  dashDate: { fontSize: 12.5, fontWeight: '600', color: DK.sub, marginTop: 3 },
  deltaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1.2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginTop: 9,
  },
  noteHuge: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  noteSur: { fontSize: 15, fontWeight: '700', color: DK.sub },
  gaugeTrack: { height: 11, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 14 },
  gaugeFill: { height: '100%', borderRadius: 999 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  gaugeText: { fontSize: 13, fontWeight: '700', color: DK.ink },
  gaugeTier: { fontSize: 13, fontWeight: '800' },
  motivation: { fontSize: 13, fontWeight: '700', color: DK.cyan, marginTop: 10, lineHeight: 19 },
  last3Row: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  last3Card: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, paddingVertical: 13,
  },
  last3CardBig: {
    flex: 1.35, borderColor: 'rgba(53,228,210,0.45)', backgroundColor: 'rgba(53,228,210,0.07)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10,
  },
  last3Note: { fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  last3Date: { fontSize: 11, fontWeight: '600', color: DK.sub, marginTop: 4 },
  prioRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 11,
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, padding: 13,
  },
  prioNum: {
    width: 24, height: 24, borderRadius: 999, borderWidth: 1.2,
    borderColor: 'rgba(245,194,75,0.55)', backgroundColor: 'rgba(245,194,75,0.14)',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  prioNumText: { fontSize: 12.5, fontWeight: '900', color: DK.gold },
  prioTitle: { fontSize: 14, fontWeight: '800', color: DK.ink, lineHeight: 20 },
  prioDetail: { fontSize: 12.5, fontWeight: '500', color: DK.sub, lineHeight: 18, marginTop: 3 },
  objectifBox: {
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)', borderRadius: 20, padding: 15, marginTop: 16,
  },
  objectifLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2, color: DK.cyan },
  objectifText: { fontSize: 14.5, fontWeight: '700', color: DK.ink, lineHeight: 21, marginTop: 6 },
});
