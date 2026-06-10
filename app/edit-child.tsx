import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import type { MatiereStat } from '../data/mock';

const CLASSES = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const MATIERES = ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géo', 'Anglais', 'Langage', 'Graphisme', 'Nombres'];
const ACCENTS: AccentKey[] = ['green', 'violet', 'blue', 'amber', 'coral'];
const MATIERE_ICONS: Record<string, string> = {
  'Mathématiques': 'calculator-outline',
  'Français': 'book-outline',
  'Sciences': 'flask-outline',
  'Histoire-Géo': 'globe-outline',
  'Anglais': 'chatbubble-outline',
  'Langage': 'chatbubble-outline',
  'Graphisme': 'pencil-outline',
  'Nombres': 'calculator-outline',
};

export default function EditChild() {
  const router = useRouter();
  const { child, setChild, updateChild, archiveChild } = useChild();

  const [prenom, setPrenom] = useState(child?.name ?? '');
  const [classe, setClasse] = useState(child?.classe.replace('Maternelle ', '') ?? '');
  const [age, setAge] = useState(child ? String(child.age) : '');
  const [matieres, setMatieres] = useState<string[]>(child ? child.matieres.map((m) => m.s) : []);

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <TopBar onBack={() => router.back()} />
        <View style={s.center}>
          <Text style={s.centerText}>Aucun enfant sélectionné.</Text>
          <GhostBtn onPress={() => router.back()}>Retour</GhostBtn>
        </View>
      </SafeAreaView>
    );
  }

  function toggleMatiere(m: string) {
    setMatieres((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function save() {
    if (!child) return;
    if (!prenom.trim()) { Alert.alert('Prénom manquant', "Indiquez le prénom de l'enfant."); return; }
    if (!classe) { Alert.alert('Classe manquante', 'Choisissez une classe.'); return; }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 2 || ageNum > 18) { Alert.alert('Âge invalide', 'Indiquez un âge entre 2 et 18 ans.'); return; }

    const existing = child.matieres;
    const matStats: MatiereStat[] = matieres.map((m, i) => {
      const found = existing.find((x) => x.s === m);
      return found ?? { s: m, v: 50, a: ACCENTS[i % ACCENTS.length], icon: MATIERE_ICONS[m] ?? 'book-outline' };
    });
    const isMaternelle = ['PS', 'MS', 'GS'].includes(classe);
    updateChild(child.id, {
      name: prenom.trim(),
      classe: isMaternelle ? `Maternelle ${classe}` : classe,
      age: ageNum,
      matieres: matStats,
    });
    router.back();
  }

  function confirmArchive() {
    Alert.alert(
      'Êtes-vous sûr de vouloir supprimer cet enfant ?',
      "L'enfant sera déplacé dans les archives. Vous pourrez le restaurer plus tard.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: "Archiver l'enfant",
          style: 'destructive',
          onPress: () => {
            archiveChild(child!.id);
            setChild(null);
            router.replace('/(tabs)/' as any);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Modifier le profil</Text>
        <Text style={s.sub}>Mettez à jour les informations de {child.name}.</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 18 }}>
          <View>
            <Text style={s.fieldLabel}>Prénom</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput style={s.input} value={prenom} onChangeText={setPrenom} placeholder="Maxime" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Classe</Text>
            <View style={s.pillsRow}>
              {CLASSES.map((cl) => {
                const on = classe === cl;
                return (
                  <TouchableOpacity key={cl} onPress={() => setClasse(cl)} style={[s.pill, on && s.pillOn]}>
                    <Text style={[s.pillText, on && s.pillTextOn]}>{cl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Âge</Text>
            <View style={s.inputRow}>
              <Ionicons name="calendar-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput style={s.input} value={age} onChangeText={setAge} placeholder="11" keyboardType="number-pad" placeholderTextColor={T.faint} />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>Matières suivies</Text>
            <View style={s.pillsRow}>
              {MATIERES.map((m) => {
                const on = matieres.includes(m);
                return (
                  <TouchableOpacity key={m} onPress={() => toggleMatiere(m)} style={[s.pill, on && s.pillOn]}>
                    <Text style={[s.pillText, on && s.pillTextOn]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        <View style={{ height: 20 }} />
        <Btn onPress={save} full icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Enregistrer les modifications
        </Btn>
        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={confirmArchive} style={s.deleteRow} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={19} color={T.coral.fg} />
          <Text style={s.deleteText}>Supprimer cet enfant</Text>
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
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: T.coral.soft, borderRadius: 16, padding: 15,
  },
  deleteText: { fontWeight: '800', fontSize: 15, color: T.coral.fg },
});
