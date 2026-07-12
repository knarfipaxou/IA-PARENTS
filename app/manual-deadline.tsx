import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { SUBJECTS } from '../lib/subjectIcons';
import { useScheme } from '../lib/useScheme';
import { CalendarModal } from '../components/CalendarModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import type { AccentKey } from '../constants/theme';
import { Alert } from 'react-native';

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
  const { child, addEcheance } = useChild();
  const scheme = useScheme();
  const [calOpen, setCalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ matiere: '', type: 'Contrôle', date: '', notions: '', priorite: 'Moyenne' });

  function set(k: keyof FormState, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function submit() {
    if (!child) {
      Alert.alert('Aucun enfant sélectionné', "Sélectionnez d'abord un enfant depuis l'accueil.");
      return;
    }
    if (!form.matiere.trim()) {
      Alert.alert('Matière manquante', "Touchez l'icône de la matière concernée.");
      return;
    }
    const accents: AccentKey[] = ['green', 'violet', 'coral', 'blue', 'amber'];
    const m = form.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    let days = 7;
    if (m) {
      const target = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
      if (!isNaN(diff)) days = Math.max(diff, 0);
    }
    addEcheance(child.id, {
      id: `ech-${Date.now()}`,
      subj: form.matiere.trim(),
      type: form.type,
      date: form.date.trim() || 'À définir',
      days,
      status: 'confirme',
      accent: accents[(child.echeances?.length ?? 0) % accents.length],
      icon: 'school-outline',
      urg: form.priorite === 'Haute',
    });
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Nouvelle échéance</Text>
        <Text style={s.sub}>Ajout manuel pour {child ? child.name : "l'enfant"}.</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 18 }}>
          {/* Matière : sélection par icône (plus de saisie manuelle) */}
          <View>
            <Text style={s.fieldLabel}>Matière</Text>
            <View style={s.subjectGrid}>
              {SUBJECTS.map((sub) => {
                const on = form.matiere === sub.label;
                return (
                  <TouchableOpacity
                    key={sub.key}
                    onPress={() => set('matiere', sub.label)}
                    style={[s.subjectTile, on && s.subjectTileOn]}
                    activeOpacity={0.85}
                  >
                    <Image source={scheme === 'light' ? sub.light : sub.dark} style={s.subjectImg} />
                    <Text style={[s.subjectLabel, on && s.subjectLabelOn]} numberOfLines={1}>{sub.label}</Text>
                    {on && (
                      <View style={s.subjectCheck}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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

          {/* Date : sélection via calendrier (aucune saisie clavier) */}
          <View>
            <Text style={s.fieldLabel}>Date</Text>
            <TouchableOpacity style={s.inputRow} onPress={() => setCalOpen(true)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <Text style={[s.input, !form.date && { color: T.faint }]}>
                {form.date || 'Choisir une date'}
              </Text>
              <Ionicons name="chevron-forward" size={17} color={T.faint} />
            </TouchableOpacity>
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
        <Btn onPress={submit} full icon={<Ionicons name="arrow-forward" size={20} color="#fff" />} iconRight>
          Ajouter l'échéance
        </Btn>
        <View style={{ height: 24 }} />
      </ScrollView>
      <CalendarModal
        visible={calOpen}
        initial={form.date}
        onClose={() => setCalOpen(false)}
        onConfirm={(d) => set('date', d)}
      />
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
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  subjectTile: {
    width: '22.5%', alignItems: 'center', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: T.line, backgroundColor: T.surfaceAlt,
  },
  subjectTileOn: {
    borderColor: '#12B886', backgroundColor: 'rgba(18,184,134,0.08)',
    shadowColor: '#12B886', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  subjectImg: { width: 52, height: 52, borderRadius: 12 },
  subjectLabel: { fontSize: 10, fontWeight: '700', color: T.sub, marginTop: 5 },
  subjectLabelOn: { color: '#0A8A64' },
  subjectCheck: {
    position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: 999,
    backgroundColor: '#12B886', alignItems: 'center', justifyContent: 'center',
  },
});
