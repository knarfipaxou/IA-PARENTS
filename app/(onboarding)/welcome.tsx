import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { Btn } from '../../components/ui/Btn';
import { Card } from '../../components/ui/Card';
import { Squircle } from '../../components/ui/Squircle';

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    { key: 'blue' as const, icon: 'scan-outline', label: 'Scanner', desc: 'la leçon' },
    { key: 'amber' as const, icon: 'bulb-outline', label: 'Comprendre', desc: 'la méthode' },
    { key: 'green' as const, icon: 'school-outline', label: 'Réviser', desc: 'ensemble' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero panel */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          {/* decoration circle */}
          <View style={s.heroDeco} />

          {/* illustration placeholder */}
          <View style={s.heroIllustration}>
            <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']} style={s.heroIllustrationInner}>
              <Ionicons name="document-text-outline" size={56} color="rgba(255,255,255,0.6)" />
              <View style={s.heroIlluRow}>
                {['Maths', 'SVT', 'Français'].map((m, i) => (
                  <View key={i} style={[s.heroIlluChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <Text style={s.heroIlluChipText}>{m}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* brand */}
          <View style={s.heroBottom}>
            <LinearGradient colors={[T.primary, T.primaryDeep]} style={s.brandMark}>
              <Ionicons name="school" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={s.brandName}>
                PROF PARENT <Text style={{ color: T.primary }}>IA</Text>
              </Text>
              <Text style={s.brandTagline}>Le parent garde l'humain.</Text>
            </View>
          </View>

          <Text style={s.heroBody}>
            L'IA apporte la méthode.{' '}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
              Scannez une leçon, vérifiez ce que l'IA a compris, puis révisez avec votre enfant.
            </Text>
          </Text>
        </LinearGradient>

        {/* Feature tiles */}
        <View style={s.tiles}>
          {features.map(f => (
            <Card key={f.label} pad={14} style={s.tile}>
              <Squircle accentKey={f.key} icon={<Ionicons name={f.icon as any} size={22} color={T[f.key].fg} />} size={44} style={{ alignSelf: 'center', marginBottom: 9 }} />
              <Text style={s.tileLabel}>{f.label}</Text>
              <Text style={s.tileDesc}>{f.desc}</Text>
            </Card>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        <Btn full onPress={() => router.push('/(onboarding)/family')} iconRight icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}>
          Commencer
        </Btn>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: 14 }} onPress={() => router.push('/(tabs)')}>
          <Text style={s.loginLink}>
            Déjà un compte ?{' '}
            <Text style={{ color: T.primary, fontWeight: '700' }}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  hero: { borderRadius: 30, padding: 22, paddingBottom: 26, overflow: 'hidden', position: 'relative' },
  heroDeco: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(14,157,106,0.16)' },
  heroIllustration: { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  heroIllustrationInner: { padding: 24, alignItems: 'center', gap: 16, borderRadius: 20 },
  heroIlluRow: { flexDirection: 'row', gap: 8 },
  heroIlluChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  heroIlluChipText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  heroBottom: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 12 },
  brandMark: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.5, lineHeight: 26 },
  brandTagline: { color: 'rgba(255,255,255,0.66)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  heroBody: { color: '#fff', fontSize: 17, fontWeight: '600', lineHeight: 24, letterSpacing: -0.2 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tile: { flex: 1, borderRadius: 20, alignItems: 'center' },
  tileLabel: { fontWeight: '700', fontSize: 13.5, color: T.ink, letterSpacing: -0.2, textAlign: 'center' },
  tileDesc: { fontSize: 11.5, color: T.faint, marginTop: 1, textAlign: 'center' },
  loginLink: { fontSize: 14, color: T.sub, fontWeight: '500' },
});
