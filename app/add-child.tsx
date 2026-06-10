import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, type AccentKey } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { Btn } from '../components/ui/Btn';
import { useChild } from '../contexts/ChildContext';
import type { Child, CollegeChild, MaternelleChild, MatiereStat } from '../data/mock';

const CLASSES = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const MATERNELLE = ['PS', 'MS', 'GS'];
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

export default function AddChild() {
  const router = useRouter();
  const { addChild, children } = useChild();
  const [prenom, setPrenom] = useState('');
  const [classe, setClasse] = useState('');
  const [age, setAge] = useState('');
  const [matieres, setMatieres] = useState<string[]>([]);

  function toggleMatiere(m: string) {
    setMatieres((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function save() {
    if (!prenom.trim()) { Alert.alert('Prénom manquant', "Indiquez le prénom de l'enfant."); return; }
    if (!classe) { Alert.alert('Classe manquante', 'Choisissez une classe.'); return; }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 2 || ageNum > 18) { Alert.alert('Âge invalide', 'Indiquez un âge entre 2 et 18 ans.'); return; }

    const accent = ACCENTS[children.length % ACCENTS.length];
    const matStats: MatiereStat[] = matieres.map((m, i) => ({
      s: m,
      v: 50,
      a: ACCENTS[i % ACCENTS.length],
      icon: MATIERE_ICONS[m] ?? 'book-outline',
    }));

    const isMaternelle = MATERNELLE.includes(classe);
    const base = {
      name: prenom.trim(),
      classe: isMaternelle ? `Maternelle ${classe}` : classe,
      age: ageNum,
      accent,
      progress: 0,
      matieres: matStats,
      forts: [] as string[],
      faibles: [] as string[],
      echeances: [],
      history: [],
    };

    let data: Omit<MaternelleChild, 'id'> | Omit<CollegeChild, 'id'>;
    if (isMaternelle) {
      data = {
        ...base,
        kind: 'maternelle' as const,
        activity: { label: 'Langage oral', min: 8, obj: 'Décrire une image' },
      };
    } else {
      data = {
        ...base,
        kind: 'college' as const,
        next: { subj: '—', type: 'À planifier', days: 0, accent },
        mission: { subj: matieres[0] ?? 'Français', min: 10, obj: 'Première mission à venir', notion: 'Découverte' },
      };
    }

    addChild(data);
    router.back();
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Ajouter un enfant</Text>
        <Text style={s.sub}>Créez le profil pour personnaliser les révisions.</Text>

        <Card pad={18} style={{ marginTop: 14, gap: 18 }}>
          {/* Prénom */}
          <View>
            <Text style={s.fieldLabel}>Prénom</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Maxime"
                placeholderTextColor={T.faint}
              />
            </View>
          </View>

          {/* Classe */}
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
            <Text style={s.hint}>PS / MS / GS = maternelle</Text>
          </View>

          {/* Âge */}
          <View>
            <Text style={s.fieldLabel}>Âge</Text>
            <View style={s.inputRow}>
              <Ionicons name="calendar-outline" size={19} color={T.faint} style={{ marginRight: 10 }} />
              <TextInput
                style={s.input}
                value={age}
                onChangeText={setAge}
                placeholder="11"
                keyboardType="number-pad"
                placeholderTextColor={T.faint}
              />
            </View>
          </View>

          {/* Matières */}
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

        <View style={{ height: 24 }} />
        <Btn onPress={save} full icon={<Ionicons name="checkmark" size={20} color="#fff" />}>
          Enregistrer le profil
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
  hint: { fontSize: 12, color: T.faint, fontWeight: '500', marginTop: 8 },
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
});
