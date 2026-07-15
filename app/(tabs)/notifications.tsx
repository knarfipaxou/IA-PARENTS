import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { useChild } from '../../contexts/ChildContext';
import { upcomingDeadlines } from '../../lib/deadlines';
import type { Child } from '../../data/mock';

interface AlertItem {
  id: string;
  child: Child;
  icon: string;
  accent: 'coral' | 'amber';
  title: string;
  sub: string;
}

export default function Notifications() {
  const router = useRouter();
  const { children: allChildren, setChild } = useChild();
  const children = allChildren.filter((c) => !c.archived);

  const alerts: AlertItem[] = children
    .flatMap((c) =>
      upcomingDeadlines(c.echeances ?? [])
        .filter((e) => e.days <= 7)
        .map((e) => ({
          id: `${c.id}-${e.id}`,
          child: c,
          icon: e.days <= 3 ? 'alert-circle-outline' : 'calendar-outline',
          accent: (e.days <= 3 ? 'coral' : 'amber') as AlertItem['accent'],
          title: `${e.type} de ${e.subj} — ${c.name}`,
          sub: e.days === 0 ? "Aujourd'hui" : `Dans ${e.days} jour${e.days > 1 ? 's' : ''} · ${e.date}`,
          days: e.days,
        }))
    )
    .sort((a: any, b: any) => a.days - b.days);

  function openAlert(a: AlertItem) {
    setChild(a.child);
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 999, backgroundColor: T.surface,
              borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={T.ink} />
          </TouchableOpacity>
          <Text style={s.title}>Alertes</Text>
        </View>
        <Text style={s.sub}>Échéances des 7 prochains jours</Text>

        {alerts.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={40} color={T.green.fg} />
            <Text style={s.emptyText}>Tout est calme !</Text>
            <Text style={s.emptySub}>Aucune échéance urgente dans les 7 prochains jours.</Text>
          </View>
        ) : (
          <View style={s.list}>
            {alerts.map((n) => (
              <TouchableOpacity key={n.id} style={s.row} activeOpacity={0.85} onPress={() => openAlert(n)}>
                <View style={[s.iconBox, { backgroundColor: T[n.accent].soft }]}>
                  <Ionicons name={n.icon as any} size={22} color={T[n.accent].fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{n.title}</Text>
                  <Text style={s.rowSub}>{n.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={T.faint} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 14, color: T.sub, marginTop: 4, fontWeight: '500', marginBottom: 20 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 14,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '700', color: T.ink, letterSpacing: -0.2 },
  rowSub: { fontSize: 12.5, color: T.sub, fontWeight: '500', marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 17, fontWeight: '800', color: T.ink },
  emptySub: { fontSize: 13.5, color: T.sub, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
});
