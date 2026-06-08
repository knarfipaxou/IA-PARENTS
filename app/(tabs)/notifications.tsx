import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';

const NOTIFS = [
  { id: '1', icon: 'alert-circle-outline', accent: 'coral' as const, title: 'Composition de SVT de Maxime', sub: 'Dans 3 jours · 24 avr', time: "Il y a 2h" },
  { id: '2', icon: 'flash-outline', accent: 'amber' as const, title: 'Mission du jour disponible', sub: 'Pour Maxime · SVT', time: "Ce matin" },
  { id: '3', icon: 'checkmark-circle-outline', accent: 'green' as const, title: 'Mission terminée par Alexia', sub: 'Langage oral · 8 min', time: "Hier" },
];

export default function Notifications() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.title}>Alertes</Text>
        <Text style={s.sub}>Notifications de vos enfants</Text>
        <View style={s.list}>
          {NOTIFS.map((n) => (
            <TouchableOpacity key={n.id} style={s.row} activeOpacity={0.85}>
              <View style={[s.iconBox, { backgroundColor: T[n.accent].soft }]}>
                <Ionicons name={n.icon as any} size={22} color={T[n.accent].fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{n.title}</Text>
                <Text style={s.rowSub}>{n.sub}</Text>
              </View>
              <Text style={s.time}>{n.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  time: { fontSize: 12, color: T.faint, fontWeight: '600' },
});
