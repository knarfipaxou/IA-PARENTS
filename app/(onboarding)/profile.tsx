import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { Starfield } from '../../components/Starfield';
import { useChild } from '../../contexts/ChildContext';
import type { Child, CollegeChild, MatiereStat, ChildProfile, LearningObjective } from '../../types/childProfile';

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const GOALS: { id: string; emoji: string; label: string; sub: string; objectif: LearningObjective }[] = [
  { id: 'comprendre', emoji: '🧠', label: 'Mieux comprendre', sub: 'Renforcer les bases et mieux assimiler les notions clés.', objectif: 'consolidation' },
  { id: 'controles', emoji: '🏆', label: 'Réussir les contrôles', sub: 'Obtenir de meilleures notes et réussir ses contrôles.', objectif: 'excellence' },
  { id: 'autonomie', emoji: '🚀', label: 'Gagner en autonomie', sub: 'Prendre confiance et devenir plus autonome au quotidien.', objectif: 'bon_niveau' },
];
const AGE_MAP: Record<string, number> = { CP: 6, CE1: 7, CE2: 8, CM1: 9, CM2: 10, '6e': 11, '5e': 12, '4e': 13, '3e': 14 };

/** Étape 2/2 : création du profil du premier enfant. */
export default function ProfileScreen() {
  const router = useRouter();
  const { children, addChild, addProfile, setChild } = useChild();
  const [prenom, setPrenom] = useState('');
  const [classe, setClasse] = useState('');
  const [goal, setGoal] = useState('comprendre');

  const hasExistingChildren = children.filter((c) => !c.archived && !c.id.startsWith('demo-child-')).length > 0;

  function submit() {
    if (!prenom.trim()) { Alert.alert('Prénom manquant', "Indiquez le prénom de l'enfant."); return; }
    if (!classe) { Alert.alert('Classe manquante', 'Choisissez une classe.'); return; }

    const matieres: MatiereStat[] = [
      { s: 'Mathématiques', v: 50, a: 'green', icon: 'calculator-outline' },
      { s: 'Français', v: 50, a: 'violet', icon: 'book-outline' },
    ];
    const data: Omit<CollegeChild, 'id'> = {
      kind: 'college',
      name: prenom.trim(), classe, age: AGE_MAP[classe] ?? 10,
      accent: 'green', progress: 0,
      next: { subj: '—', type: 'À planifier', days: 0, accent: 'green' },
      mission: { subj: 'Français', min: 20, obj: 'Première mission', notion: 'Découverte' },
      matieres, forts: [], faibles: [], echeances: [], history: [],
    };
    const newChild = addChild(data as Omit<Child, 'id'>);

    const selected = GOALS.find((g) => g.id === goal) ?? GOALS[0];
    const now = new Date().toISOString();
    const profile: ChildProfile = {
      childId: newChild.id,
      pays: 'France',
      niveauEstime: 'moyen',
      objectif: selected.objectif,
      matieresPrioritaires: ['Mathématiques', 'Français'],
      dureeQuotidienne: 20,
      rythme: 'semaine',
      pointsFaibles: [], pointsForts: [],
      correctionDetaillee: true, versionImprimable: false,
      ton: 'bienveillant',
      createdAt: now, updatedAt: now,
    };
    addProfile(profile);
    router.replace('/(tabs)' as any);
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <Starfield />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={22} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={s.stepPill}>
              <Text style={s.stepPillText}><Text style={{ color: DK.cyan }}>2</Text>/2</Text>
            </View>
          </View>

          <Text style={s.title}>Créer le profil{'\n'}de votre enfant</Text>
          <Text style={s.sub}>Ces informations nous aident à proposer des révisions adaptées.</Text>

          <View style={s.card}>
            <View style={s.labelRow}>
              <Ionicons name="person-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Prénom de l'enfant</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Lucas"
                placeholderTextColor={DK.faint}
              />
            </View>

            <View style={[s.labelRow, { marginTop: 22 }]}>
              <Ionicons name="school-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Classe</Text>
            </View>
            <View style={s.classGrid}>
              {CLASSES.map((c) => {
                const on = classe === c;
                return (
                  <TouchableOpacity key={c} onPress={() => setClasse(c)} style={[s.classChip, on && s.classChipOn]} activeOpacity={0.8}>
                    <Text style={[s.classChipText, on && { color: DK.cyan }]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[s.labelRow, { marginTop: 22 }]}>
              <Ionicons name="locate-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Objectif principal</Text>
            </View>
            <View style={{ gap: 11 }}>
              {GOALS.map((g) => {
                const on = goal === g.id;
                return (
                  <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)} style={[s.goalRow, on && s.goalRowOn]} activeOpacity={0.85}>
                    <View style={s.goalEmoji}><Text style={{ fontSize: 26 }}>{g.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.goalLabel}>{g.label}</Text>
                      <Text style={s.goalSub}>{g.sub}</Text>
                    </View>
                    <View style={[s.radio, on && s.radioOn]}>
                      {on && <Ionicons name="checkmark" size={15} color="#062A26" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={submit} activeOpacity={0.88} style={{ marginTop: 24 }}>
              <View style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Continuer</Text>
              </View>
            </TouchableOpacity>

            {hasExistingChildren && (
              <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={{ marginTop: 16 }}>
                <Text style={s.skipLink}>Mes enfants existent déjà — passer cette étape</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 22, paddingTop: 14, paddingBottom: 36 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 48, height: 48, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  stepPill: {
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', backgroundColor: 'rgba(148,168,255,0.08)',
    borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10,
  },
  stepPillText: { color: DK.sub, fontSize: 16, fontWeight: '800' },

  title: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 22, lineHeight: 44 },
  sub: { color: DK.sub, fontSize: 16, fontWeight: '600', marginTop: 12, lineHeight: 23 },

  card: {
    marginTop: 24, borderRadius: 26, borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.4)',
    backgroundColor: 'rgba(148,168,255,0.04)', padding: 20,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 },
  label: { color: '#fff', fontSize: 17, fontWeight: '800' },
  inputRow: {
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(10,14,34,0.5)',
    borderRadius: 16, paddingHorizontal: 15,
  },
  input: { color: '#fff', fontSize: 16, fontWeight: '600', paddingVertical: 14 },

  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  classChip: {
    minWidth: 62, alignItems: 'center', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.55)',
  },
  classChipOn: {
    borderColor: 'rgba(53,228,210,0.7)', backgroundColor: 'rgba(53,228,210,0.08)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  classChipText: { color: '#fff', fontSize: 15.5, fontWeight: '700' },

  goalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(19,26,58,0.5)',
    borderRadius: 20, padding: 14,
  },
  goalRowOn: {
    borderColor: 'rgba(53,228,210,0.7)', backgroundColor: 'rgba(53,228,210,0.06)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  goalEmoji: {
    width: 56, height: 56, borderRadius: 999, backgroundColor: 'rgba(10,14,34,0.6)',
    borderWidth: 1, borderColor: DK.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  goalLabel: { color: '#fff', fontSize: 16.5, fontWeight: '800', letterSpacing: -0.3 },
  goalSub: { color: DK.sub, fontSize: 13, fontWeight: '600', marginTop: 3, lineHeight: 18 },
  radio: {
    width: 28, height: 28, borderRadius: 999, borderWidth: 1.6, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { backgroundColor: DK.cyan, borderColor: DK.cyan },

  primaryBtn: {
    borderRadius: 999, paddingVertical: 17, alignItems: 'center', backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  primaryBtnText: { color: '#062A26', fontSize: 17.5, fontWeight: '800' },
  skipLink: { color: DK.sub, fontSize: 13.5, fontWeight: '700', textAlign: 'center', textDecorationLine: 'underline' },
});
