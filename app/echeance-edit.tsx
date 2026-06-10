import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import { iconForMatiere, daysFromDate } from '../lib/matiere';

const TYPES = ['Contrôle', 'Composition', 'DS', 'Devoir', 'Dictée', 'Récitation', 'Exposé', 'Autre'];

export default function EcheanceEdit() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { child, updateEcheance, removeEcheance } = useChild();
  const echeance = child?.echeances?.find((e) => e.id === id);

  const [titre, setTitre] = useState(echeance?.titre ?? '');
  const [matiere, setMatiere] = useState(echeance?.subj ?? '');
  const [date, setDate] = useState(echeance?.date ?? '');
  const [type, setType] = useState(echeance?.type ?? 'Contrôle');
  const [consigne, setConsigne] = useState(echeance?.consigne ?? '');
  const [noteParent, setNoteParent] = useState(echeance?.noteParent ?? '');

  if (!child || !echeance) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Ionicons name="calendar-outline" size={42} color={T.faint} />
          <Text style={s.centerText}>Échéance introuvable.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  function save() {
    if (!child || !echeance) return;
    if (!matiere.trim()) {
      Alert.alert('Matière manquante', 'Indiquez la matière concernée.');
      return;
    }
    updateEcheance(child.id, echeance.id, {
      titre: titre.trim() || undefined,
      subj: matiere.trim(),
      date: date.trim() || 'À définir',
      days: daysFromDate(date),
      type,
      consigne: consigne.trim() || undefined,
      noteParent: noteParent.trim() || undefined,
      icon: iconForMatiere(matiere),
    });
    router.back();
  }

  function confirmDelete() {
    Alert.alert("Supprimer l'échéance ?", 'Cette action est définitive. Les contenus générés pour ce contrôle seront perdus.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeEcheance(child!.id, echeance!.id);
          router.push('/(child-tabs)/echeances' as any);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Modifier l'échéance</Text>
        <Text style={s.sub}>{echeance.type} de {echeance.subj} · {echeance.date}</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 16 }}>
          <View>
            <Text style={s.fieldLabel}>Titre</Text>
            <TextInput style={s.input} value={titre} onChangeText={setTitre} placeholder="Les fractions" placeholderTextColor={T.faint} />
          </View>
          <View>
            <Text style={s.fieldLabel}>Matière</Text>
            <TextInput style={s.input} value={matiere} onChangeText={setMatiere} placeholder="Mathématiques" placeholderTextColor={T.faint} />
          </View>
          <View>
            <Text style={s.fieldLabel}>Date (JJ/MM/AAAA)</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="18/06/2026" placeholderTextColor={T.faint} />
          </View>
          <View>
            <Text style={s.fieldLabel}>Type</Text>
            <View style={s.pillsRow}>
              {TYPES.map((ty) => {
                const on = type === ty;
                return (
                  <TouchableOpacity key={ty} onPress={() => setType(ty)} style={[s.pill, on && s.pillOn]}>
                    <Text style={[s.pillText, on && s.pillTextOn]}>{ty}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View>
            <Text style={s.fieldLabel}>Consigne</Text>
            <TextInput style={[s.input, { minHeight: 64 }]} value={consigne} onChangeText={setConsigne} placeholder="Consigne du professeur" placeholderTextColor={T.faint} multiline />
          </View>
          <View>
            <Text style={s.fieldLabel}>Note du parent</Text>
            <TextInput style={[s.input, { minHeight: 64 }]} value={noteParent} onChangeText={setNoteParent} placeholder="Note personnelle" placeholderTextColor={T.faint} multiline />
          </View>
        </Card>

        <View style={{ height: 20 }} />
        <Btn full onPress={save} icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Enregistrer les modifications
        </Btn>
        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={confirmDelete} style={s.deleteRow} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={19} color={T.coral.fg} />
          <Text style={s.deleteText}>Supprimer cette échéance</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { fontSize: 15, color: T.sub, fontWeight: '600', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: T.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.surfaceAlt, fontSize: 15, fontWeight: '500', color: T.ink,
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent' },
  pillOn: { backgroundColor: T.primary, borderColor: T.primary },
  pillText: { fontWeight: '700', fontSize: 13.5, color: T.ink },
  pillTextOn: { color: '#fff' },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.coral.soft, borderRadius: 16, padding: 15,
  },
  deleteText: { fontWeight: '800', fontSize: 15, color: T.coral.fg },
});
