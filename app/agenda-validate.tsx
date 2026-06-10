import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';
import type { AgendaDevoir } from '../services/ai';
import { iconForMatiere, daysFromDate, ACCENT_CYCLE } from '../lib/matiere';
import type { Echeance } from '../data/mock';

const TYPES = ['Contrôle', 'Devoir', 'Récitation', 'Exposé', 'Autre'];

interface DraftItem {
  type: string;
  matiere: string;
  titre: string;
  date: string;
  consigne: string;
  validated: boolean;
  urg: boolean;
}

export default function AgendaValidateScreen() {
  const router = useRouter();
  const { child, getGenerated, addEcheance } = useChild();
  const devoirs: AgendaDevoir[] = (child ? getGenerated(child.id, 'devoirs') : undefined) ?? [];

  const [items, setItems] = useState<DraftItem[]>(() =>
    devoirs.map((d) => ({
      type: TYPES.includes(d.type) ? d.type : /contr|compo|ds|interro|dict/i.test(d.type ?? '') ? 'Contrôle' : 'Autre',
      matiere: d.matiere ?? '',
      titre: d.titre ?? '',
      date: d.date ?? '',
      consigne: (d.notions ?? []).join(', '),
      validated: false,
      urg: d.priorite === 'haute',
    }))
  );

  function patch(i: number, p: Partial<DraftItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  }

  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addBlank() {
    setItems((prev) => [...prev, { type: 'Contrôle', matiere: '', titre: '', date: '', consigne: '', validated: false, urg: false }]);
  }

  function saveAll() {
    if (!child) {
      Alert.alert('Aucun enfant sélectionné', "Sélectionnez d'abord un enfant depuis l'accueil.");
      return;
    }
    const valid = items.filter((it) => it.validated);
    if (valid.length === 0) {
      Alert.alert('Aucune échéance validée', 'Validez au moins une carte (coche verte) avant d’enregistrer.');
      return;
    }
    valid.forEach((it, i) => {
      const e: Echeance = {
        id: `ech-${Date.now()}-${i}`,
        subj: it.matiere.trim() || 'Matière',
        type: it.type,
        date: it.date.trim() || 'À définir',
        days: daysFromDate(it.date),
        status: 'confirme',
        accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
        icon: iconForMatiere(it.matiere),
        urg: it.urg,
        titre: it.titre.trim() || undefined,
        consigne: it.consigne.trim() || undefined,
        lessonIds: [],
      };
      addEcheance(child.id, e);
    });
    router.push('/(child-tabs)/echeances' as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.blue.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>IA</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Voici ce que l'IA a compris</Text>
          <Text style={s.sub}>Vérifiez, corrigez puis validez chaque échéance détectée.</Text>
        </View>

        <View style={{ gap: 13 }}>
          {items.map((it, i) => (
            <Card key={i} pad={15} style={it.validated ? { borderColor: T.primary, borderWidth: 1.5 } : undefined}>
              {/* type chips */}
              <View style={s.pillsRow}>
                {TYPES.map((ty) => {
                  const on = it.type === ty;
                  return (
                    <TouchableOpacity key={ty} onPress={() => patch(i, { type: ty })} style={[s.pill, on && s.pillOn]}>
                      <Text style={[s.pillText, on && s.pillTextOn]}>{ty}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.fieldLabel}>Matière</Text>
              <TextInput style={s.input} value={it.matiere} onChangeText={(v) => patch(i, { matiere: v })} placeholder="Mathématiques" placeholderTextColor={T.faint} />

              <Text style={s.fieldLabel}>Titre</Text>
              <TextInput style={s.input} value={it.titre} onChangeText={(v) => patch(i, { titre: v })} placeholder="Les fractions" placeholderTextColor={T.faint} />

              <Text style={s.fieldLabel}>Date (JJ/MM/AAAA)</Text>
              <TextInput style={s.input} value={it.date} onChangeText={(v) => patch(i, { date: v })} placeholder="18/06/2026" placeholderTextColor={T.faint} />

              <Text style={s.fieldLabel}>Consigne</Text>
              <TextInput style={s.input} value={it.consigne} onChangeText={(v) => patch(i, { consigne: v })} placeholder="Réviser les notions vues en classe" placeholderTextColor={T.faint} multiline />

              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => patch(i, { validated: !it.validated })} style={[s.validBtn, it.validated && s.validBtnOn]}>
                  <Ionicons name={it.validated ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={it.validated ? '#fff' : T.green.fg} />
                  <Text style={[s.validBtnText, it.validated && { color: '#fff' }]}>{it.validated ? 'Validée' : 'Valider'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(i)} style={s.delBtn}>
                  <Ionicons name="trash-outline" size={18} color={T.coral.fg} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}

          {items.length === 0 && (
            <View style={s.emptyBox}>
              <Ionicons name="calendar-outline" size={42} color={T.faint} />
              <Text style={s.emptyText}>Aucune échéance détectée. Ajoutez-en une manuellement.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 16 }} />
        <GhostBtn full onPress={addBlank} icon={<Ionicons name="add" size={19} color={T.ink} />}>
          Ajouter une échéance oubliée
        </GhostBtn>
        <View style={{ height: 10 }} />
        <Btn full onPress={saveAll} icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}>
          Enregistrer tout
        </Btn>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  pill: { borderRadius: 11, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent' },
  pillOn: { backgroundColor: T.primary, borderColor: T.primary },
  pillText: { fontWeight: '700', fontSize: 13, color: T.ink },
  pillTextOn: { color: '#fff' },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: T.sub, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: T.line, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11,
    backgroundColor: T.surfaceAlt, fontSize: 14.5, fontWeight: '500', color: T.ink,
  },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  validBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: T.green.soft, borderRadius: 13, paddingVertical: 11,
  },
  validBtnOn: { backgroundColor: T.primary },
  validBtnText: { fontWeight: '800', fontSize: 14, color: T.green.fg },
  delBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: T.coral.soft, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 36, gap: 12 },
  emptyText: { fontSize: 14.5, color: T.faint, fontWeight: '600', textAlign: 'center' },
});
