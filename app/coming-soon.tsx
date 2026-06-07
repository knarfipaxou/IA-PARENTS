import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';

const COMING = [
  { a: 'amber' as const, icon: 'bar-chart-outline', title: 'Rapport mensuel', desc: 'Bilan complet de progression' },
  { a: 'blue' as const, icon: 'trending-up', title: 'Comparaison & évolution', desc: 'Suivre les progrès dans le temps' },
  { a: 'violet' as const, icon: 'bulb-outline', title: 'Intelligence pédagogique', desc: 'Conseils basés sur les erreurs' },
  { a: 'green' as const, icon: 'share-outline', title: 'Partage professeur', desc: 'Partager avec l\'enseignant' },
];

export default function ComingSoonScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.badge}>
            <Ionicons name="rocket-outline" size={18} color={T.amber.fg} />
            <Text style={s.badgeText}>Bientôt disponible</Text>
          </View>
          <Text style={s.heroTitle}>Fonctionnalités{'\n'}à venir</Text>
          <Text style={s.heroSub}>L'application évolue avec vous.</Text>
        </LinearGradient>

        <View style={s.list}>
          {COMING.map((item, i) => (
            <Card key={i} pad={16} style={s.comingCard}>
              <Squircle accentKey={item.a} icon={<Ionicons name={item.icon as any} size={22} color={T[item.a].fg} />} size={48} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.comingTitle}>{item.title}</Text>
                <Text style={s.comingDesc}>{item.desc}</Text>
              </View>
              <View style={s.soonBadge}>
                <Text style={s.soonText}>Bientôt</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  hero: { borderRadius: 24, padding: 24, marginTop: 16, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.amber.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  badgeText: { color: T.amber.fg, fontWeight: '700', fontSize: 13 },
  heroTitle: { color: '#fff', fontWeight: '800', fontSize: 28, letterSpacing: -0.6, textAlign: 'center', lineHeight: 32 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: 8 },
  list: { gap: 11, marginTop: 20 },
  comingCard: { flexDirection: 'row', alignItems: 'center' },
  comingTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  comingDesc: { fontSize: 13, color: T.sub, fontWeight: '500', marginTop: 2 },
  soonBadge: { backgroundColor: T.surfaceAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  soonText: { fontSize: 12, fontWeight: '700', color: T.sub },
});
