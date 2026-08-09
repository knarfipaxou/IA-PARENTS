import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HC, FONT, tintBg } from '../../constants/handoff';
import { useChild } from '../../contexts/ChildContext';
import { upcomingDeadlines } from '../../lib/deadlines';
import type { Child } from '../../data/mock';

interface AlertItem {
  id: string;
  child: Child;
  icon: string;
  tone: 'coral' | 'amber';
  title: string;
  sub: string;
  days: number;
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
          icon: e.days <= 3 ? 'alert-circle' : 'calendar',
          tone: (e.days <= 3 ? 'coral' : 'amber') as AlertItem['tone'],
          title: `${e.type} de ${e.subj} — ${c.name}`,
          sub: e.days === 0 ? "Aujourd'hui" : `Dans ${e.days} jour${e.days > 1 ? 's' : ''} · ${e.date}`,
          days: e.days,
        })),
    )
    .sort((a, b) => a.days - b.days);

  function openAlert(a: AlertItem) {
    setChild(a.child);
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: HC.bgApp }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={HC.sub} />
            </Pressable>
            <Text style={s.title}>Notifications</Text>
          </View>
          <Text style={s.sub}>Échéances des 7 prochains jours</Text>

          {alerts.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons name="checkmark-circle" size={44} color={HC.greenLight} />
              <Text style={s.emptyText}>Tout est calme&nbsp;!</Text>
              <Text style={s.emptySub}>Aucune échéance urgente dans les 7 prochains jours.</Text>
            </View>
          ) : (
            <View style={s.list}>
              {alerts.map((n) => {
                const fg = n.tone === 'coral' ? HC.coralLight : HC.amber;
                return (
                  <Pressable key={n.id} style={s.row} onPress={() => openAlert(n)}>
                    <View style={[s.iconBox, { backgroundColor: tintBg[n.tone] }]}>
                      <Ionicons name={n.icon as any} size={22} color={fg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>{n.title}</Text>
                      <Text style={s.rowSub}>{n.sub}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={HC.faint} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontFamily: FONT.num, fontSize: 24, color: HC.ink },
  sub: { fontFamily: FONT.body, fontSize: 13, color: HC.sub, marginTop: 6, marginBottom: 18 },
  list: { gap: 11 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#1B2238',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 15,
  },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: FONT.num, fontSize: 15, color: HC.ink },
  rowSub: { fontFamily: FONT.body, fontSize: 12.5, color: '#7C8AB4', marginTop: 3 },
  emptyBox: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { fontFamily: FONT.title, fontSize: 18, color: HC.ink },
  emptySub: { fontFamily: FONT.body, fontSize: 13.5, color: HC.sub, textAlign: 'center', lineHeight: 20 },
});
