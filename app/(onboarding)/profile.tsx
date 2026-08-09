import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HC, FONT } from '../../constants/handoff';
import { PhysicalButton } from '../../components/ui/PhysicalButton';
import { Kitsune, useKitsuneReaction } from '../../components/ui/Kitsune';
import { useChild } from '../../contexts/ChildContext';
import type { Child, CollegeChild, MatiereStat, ChildProfile, LearningObjective } from '../../types/childProfile';

type ClassDef = { id: string; tint: string; tileFg: string };
const CLASSES: ClassDef[] = [
  { id: 'CP', tint: '22,178,110', tileFg: '#3FD694' },
  { id: 'CE1', tint: '59,125,255', tileFg: '#7FAAFF' },
  { id: 'CE2', tint: '59,125,255', tileFg: '#7FAAFF' },
  { id: 'CM1', tint: '255,176,32', tileFg: '#FFB020' },
  { id: 'CM2', tint: '22,178,110', tileFg: '#3FD694' },
  { id: '6e', tint: '169,123,255', tileFg: '#C4A2FF' },
  { id: '5e', tint: '255,107,90', tileFg: '#FF9683' },
  { id: '4e', tint: '169,123,255', tileFg: '#C4A2FF' },
  { id: '3e', tint: '255,176,32', tileFg: '#FFB020' },
];
const CHEERS: Record<string, string> = {
  CP: 'CP, on démarre en douceur !',
  CE1: 'CE1, on consolide les bases.',
  CE2: 'CE2, super ! Je connais bien le programme.',
  CM1: 'CM1, top ! On va viser les fractions.',
  CM2: 'CM2, parfait ! Bientôt le collège.',
  '6e': '6e, on entre au collège !',
  '5e': '5e, on passe la vitesse supérieure !',
  '4e': '4e, on approfondit.',
  '3e': '3e, cap sur le brevet !',
};
const GOALS: { id: string; emoji: string; label: string; sub: string; objectif: LearningObjective }[] = [
  { id: 'comprendre', emoji: '🧠', label: 'Mieux comprendre', sub: 'Renforcer les bases et mieux assimiler les notions clés.', objectif: 'consolidation' },
  { id: 'controles', emoji: '🏆', label: 'Réussir les contrôles', sub: 'Obtenir de meilleures notes et réussir ses contrôles.', objectif: 'excellence' },
  { id: 'autonomie', emoji: '🚀', label: 'Gagner en autonomie', sub: 'Prendre confiance et devenir plus autonome au quotidien.', objectif: 'bon_niveau' },
];
const AGE_MAP: Record<string, number> = { CP: 6, CE1: 7, CE2: 8, CM1: 9, CM2: 10, '6e': 11, '5e': 12, '4e': 13, '3e': 14 };

