import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import type { Planning } from '../../services/ai';

export function PlanningView({ plan }: { plan: Planning }) {
  return (
    <>
      {(plan.jours ?? []).map((j, i) => (
        <View key={i} style={s.planCard}>
          <View style={s.planHeader}>
            <View style={s.planBadge}>
              <Text style={s.planBadgeText}>{j.jour}</Text>
            </View>
            <Text style={s.planTotal}>
              {(j.taches ?? []).reduce((acc, t) => acc + (t.min || 0), 0)} min
            </Text>
          </View>
          {(j.taches ?? []).map((t, ti) => (
            <View key={ti} style={s.planTask}>
              <Ionicons name="ellipse-outline" size={14} color={DK.cyan} />
              <Text style={s.planTaskLabel}>{t.label}</Text>
              <Text style={s.planTaskMin}>{t.min} min</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const s = StyleSheet.create({
  planCard: {
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 15, marginTop: 13,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  planBadge: {
    backgroundColor: 'rgba(90,140,255,0.14)', borderWidth: 1, borderColor: 'rgba(90,140,255,0.45)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  planBadgeText: { fontSize: 13.5, fontWeight: '800', color: '#7CB4FF' },
  planTotal: { fontSize: 12.5, fontWeight: '800', color: DK.sub },
  planTask: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6 },
  planTaskLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: DK.ink, lineHeight: 20 },
  planTaskMin: { fontSize: 12.5, fontWeight: '800', color: DK.amber },
});
