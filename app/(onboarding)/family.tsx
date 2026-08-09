import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { DarkScreen } from '../../components/ui/DarkScreen';
import { Btn } from '../../components/ui/Btn';
import { Kitsune, type KitsuneMove } from '../../components/Kitsune';
import { DK, Fonts, FAMILY_COLORS } from '../../constants/darkTheme';
import { setJSON } from '../../lib/storage';
import { createAccount } from '../../lib/auth';
import { useChild } from '../../contexts/ChildContext';

/** Étape 1/2 : création du compte local + famille (visuel Kitsune). */
export default function FamilyScreen() {
  const router = useRouter();
  const { children, deleteChildPermanently } = useChild();
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState<string>(FAMILY_COLORS[0]);
  const [tick, setTick] = useState(0);
  const [move, setMove] = useState<KitsuneMove>('idle');

  function react(next: KitsuneMove = 'wag') {
    setMove(next);
    setTick((t) => t + 1);
  }

  async function submit() {
    if (!familyName.trim()) { Alert.alert('Nom manquant', 'Indiquez le nom de votre famille.'); return; }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { Alert.alert('Email invalide', 'Indiquez une adresse email valide.'); return; }
    if (password.length < 4) { Alert.alert('Mot de passe trop court', 'Choisissez au moins 4 caractères.'); return; }

    await createAccount(email, password, familyName);
    await setJSON('ppia.familyName', familyName.trim());
    await setJSON('ppia.familyColor', color);
    children.filter((c) => c.id.startsWith('demo-child-')).forEach((c) => deleteChildPermanently(c.id));
    router.push('/(onboarding)/profile' as any);
  }

  return (
    <DarkScreen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '33%' }]} />
          </View>
        </View>

        <View style={s.kitsuneRow}>
          <Kitsune size={66} move={move} tick={tick} />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>Comment s'appelle votre famille ?</Text>
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Nom de famille</Text>
          <TextInput
            style={s.fieldInput}
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Famille Lemoine"
            placeholderTextColor={DK.faint}
            onFocus={() => react('nod')}
          />
        </View>

        <View style={s.field}>
          <Text style={[s.fieldLabel, { color: DK.faint }]}>Email</Text>
          <TextInput
            style={[s.fieldInput, { borderColor: DK.inputBorder }]}
            value={email}
            onChangeText={setEmail}
            placeholder="exemple@email.com"
            placeholderTextColor={DK.faint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={s.field}>
          <Text style={[s.fieldLabel, { color: DK.faint }]}>Mot de passe</Text>
          <TextInput
            style={[s.fieldInput, { borderColor: DK.inputBorder }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Au moins 4 caractères"
            placeholderTextColor={DK.faint}
            secureTextEntry
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[s.fieldLabel, { color: DK.faint }]}>Couleur de la famille</Text>
          <View style={s.colors}>
            {FAMILY_COLORS.map((hex) => {
              const on = color === hex;
              return (
                <TouchableOpacity
                  key={hex}
                  onPress={() => { setColor(hex); react('paw'); }}
                  style={[
                    s.colorDot,
                    { backgroundColor: hex },
                    on && { shadowColor: hex, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, borderWidth: 3, borderColor: '#fff' },
                  ]}
                  activeOpacity={0.85}
                />
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />
        <Btn full onPress={submit}>SUIVANT</Btn>
      </ScrollView>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: DK.screenPadX, paddingTop: 16, paddingBottom: DK.screenPadBottom, gap: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 22, color: DK.faint, paddingRight: 4 },
  progressTrack: { flex: 1, height: 16, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: DK.primary },
  kitsuneRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  bubble: {
    flex: 1, backgroundColor: DK.cardSolid, borderWidth: 2, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14,
  },
  bubbleText: { fontFamily: Fonts.displayMed, fontSize: 16.5, lineHeight: 22, color: DK.ink },
  field: {
    backgroundColor: DK.cardSolid, borderWidth: 2, borderColor: DK.primary,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, gap: 5,
  },
  fieldLabel: {
    fontFamily: Fonts.bodyBold, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', color: DK.primary,
  },
  fieldInput: {
    fontFamily: Fonts.displayMed, fontSize: 20, color: DK.ink, padding: 0,
  },
  colors: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 52, height: 52, borderRadius: 17 },
});