/** Étape 2/2 : profil du premier enfant (style handoff Kitsune, écran « profile »). */
export default function ProfileScreen() {
  const router = useRouter();
  const { children, addChild, addProfile } = useChild();
  const kit = useKitsuneReaction();
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
      childId: newChild.id, pays: 'France', niveauEstime: 'moyen', objectif: selected.objectif,
      matieresPrioritaires: ['Mathématiques', 'Français'], dureeQuotidienne: 20, rythme: 'semaine',
      pointsFaibles: [], pointsForts: [], correctionDetaillee: true, versionImprimable: false,
      ton: 'bienveillant', createdAt: now, updatedAt: now,
    };
    addProfile(profile);
    router.replace('/(tabs)' as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: HC.bgApp }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.topRow}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={HC.faint} />
            </Pressable>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: '72%' }]} />
            </View>
          </View>

          <View style={s.kitRow}>
            <Kitsune width={66} move={kit.move} tick={kit.tick} />
            <View style={s.bubble}>
              <Text style={[s.bubbleTxt, kit.cheer ? { color: HC.greenLight } : null]}>
                {kit.cheer || "En quelle classe est votre enfant\u00a0?"}
              </Text>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>PRÉNOM DE L'ENFANT</Text>
            <View style={s.fieldBox}>
              <TextInput
                style={s.fieldInput}
                value={prenom}
                onChangeText={setPrenom}
                onFocus={() => kit.react()}
                placeholder="Lucas"
                placeholderTextColor={HC.faint}
              />
            </View>
          </View>

          <View style={{ gap: 11 }}>
            {CLASSES.map((c) => {
              const on = classe === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => { setClasse(c.id); kit.react(CHEERS[c.id] ?? null); }}
                  style={[s.classRow, { backgroundColor: on ? 'rgba(22,178,110,0.10)' : '#1B2238', borderColor: on ? HC.green : 'rgba(255,255,255,0.09)' }]}
                >
                  <View style={[s.classTile, { backgroundColor: `rgba(${c.tint},${on ? 0.22 : 0.18})` }]}>
                    <Text style={[s.classShort, { color: c.tileFg }]}>{c.id}</Text>
                  </View>
                  <Text style={[s.classLabel, { color: on ? HC.greenLight : HC.ink }]}>{`${c.id} · ${AGE_MAP[c.id]}-${AGE_MAP[c.id] + 1} ans`}</Text>
                  <Ionicons name="checkmark" size={18} color={HC.greenLight} style={{ marginLeft: 'auto', opacity: on ? 1 : 0 }} />
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 11 }}>
            <Text style={s.sectionLabel}>OBJECTIF PRINCIPAL</Text>
            {GOALS.map((g) => {
              const on = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => { setGoal(g.id); kit.react(); }}
                  style={[s.goalRow, { borderColor: on ? HC.green : 'rgba(255,255,255,0.09)', backgroundColor: on ? 'rgba(22,178,110,0.08)' : '#1B2238' }]}
                >
                  <View style={s.goalEmoji}><Text style={{ fontSize: 24 }}>{g.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.goalLabel}>{g.label}</Text>
                    <Text style={s.goalSub}>{g.sub}</Text>
                  </View>
                  <View style={[s.radio, on && { backgroundColor: HC.green, borderColor: HC.green }]}>
                    {on && <Ionicons name="checkmark" size={15} color={HC.onGreen} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ minHeight: 8 }} />
          <PhysicalButton label="C'EST PARTI" variant="parent" onPress={submit} />
          {hasExistingChildren && (
            <Pressable onPress={() => router.replace('/(tabs)' as any)}>
              <Text style={s.skipLink}>Mes enfants existent déjà — passer cette étape</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 34, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressTrack: { flex: 1, height: 16, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: HC.green },
  kitRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-end' },
  bubble: { flex: 1, backgroundColor: '#1B2238', borderWidth: 2, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 },
  bubbleTxt: { fontFamily: FONT.num, fontSize: 16.5, lineHeight: 22, color: HC.ink },
  field: { gap: 8 },
  fieldLabel: { fontFamily: FONT.bodyBold, fontSize: 11, letterSpacing: 1, color: HC.faint },
  fieldBox: { backgroundColor: '#1B2238', borderWidth: 2, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 18, paddingHorizontal: 18 },
  fieldInput: { fontFamily: FONT.num, fontSize: 18, color: HC.ink, paddingVertical: 15 },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 17 },
  classTile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  classShort: { fontFamily: FONT.title, fontSize: 15 },
  classLabel: { fontFamily: FONT.num, fontSize: 17 },
  sectionLabel: { fontFamily: FONT.bodySemi, fontSize: 12, letterSpacing: 1.2, color: HC.faint },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 2, borderRadius: 18, padding: 14 },
  goalEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  goalLabel: { fontFamily: FONT.num, fontSize: 16.5, color: HC.ink },
  goalSub: { fontFamily: FONT.body, fontSize: 12.5, color: HC.sub, marginTop: 3, lineHeight: 17 },
  radio: { width: 28, height: 28, borderRadius: 999, borderWidth: 1.6, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  skipLink: { fontFamily: FONT.bodySemi, fontSize: 13.5, color: HC.sub, textAlign: 'center', textDecorationLine: 'underline' },
});
