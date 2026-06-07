import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Btn } from '../../components/ui/Btn';
import { Card } from '../../components/ui/Card';
import { TopBar, StepPill } from '../../components/ui/TopBar';

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const GOALS = [
  { id: 'comprendre', label: 'Mieux comprendre', sub: 'Saisir les notions en profondeur' },
  { id: 'controles',  label: 'Réussir les contrôles', sub: 'Être prêt le jour J' },
  { id: 'autonomie',  label: 'Gagner en autonomie', sub: 'Réviser seul, sereinement' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [prenom, setPrenom] = useState('');
  const [classe, setClasse] = useState('');
  const [goal, setGoal] = useState('');
  const [focus, setFocus] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TopBar onBack={() => router.back()} right={<StepPill n={2} total={2} />} />

        <View style={s.header}>
          <Text style={s.title}>Créer le profil{'\n'}de votre enfant</Text>
          <Text style={s.sub}>Ces informations nous aident à proposer des révisions adaptées.</Text>
        </View>

        <Card pad={18} style={s.card}>
          <Text style={s.label}>Prénom de l'enfant</Text>
          <View style={[s.inputWrap, focus && { borderColor: T.primary }]}>
            <Ionicons name="person-outline" size={19} color={focus ? T.primary : T.faint} />
            <TextInput
              value={prenom} onChangeText={setPrenom} placeholder="Maxime"
              placeholderTextColor={T.faint}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={s.input}
            />
          </View>

          <Text style={[s.label, { marginTop: 18 }]}>Classe</Text>
          <View style={s.classGrid}>
            {CLASSES.map(c => (
              <TouchableOpacity key={c} onPress={() => setClasse(c)} style={[
                s.classChip,
                classe === c && { backgroundColor: T.primary, borderColor: T.primary, shadowColor: T.primaryDeep, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
              ]}>
                <Text style={[s.classChipText, classe === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.label, { marginTop: 18 }]}>Objectif principal</Text>
          <View style={s.goalsList}>
            {GOALS.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)} style={[
                s.goalRow,
                goal === g.id && { backgroundColor: T.primarySoft, borderColor: T.primary },
              ]}>
                <View style={[s.radio, goal === g.id && { backgroundColor: T.primary, borderColor: T.primary }]}>
                  {goal === g.id && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.goalLabel}>{g.label}</Text>
                  <Text style={s.goalSub}>{g.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={[s.infoBox, { backgroundColor: T.blue.soft }]}>
          <Ionicons name="information-circle-outline" size={19} color={T.blue.fg} />
          <Text style={[s.infoText, { color: T.blue.fg }]}>
            Vous pourrez modifier ces informations plus tard.
          </Text>
        </View>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.replace('/(tabs)')} iconRight icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}>
          Continuer
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { marginTop: 18 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6, lineHeight: 32 },
  sub: { fontSize: 15, color: T.sub, marginTop: 9, lineHeight: 22, fontWeight: '500' },
  card: { marginTop: 18 },
  label: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 7, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surfaceAlt, borderRadius: 15, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent' },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classChip: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent' },
  classChipText: { fontWeight: '700', fontSize: 14.5, color: T.ink, letterSpacing: -0.2 },
  goalsList: { gap: 9 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 15, padding: 13, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: 'transparent' },
  radio: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, borderColor: T.lineStrong, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalLabel: { fontWeight: '700', fontSize: 15, color: T.ink, letterSpacing: -0.2 },
  goalSub: { fontSize: 12.5, color: T.sub, marginTop: 1 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 15, padding: 13, marginTop: 14, marginBottom: 0 },
  infoText: { fontSize: 13.5, fontWeight: '600', lineHeight: 19, flex: 1 },
});
