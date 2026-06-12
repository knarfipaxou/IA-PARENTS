import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { setJSON } from '../../lib/storage';
import { Btn } from '../../components/ui/Btn';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';
import { TopBar, StepPill } from '../../components/ui/TopBar';

export default function FamilyScreen() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [focus, setFocus] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TopBar onBack={() => router.back()} right={<StepPill n={1} total={2} />} />

        <View style={s.header}>
          <Text style={s.title}>Créer ma famille</Text>
          <Text style={s.sub}>Regroupez vos enfants dans un espace privé et sécurisé.</Text>
        </View>

        <Card pad={18} style={s.card}>
          <Text style={s.label}>Nom de la famille</Text>
          <View style={[s.inputWrap, focus && { borderColor: T.primary, shadowColor: T.primary, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }]}>
            <Ionicons name="people-outline" size={19} color={focus ? T.primary : T.faint} />
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Famille Martin"
              placeholderTextColor={T.faint}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              style={s.input}
            />
          </View>
        </Card>

        <Text style={s.sectionLabel}>Premier enfant</Text>
        <TouchableOpacity onPress={() => router.push('/(onboarding)/profile')} style={s.childBtn}>
          <View style={[s.childIcon, { backgroundColor: T.primarySoft }]}>
            <Ionicons name="add" size={24} color={T.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.childBtnTitle}>Ajouter un enfant</Text>
            <Text style={s.childBtnSub}>Prénom, classe et objectif</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={T.faint} />
        </TouchableOpacity>

        <View style={[s.infoBox, { backgroundColor: T.primarySoft }]}>
          <Ionicons name="shield-checkmark-outline" size={19} color={T.primaryDeep} />
          <Text style={[s.infoText, { color: T.primaryDeep }]}>
            Vos données restent privées. Vous pourrez ajouter d'autres enfants plus tard.
          </Text>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />
        <Btn full onPress={async () => {
          await setJSON('ppia.familyName', familyName.trim() || 'Ma famille');
          router.push('/(onboarding)/profile');
        }} iconRight icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}>
          Continuer
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36, gap: 0 },
  header: { marginTop: 18, marginBottom: 0 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6, lineHeight: 32 },
  sub: { fontSize: 15, color: T.sub, marginTop: 9, lineHeight: 22, fontWeight: '500' },
  card: { marginTop: 14 },
  label: { fontSize: 13, fontWeight: '700', color: T.sub, marginBottom: 7, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surfaceAlt, borderRadius: 15, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent' },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: T.sub, marginTop: 20, marginBottom: 9, marginLeft: 2 },
  childBtn: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: T.surfaceAlt, borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: T.lineStrong, borderStyle: 'dashed' },
  childIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  childBtnTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  childBtnSub: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 15, padding: 13, marginTop: 14 },
  infoText: { fontSize: 13.5, fontWeight: '600', lineHeight: 19, flex: 1 },
});
