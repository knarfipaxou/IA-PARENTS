import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';

type MissionItem = { d: string; label: string; min: number };

const INIT: MissionItem[] = [
  { d: 'J-5', label: 'Relire la leçon', min: 10 },
  { d: 'J-4', label: 'Exercices guidés', min: 15 },
  { d: 'J-3', label: "Problèmes d'application", min: 15 },
  { d: 'J-2', label: 'Contrôle blanc', min: 20 },
  { d: 'J-1', label: 'Révision finale', min: 10 },
];

export default function PlanEdit() {
  const router = useRouter();
  const [missions, setMissions] = useState<MissionItem[]>(INIT);

  function adjust(i: number, delta: number) {
    setMissions(prev => prev.map((m, idx) =>
      idx === i ? { ...m, min: Math.max(5, m.min + delta) } : m
    ));
  }

  function remove(i: number) {
    setMissions(prev => prev.filter((_, idx) => idx !== i));
  }

  const total = missions.reduce((s, m) => s + m.min, 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />
        <Text style={s.title}>Modifier le planning</Text>
        <Text style={s.sub}>Ajustez la durée de chaque mission.</Text>

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total : </Text>
          <Text style={s.totalVal}>{total} min</Text>
        </View>

        <Card pad={8} style={{ marginBottom: 24 }}>
          {missions.map((m, i) => (
            <View key={i} style={[s.row, i < missions.length - 1 && s.rowBorder]}>
              <View style={s.dayBadge}>
                <Text style={s.dayText}>{m.d}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{m.label}</Text>
                <View style={s.minRow}>
                  <TouchableOpacity onPress={() => adjust(i, -5)} style={s.minBtn}>
                    <Ionicons name="remove" size={17} color={T.sub} />
                  </TouchableOpacity>
                  <Text style={s.minVal}>{m.min} min</Text>
                  <TouchableOpacity onPress={() => adjust(i, 5)} style={s.minBtn}>
                    <Ionicons name="add" size={17} color={T.sub} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => remove(i)} style={s.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={T.coral.fg} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        <Btn
          onPress={() => router.push('/(child-tabs)/plan' as any)}
          full
          icon={<Ionicons name="checkmark" size={20} color="#fff" />}
        >
          Valider les modifications
        </Btn>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 13.5, color: T.sub, fontWeight: '500', marginTop: 6, marginBottom: 16 },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: T.sub },
  totalVal: { fontSize: 15, fontWeight: '800', color: T.primaryDeep },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  dayBadge: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontWeight: '800', fontSize: 13.5, color: T.primaryDeep },
  rowLabel: { fontSize: 14.5, fontWeight: '700', color: T.ink, letterSpacing: -0.2, marginBottom: 6 },
  minRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  minBtn: {
    width: 30, height: 30, borderRadius: 9, backgroundColor: T.surfaceAlt,
    borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
  },
  minVal: { fontSize: 14, fontWeight: '800', color: T.ink, minWidth: 54, textAlign: 'center' },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: T.coral.soft,
    alignItems: 'center', justifyContent: 'center',
  },
});
