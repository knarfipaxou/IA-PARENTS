import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DK } from '../../constants/darkTheme';
import type { RevisionSheet } from '../../services/ai';

export function FicheView({ fiche }: { fiche: RevisionSheet }) {
  return (
    <>
      <Text style={s.contentTitle}>{fiche.titre}</Text>
      {(fiche.sections ?? []).map((sec, i) => (
        <LinearGradient
          key={i}
          colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.ficheCard}
        >
          <Text style={s.ficheLabel}>{i + 1} · {sec.titre.toUpperCase()}</Text>
          <Text style={s.ficheText}>{sec.contenu}</Text>
          {sec.points_cles?.length > 0 && (
            <View style={s.pointsBox}>
              <Text style={s.pointsLabel}>★ POINTS CLÉS</Text>
              {sec.points_cles.map((p, pi) => (
                <View key={pi} style={s.pointRow}>
                  <Text style={s.pointBullet}>•</Text>
                  <Text style={s.pointText}>{p}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      ))}
    </>
  );
}

const s = StyleSheet.create({
  contentTitle: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.4, marginTop: 4 },
  ficheCard: { borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, marginTop: 13 },
  ficheLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: DK.cyan },
  ficheText: { fontSize: 13.5, lineHeight: 21, marginTop: 8, color: 'rgba(230,236,255,0.9)', fontWeight: '500' },
  pointsBox: {
    marginTop: 12, borderRadius: 16, padding: 13,
    backgroundColor: 'rgba(245,194,75,0.07)', borderWidth: 1, borderColor: 'rgba(245,194,75,0.4)',
  },
  pointsLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: DK.gold, marginBottom: 8 },
  pointRow: { flexDirection: 'row', gap: 9, marginTop: 5 },
  pointBullet: { color: DK.gold, fontWeight: '800', fontSize: 13 },
  pointText: { flex: 1, fontSize: 13, lineHeight: 19, color: 'rgba(235,240,255,0.9)', fontWeight: '500' },
});
