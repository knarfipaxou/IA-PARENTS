import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';

type NotifItem = { icon: string; a: AccentKey; title: string; body: string; unread?: boolean; route?: string };
const GROUPS: { when: string; items: NotifItem[] }[] = [
  {
    when: "Aujourd'hui",
    items: [
      { icon: 'flash', a: 'amber', title: "Exercice du jour prêt", body: "Fractions · séance de 15 min", unread: true, route: '/(tabs)/exercises' },
      { icon: 'time-outline', a: 'green', title: "Rappel de révision", body: "Pensez à réviser avec Maxime ce soir", unread: true },
    ],
  },
  {
    when: 'Cette semaine',
    items: [
      { icon: 'alert-circle-outline', a: 'coral', title: "Contrôle dans 3 jours", body: "Maths · jeudi 24 avril", route: '/(tabs)/plan' },
      { icon: 'star-outline', a: 'green', title: "Objectif atteint 🎉", body: "Maxime a terminé 5 jours d'affilée" },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />
        <Text style={s.title}>Notifications</Text>

        {GROUPS.map((g, gi) => (
          <View key={gi}>
            <Text style={s.groupLabel}>{g.when}</Text>
            <View style={s.groupList}>
              {g.items.map((it, ii) => (
                <TouchableOpacity key={ii} onPress={() => it.route && router.push(it.route as any)} activeOpacity={0.85}>
                  <Card pad={14} style={it.unread ? { ...s.notifCard, ...s.notifUnread } : s.notifCard}>
                    <Squircle accentKey={it.a} icon={<Ionicons name={it.icon as any} size={20} color={T[it.a].fg} />} size={44} />
                    <View style={{ flex: 1, marginLeft: 13 }}>
                      <Text style={s.notifTitle}>{it.title}</Text>
                      <Text style={s.notifBody}>{it.body}</Text>
                    </View>
                    {it.unread && <View style={s.unreadDot} />}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6, marginTop: 12, marginBottom: 4 },
  groupLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 20, marginBottom: 10, marginLeft: 2 },
  groupList: { gap: 10 },
  notifCard: { flexDirection: 'row', alignItems: 'center' },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: T.primary },
  notifTitle: { fontWeight: '800', fontSize: 15, color: T.ink, letterSpacing: -0.2 },
  notifBody: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: T.primary, flexShrink: 0 },
});
