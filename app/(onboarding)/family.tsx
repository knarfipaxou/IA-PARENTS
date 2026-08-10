import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { Starfield } from '../../components/Starfield';
import { setJSON } from '../../lib/storage';
import { createAccount } from '../../lib/auth';
import { useChild } from '../../contexts/ChildContext';

/** Étape 1/2 : création du compte local (email + mot de passe) et de la famille. */
export default function FamilyScreen() {
  const router = useRouter();
  const { children, deleteChildPermanently } = useChild();
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
    // un vrai compte remplace la démonstration : on retire les enfants de démo
    children.filter((c) => c.id.startsWith('demo-child-')).forEach((c) => deleteChildPermanently(c.id));
    router.push('/(onboarding)/profile' as any);
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
              <Text style={s.stepPillText}><Text style={{ color: DK.cyan }}>1</Text>/2</Text>
            </View>
          </View>

          <View style={s.familyIcon}>
            <Ionicons name="people-outline" size={44} color={DK.cyan} />
          </View>

          <Text style={s.title}>Créer ma famille</Text>
          <Text style={s.sub}>Regroupez vos enfants dans un{'\n'}espace privé et sécurisé.</Text>

          <View style={s.card}>
            <View style={s.labelRow}>
              <Ionicons name="people-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Nom de la famille</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Famille Martin"
                placeholderTextColor={DK.faint}
              />
            </View>

            <View style={[s.labelRow, { marginTop: 20 }]}>
              <Ionicons name="mail-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Adresse email</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="exemple@email.com"
                placeholderTextColor={DK.faint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[s.labelRow, { marginTop: 20 }]}>
              <Ionicons name="lock-closed-outline" size={18} color={DK.cyan} />
              <Text style={s.label}>Mot de passe</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Choisissez un mot de passe"
                placeholderTextColor={DK.faint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={DK.sub} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.privacyRow}>
            <View style={s.privacyIcon}>
              <Ionicons name="shield-checkmark-outline" size={22} color={DK.cyan} />
            </View>
            <Text style={s.privacyText}>
              Vos données restent <Text style={{ color: DK.cyan, fontWeight: '800' }}>privées</Text> — tout est enregistré uniquement sur ce téléphone.
            </Text>
          </View>

          <TouchableOpacity onPress={submit} activeOpacity={0.88} style={{ marginTop: 24 }}>
            <View style={s.primaryBtn}>
              <Text style={s.primaryBtnText}>Continuer</Text>
            </View>
          </TouchableOpacity>
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

  familyIcon: {
    alignSelf: 'center', width: 104, height: 104, borderRadius: 999, marginTop: 26,
    borderWidth: 1.4, borderColor: 'rgba(53,228,210,0.55)', backgroundColor: 'rgba(53,228,210,0.06)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 18,
  },
  title: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: -1, textAlign: 'center', marginTop: 22 },
  sub: { color: DK.sub, fontSize: 16.5, fontWeight: '600', textAlign: 'center', marginTop: 12, lineHeight: 24 },

  card: {
    marginTop: 30, borderRadius: 26, borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.4)',
    backgroundColor: 'rgba(148,168,255,0.04)', padding: 20,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 },
  label: { color: '#fff', fontSize: 16.5, fontWeight: '800' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(10,14,34,0.5)',
    borderRadius: 16, paddingHorizontal: 15, paddingVertical: 3,
  },
  input: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', paddingVertical: 14 },

  privacyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18,
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(148,168,255,0.05)',
    borderRadius: 20, padding: 14,
  },
  privacyIcon: {
    width: 46, height: 46, borderRadius: 999, backgroundColor: 'rgba(10,14,34,0.6)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  privacyText: { flex: 1, color: DK.sub, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  primaryBtn: {
    borderRadius: 999, paddingVertical: 17, alignItems: 'center', backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  primaryBtnText: { color: '#062A26', fontSize: 17.5, fontWeight: '800' },
});
