import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';

const SECTIONS = [
  { icon: 'document-text-outline', label: 'Résumé du plan de révision' },
  { icon: 'pencil-outline', label: 'Exercices du jour' },
  { icon: 'checkmark-circle-outline', label: 'Correction détaillée (parent)' },
  { icon: 'calendar-outline', label: 'Calendrier des révisions' },
];

export default function PdfScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.pdfIcon}>
            <Ionicons name="document-text" size={32} color={T.primary} />
          </View>
          <Text style={s.heroTitle}>PDF prêt à imprimer</Text>
          <Text style={s.heroSub}>Contrôle de Maths · Maxime · CM2</Text>
        </LinearGradient>

        <Text style={s.sectionLabel}>CONTENU DU PDF</Text>
        <Card pad={8}>
          {SECTIONS.map((sec, i) => (
            <View key={i} style={[s.sectionRow, i < SECTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.line }]}>
              <Ionicons name={sec.icon as any} size={20} color={T.primary} style={{ marginRight: 13 }} />
              <Text style={s.sectionText}>{sec.label}</Text>
              <Ionicons name="checkmark" size={18} color={T.green.solid} />
            </View>
          ))}
        </Card>

        <View style={s.infoBox}>
          <Ionicons name="print-outline" size={19} color={T.blue.fg} />
          <Text style={s.infoText}>
            Imprimez en format A4. Idéal pour réviser sans écran.
          </Text>
        </View>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => {}} icon={<Ionicons name="download-outline" size={20} color="#fff" />}>
          Télécharger le PDF
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => {}} icon={<Ionicons name="share-outline" size={19} color={T.ink} />}>
            Partager
          </GhostBtn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  hero: { borderRadius: 24, padding: 24, marginTop: 16, alignItems: 'center' },
  pdfIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: -0.4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.sub, marginTop: 20, marginBottom: 11, marginLeft: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  sectionText: { flex: 1, fontSize: 15, fontWeight: '600', color: T.ink },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.blue.soft, borderRadius: 15, padding: 13, marginTop: 14 },
  infoText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: T.blue.fg, lineHeight: 19 },
});
