import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import type { AccentKey } from '../constants/theme';

type FormState = {
  matiere: string;
  type: string;
  date: string;
  notions: string;
  priorite: string;
};

const TYPES = ['Contrôle', 'Composition', 'Dictée', 'Exposé'];
const PRIOS: { label: string; accent: AccentKey }[] = [
  { label: 'Basse', accent: 'green' },
  { label: 'Moyenne', accent: 'amber' },
  { label: 'Haute', accent: 'coral' },
];

export default function ManualDeadline() {
  const router = useRouter();
  const { child } = useChild();
  const [form, setForm] = useState<FormState>({ matiere: '', type: 'Contrôle', date: '', notions: '', priorite: 'Moyenne' });

  function set(k: keyof FormState, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Nouvelle échéance</Text>
        <Text style={s.sub}>Ajout manuel pour {child ? child.name : "l'enfant"}.</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 18 }}>
          {/* Matiere */}
          <View>
            <Text style={s.fieldLabel}>Matière</Text>
            <View style={s.inputRow}>
              <Ionicons name="calculator-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={form.matiere}
                onChangeText={(v) => set('matiere', v)}
                placeholder="Mathématiques"
                placeholderTextColor={T.faint}
              />
            </View>
          </View>

          {/* Type */}
          <View>
            <Text style={s.fieldLabel}>Type d'évaluation</Text>
            <View style={s.pillsRow}>
              {TYPES.map((ty) => {
                const on = form.type === ty;
                return (
                  <TouchableOpacity
                    key={ty}
                    onPress={() => set('type', ty)}
                    style={[s.pill, on && s.pillOn]}
                  >
                    <Text style={[s.pillText, on && s.pillTextOn]}>{ty}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date */}
          <View>
            <Text style={s.fieldLabel}>Date</Text>
            <View style={s.inputRow}>
              <Ionicons name="calendar-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={form.date}
                onChangeText={(v) => set('date', v)}
                placeholder="Jeu. 18 juin"
                placeholderTextColor={T.faint}
              />
            </View>
          </View>

          {/* Notions */}
          <View>
            <Text style={s.fieldLabel}>Notions à réviser</Text>
            <View style={s.inputRow}>
              <Ionicons name="text-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={form.notions}
                onChangeText={(v) => set('notions', v)}
                placeholder="Fractions, proportions…"
                placeholderTextColor={T.faint}
              />
            </View>
          </View>

          {/* Priorité */}
          <View>
            <Text style={s.fieldLabel}>Priorité</Text>
            <View style={s.prioRow}>
              {PRIOS.map((p) => {
                const on = form.priorite === p.label;
                return (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => set('priorite', p.label)}
                    style={[s.prioBtn, on && { backgroundColor: T[p.accent].soft, borderColor: T[p.accent].solid }]}
                  >
                    <Text style={[s.prioText, on && { color: T[p.accent].fg }]}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        <View style={{ height: 24 }} />
        <Btn onPress={() => router.push('/plan-create' as any)} full icon={<Ionicons name="arrow-forward" size={20} color="#fff" />} iconRight>
          Créer le planning
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
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 9 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: T.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.surfaceAlt,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: T.ink },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15,
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent',
  },
  pillOn: { backgroundColor: T.primary, borderColor: T.primary },
  pillText: { fontWeight: '700', fontSize: 14, color: T.ink },
  pillTextOn: { color: '#fff' },
  prioRow: { flexDirection: 'row', gap: 8 },
  prioBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent',
  },
  prioText: { fontWeight: '700', fontSize: 14, color: T.sub },
});
