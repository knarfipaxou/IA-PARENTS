import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, AccentKey } from '../constants/theme';
import { Btn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';

function Block({ accentKey, icon, title, children }: { accentKey: AccentKey; icon: string; title: string; children: React.ReactNode }) {
  return (
    <Card pad={16} style={{ marginTop: 13 }}>
      <View style={s.blockHeader}>
        <Squircle accentKey={accentKey} icon={<Ionicons name={icon as any} size={19} color={T[accentKey].fg} />} size={34} r={11} />
        <Text style={s.blockTitle}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

export default function CorrectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />
        <View style={s.header}>
          <Text style={s.title}>Correction détaillée</Text>
          <Text style={s.sub}>Pensée pour le parent : claire, sans jargon.</Text>
        </View>

        <Block accentKey="blue" icon="text-outline" title="Énoncé">
          <Text style={s.bodyText}>Quelle fraction est la plus grande : 1/2, 3/4 ou 2/5 ?</Text>
        </Block>

        <View style={s.answerBanner}>
          <Ionicons name="checkmark" size={22} color={T.primaryDeep} />
          <View>
            <Text style={s.answerLabel}>Réponse correcte</Text>
            <Text style={s.answerValue}>3/4</Text>
          </View>
        </View>

        <Block accentKey="green" icon="bulb-outline" title="Explication simple">
          <Text style={s.bodyText}>
            Sur 4 parts, on en prend 3 : c'est presque tout. 1/2 c'est la moitié, et 2/5 c'est moins de la moitié. Donc{' '}
            <Text style={{ color: T.ink, fontWeight: '700' }}>3/4 est la plus grande</Text>.
          </Text>
        </Block>

        <Block accentKey="coral" icon="alert-circle-outline" title="Erreurs fréquentes">
          <Text style={s.bodyText}>
            Comparer uniquement les numérateurs (3 &gt; 2 &gt; 1) sans regarder le dénominateur.
          </Text>
        </Block>

        <Block accentKey="amber" icon="heart-outline" title="Conseil parent">
          <Text style={s.bodyText}>
            Dessinez une pizza coupée en parts : voir aide souvent plus que calculer.
          </Text>
        </Block>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/pdf')} icon={<Ionicons name="download-outline" size={20} color="#fff" />}>
          Télécharger en PDF
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
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500', marginBottom: 4 },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 11 },
  blockTitle: { fontWeight: '800', fontSize: 15.5, color: T.ink, letterSpacing: -0.3 },
  bodyText: { fontSize: 14.5, color: T.sub, lineHeight: 22, fontWeight: '500' },
  answerBanner: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: T.primarySoft, borderRadius: 16, padding: 15, marginTop: 13 },
  answerLabel: { fontSize: 12.5, fontWeight: '700', color: T.primaryDeep },
  answerValue: { fontSize: 18, fontWeight: '800', color: T.primaryDeep, letterSpacing: -0.3 },
});
