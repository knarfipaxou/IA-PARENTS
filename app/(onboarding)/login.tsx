import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { Starfield } from '../../components/Starfield';
import { login, resetPassword } from '../../lib/auth';
import { playSfx } from '../../lib/sfx';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function submit() {
    const result = await login(email, password);
    if (result === 'ok') {
      playSfx('correct');
      router.replace('/(tabs)' as any);
      return;
    }
    if (result === 'no_account') {
      Alert.alert('Aucun compte', "Aucun compte n'existe encore sur ce téléphone. Créez d'abord votre compte.", [
        { text: 'Créer un compte', onPress: () => router.push('/(onboarding)/family' as any) },
        { text: 'Annuler', style: 'cancel' },
      ]);
      return;
    }
    Alert.alert('Identifiants incorrects', 'Vérifiez votre adresse email et votre mot de passe.');
  }

  function forgotPassword() {
    if (!email.trim()) {
      Alert.alert('Mot de passe oublié', "Saisissez d'abord votre adresse email, puis retouchez « Mot de passe oublié ? » : vous pourrez définir un nouveau mot de passe.");
      return;
    }
    // sans serveur, la réinitialisation se fait directement sur le téléphone
    Alert.prompt?.(
      'Nouveau mot de passe',
      `Définir un nouveau mot de passe pour ${email.trim()} :`,
      async (newPwd) => {
        if (!newPwd || newPwd.length < 4) {
          Alert.alert('Mot de passe trop court', 'Choisissez au moins 4 caractères.');
          return;
        }
        const r = await resetPassword(email, newPwd);
        if (r === 'ok') Alert.alert('Mot de passe modifié', 'Vous pouvez maintenant vous connecter.');
        else Alert.alert('Email inconnu', "Cet email ne correspond pas au compte enregistré sur ce téléphone.");
      },
      'secure-text',
    );
  }

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <Starfield />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#B9C6FF" />
          </TouchableOpacity>

          <Text style={s.title}>Se connecter</Text>
          <Text style={s.sub}>Retrouvez votre espace famille.</Text>

          <View style={s.card}>
            <Text style={s.label}>Adresse email</Text>
            <View style={s.inputRow}>
              <Ionicons name="mail-outline" size={19} color={DK.cyan} />
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

            <Text style={[s.label, { marginTop: 22 }]}>Mot de passe</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={19} color={DK.cyan} />
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={DK.faint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={DK.sub} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={submit} activeOpacity={0.88} style={{ marginTop: 26 }}>
              <View style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Continuer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={forgotPassword} style={{ marginTop: 20 }}>
              <Text style={s.link}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <Text style={s.footer}>
              Première visite ?{' '}
              <Text style={s.footerLink} onPress={() => router.push('/(onboarding)/family' as any)}>Créer un compte</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 22, paddingTop: 14 },
  backBtn: {
    width: 48, height: 48, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1, textAlign: 'center', marginTop: 40 },
  sub: { color: DK.sub, fontSize: 16.5, fontWeight: '600', textAlign: 'center', marginTop: 10 },

  card: {
    marginTop: 36, borderRadius: 26, borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.4)',
    backgroundColor: 'rgba(148,168,255,0.04)', padding: 22,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.12, shadowRadius: 20,
  },
  label: { color: '#fff', fontSize: 16.5, fontWeight: '700', marginBottom: 11 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderWidth: 1.2, borderColor: DK.cardBorder, backgroundColor: 'rgba(10,14,34,0.5)',
    borderRadius: 16, paddingHorizontal: 15, paddingVertical: 3,
  },
  input: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', paddingVertical: 15 },

  primaryBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 8,
  },
  primaryBtnText: { color: '#062A26', fontSize: 17, fontWeight: '800' },
  link: { color: DK.cyan, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  footer: { color: DK.sub, fontSize: 14.5, fontWeight: '600', textAlign: 'center', marginTop: 20, marginBottom: 4 },
  footerLink: { color: DK.cyan, fontWeight: '800' },
});
