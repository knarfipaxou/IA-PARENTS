import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../../constants/darkTheme';
import { Starfield } from '../../components/Starfield';

const FEATURES = [
  { icon: 'scan-outline', label: 'Scanner', desc: 'Numérisez devoirs et contrôles' },
  { icon: 'trending-up-outline', label: 'Suivre', desc: 'Suivez les résultats et les progrès' },
  { icon: 'book-outline', label: 'Réviser', desc: 'Des fiches et leçons personnalisées' },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <Starfield />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          <Text style={s.title}>Prof Parent IA</Text>
          <Text style={s.tagline}>Scannez, comprenez, accompagnez.</Text>

          {/* carte des 3 fonctionnalités */}
          <View style={s.featureCard}>
            <Ionicons name="star" size={15} color={DK.cyan} style={s.cardStar} />
            <View style={s.featureRow}>
              {FEATURES.map((f) => (
                <View key={f.label} style={s.featureCol}>
                  <View style={s.featureIconTile}>
                    <Ionicons name={f.icon as any} size={30} color={DK.cyan} />
                  </View>
                  <Text style={s.featureLabel}>{f.label}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                  <View style={s.featureDot} />
                </View>
              ))}
            </View>
          </View>

          <Text style={s.pitch}>
            Créez votre espace famille et retrouvez{'\n'}les progrès de chaque enfant.
          </Text>

          <TouchableOpacity onPress={() => router.push('/(onboarding)/family' as any)} activeOpacity={0.88}>
            <View style={s.primaryBtn}>
              <Text style={s.primaryBtnText}>Créer un compte</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/login' as any)}
            style={s.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnText}>Se connecter</Text>
          </TouchableOpacity>

          <Text style={s.footer}>
            Déjà parent utilisateur ?{' '}
            <Text style={s.footerLink} onPress={() => router.push('/(onboarding)/login' as any)}>Se connecter</Text>
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 22, paddingTop: 60, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 44, fontWeight: '900', letterSpacing: -1.2, textAlign: 'center' },
  tagline: { color: DK.sub, fontSize: 17, fontWeight: '600', textAlign: 'center', marginTop: 10 },

  featureCard: {
    marginTop: 34, borderRadius: 28, borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.45)',
    backgroundColor: 'rgba(148,168,255,0.05)', paddingVertical: 30, paddingHorizontal: 12,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 22,
  },
  cardStar: { position: 'absolute', top: 18, right: 26 },
  featureRow: { flexDirection: 'row' },
  featureCol: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  featureIconTile: {
    width: 78, height: 78, borderRadius: 22,
    backgroundColor: 'rgba(148,168,255,0.09)', borderWidth: 1, borderColor: DK.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  featureLabel: { color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 14, letterSpacing: -0.3 },
  featureDesc: { color: DK.sub, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 6, lineHeight: 17 },
  featureDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: DK.cyan, marginTop: 16 },

  pitch: { color: DK.sub, fontSize: 15.5, fontWeight: '600', textAlign: 'center', marginTop: 30, lineHeight: 23 },

  primaryBtn: {
    marginTop: 26, borderRadius: 16, paddingVertical: 17, alignItems: 'center', backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  primaryBtnText: { color: '#062A26', fontSize: 17, fontWeight: '800' },
  secondaryBtn: {
    marginTop: 14, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.4, borderColor: 'rgba(53,228,210,0.55)',
  },
  secondaryBtnText: { color: DK.cyan, fontSize: 16.5, fontWeight: '800' },

  footer: { color: DK.sub, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 22 },
  footerLink: { color: DK.cyan, fontWeight: '800' },
});
