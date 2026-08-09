import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HC, FONT } from '../../constants/handoff';
import { PhysicalButton } from '../../components/ui/PhysicalButton';
import { Kitsune, useKitsuneReaction } from '../../components/ui/Kitsune';
import { setJSON } from '../../lib/storage';
import { createAccount } from '../../lib/auth';
import { useChild } from '../../contexts/ChildContext';

/** Étape 1/2 : création du compte local + famille (style handoff Kitsune, écran « family »). */
export default function FamilyScreen() {
  const router = useRouter();
  const { children, deleteChildPermanently } = useChild();
  const kit = useKitsuneReaction();
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function submit() {
    if (!familyName.trim()) { Alert.alert('Nom manquant', 'Indiquez le nom de votre famille.'); return; }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { Alert.alert('Email invalide', 'Indiquez une adresse email valide.'); return; }
    if (password.length < 4) { Alert.alert('Mot de passe trop court', 'Choisissez au moins 4 caractères.'); return; }

    await createAccount(email, password, familyName);
    await setJSON('ppia.familyName', familyName.trim());
    children.filter((c) => c.id.startsWith('demo-child-')).forEach((c) => deleteChildPermanently(c.id));
    router.push('/(onboarding)/profile' as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: HC.bgApp }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Back + progression */}
          <View style={s.topRow}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={HC.faint} />
            </Pressable>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: '33%' }]} />
            </View>
          </View>

          {/* Kitsune + bulle */}
          <View style={s.kitRow}>
            <Kitsune width={66} move={kit.move} tick={kit.tick} />
            <View style={s.bubble}>
              <Text style={s.bubbleTxt}>Comment s'appelle votre famille&nbsp;?</Text>
            </View>
          </View>

          {/* Champ nom de famille (accent) */}
          <Field
            label="Nom de famille"
            accent
            value={familyName}
            onChangeText={setFamilyName}
            onFocus={() => kit.react()}
            placeholder="Famille Lemoine"
          />

          <Field
            label="Adresse email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => kit.react()}
            placeholder="exemple@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            onFocus={() => kit.react()}
            placeholder="Au moins 4 caractères"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            trailing={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={HC.sub} />
              </Pressable>
            }
          />

          <View style={{ flex: 1, minHeight: 20 }} />
          <PhysicalButton label="CONTINUER" variant="parent" onPress={submit} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  accent,
  trailing,
  ...input
}: {
  label: string;
  accent?: boolean;
  trailing?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={s.field}>
      <Text style={[s.fieldLabel, { color: accent ? HC.green : HC.faint }]}>{label.toUpperCase()}</Text>
      <View style={[s.fieldBox, { borderColor: accent ? HC.green : 'rgba(255,255,255,0.10)' }]}>
        <TextInput style={s.fieldInput} placeholderTextColor={HC.faint} {...input} />
        {trailing}
      </View>
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
  bubble: {
    flex: 1,
    backgroundColor: '#1B2238',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bubbleTxt: { fontFamily: FONT.num, fontSize: 16.5, lineHeight: 22, color: HC.ink },
  field: { gap: 8 },
  fieldLabel: { fontFamily: FONT.bodyBold, fontSize: 11, letterSpacing: 1 },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1B2238',
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  fieldInput: { flex: 1, fontFamily: FONT.num, fontSize: 18, color: HC.ink, paddingVertical: 15 },
});
