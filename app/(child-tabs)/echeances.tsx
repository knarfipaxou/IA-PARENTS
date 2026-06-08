import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Squircle } from '../../components/ui/Squircle';
import { useChild } from '../../contexts/ChildContext';

export default function EcheancesScreen() {
  const router = useRouter();
  const { child } = useChild();

  const echeances = child?.echeances ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Échéances</Text>
        {child && (
          <Text style={s.sub}>{echeances.length} évaluations à venir pour {child.name}.</Text>
        )}

        <View style={s.list}>
          {echeances.map((it) => (
            <TouchableOpacity
              key={it.id}
              onPress={() => router.push('/echeance-detail' as any)}
              style={s.row}
              activeOpacity={0.88}
            >
              <Squircle
                accentKey={it.accent}
                size={48}
                icon={<Ionicons name={it.icon as any} size={22} color={T[it.accent].fg} />}
              />
              <View style={{ flex: 1, marginLeft: 13 }}>
                <View style={s.titleRow}>
                  <Text style={s.rowTitle}>{it.subj}</Text>
                  {it.urg && (
                    <View style={s.urgChip}>
                      <Text style={s.urgText}>Urgent</Text>
                    </View>
                  )}
                </View>
                <Text style={s.rowSub}>{it.type} · {it.date}</Text>
                <View style={s.statusRow}>
                  <View style={[s.statusDot, { backgroundColor: it.status === 'confirme' ? T.green.solid : T.amber.solid }]} />
                  <Text style={s.statusText}>{it.status === 'confirme' ? 'Confirmé' : 'À vérifier'}</Text>
                </View>
              </View>
              <View style={s.jCol}>
                <Text style={[s.jCount, { color: T[it.accent].fg }]}>
                  {it.days === 0 ? "Auj." : `J-${it.days}`}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={T.faint} style={{ marginTop: 6 }} />
              </View>
            </TouchableOpacity>
          ))}

          {echeances.length === 0 && (
            <View style={s.emptyBox}>
              <Ionicons name="calendar-outline" size={42} color={T.faint} />
              <Text style={s.emptyText}>Aucune échéance à venir</Text>
            </View>
          )}
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
  sub: { fontSize: 14.5, color: T.sub, marginTop: 3, fontWeight: '500', marginBottom: 18 },
  list: { gap: 11 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 15,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontWeight: '800', fontSize: 16, color: T.ink, letterSpacing: -0.3 },
  urgChip: { backgroundColor: T.coral.soft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  urgText: { color: T.coral.fg, fontWeight: '700', fontSize: 10.5 },
  rowSub: { fontSize: 13.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusText: { fontSize: 12.5, fontWeight: '800', color: T.sub },
  jCol: { alignItems: 'center' },
  jCount: { fontSize: 21, fontWeight: '800', lineHeight: 24 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, color: T.faint, fontWeight: '600' },
});
