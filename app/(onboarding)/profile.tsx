import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DarkScreen } from '../../components/ui/DarkScreen';
import { Btn } from '../../components/ui/Btn';
import { Kitsune, type KitsuneMove } from '../../components/Kitsune';
import { CheerBubble } from '../../components/ui/CheerBubble';
import { DK, Fonts, CHEERS, HANDOFF_CLASSES, softTint } from '../../constants/darkTheme';
import { useChild } from '../../contexts/ChildContext';
import type { Child, CollegeChild, MatiereStat, ChildProfile } from '../../types/childProfile';

const AGE_MAP: Record<string, number> = { CE2: 8, CM1: 9, CM2: 10, '6e': 11, '5e': 12 };

/** Étape 2/2 : profil enfant — classes Kitsune + encouragements. */
export default function ProfileScreen() {
  const router = useRouter();
  const { addChild, addProfile } = useChild();
  const [prenom, setPrenom] = useState('');
  const [classe, setClasse] = useState('');
  const [tick, setTick] = useState(0);
  const [move, setMove] = useState<KitsuneMove>('idle');
  const [cheer, setCheer] = useState('Dis-moi sa classe, je m\'adapte !');

  function pickClass(id: string) {
    setClasse(id);
    setCheer(CHEERS[id] ?? CHEERS.default);
    setMove(['hop', 'wag', 'nod', 'paw'][tick % 4] as KitsuneMove);
    setTick((t) => t + 1);
  }

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
    const now = new Date().toISOString();
    const profile: ChildProfile = {
      childId: newChild.id,
      pays: 'France',
      niveauEstime: 'moyen',
      objectif: 'consolidation',
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
    <DarkScreen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '72%' }]} />
          </View>
        </View>

        <View style={s.kitsuneRow}>
          <Kitsune size={66} move={move} tick={tick} />
          <CheerBubble text={cheer} tick={tick} />
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Prénom</Text>
          <TextInput
            style={s.fieldInput}
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Lina"
            placeholderTextColor={DK.faint}
          />
        </View>

        <View style={{ gap: 11 }}>
          {HANDOFF_CLASSES.map((cl) => {
            const on = classe === cl.id;
            return (
              <TouchableOpacity
                key={cl.id}
                onPress={() => pickClass(cl.id)}
                activeOpacity={0.9}
                style={[
                  s.classRow,
                  {
                    backgroundColor: on ? softTint(cl.tint, 0.14) : DK.card,
                    borderColor: on ? cl.tint : DK.cardBorder,
                  },
                ]}
              >
                <View style={[s.classTile, { backgroundColor: softTint(cl.tint, 0.22) }]}>
                  <Text style={[s.classShort, { color: cl.tileFg }]}>{cl.short}</Text>
                </View>
                <Text style={[s.classLabel, { color: on ? DK.ink : DK.sub }]}>{cl.label}</Text>
                <Text style={[s.check, { opacity: on ? 1 : 0 }]}>✓</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1, minHeight: 20 }} />
        <Btn full onPress={submit}>SUIVANT</Btn>
      </ScrollView>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: DK.screenPadX, paddingTop: 16, paddingBottom: DK.screenPadBottom, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 22, color: DK.faint },
  progressTrack: { flex: 1, height: 16, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: DK.primary },
  kitsuneRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  field: {
    backgroundColor: DK.cardSolid, borderWidth: 2, borderColor: DK.primary,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, gap: 5,
  },
  fieldLabel: {
    fontFamily: Fonts.bodyBold, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: DK.primary,
  },
  fieldInput: { fontFamily: Fonts.displayMed, fontSize: 20, color: DK.ink, padding: 0 },
  classRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 17,
  },
  classTile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  classShort: { fontFamily: Fonts.display, fontSize: 15 },
  classLabel: { fontFamily: Fonts.displayMed, fontSize: 17, flex: 1 },
  check: { fontSize: 18, color: DK.primaryLight },
});
