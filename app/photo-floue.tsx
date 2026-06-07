import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Squircle } from '../components/ui/Squircle';
import { TopBar } from '../components/ui/TopBar';

const TIPS = ['Tenez le téléphone bien à plat', 'Évitez les ombres et reflets', 'Approchez-vous du texte'];

export default function PhotoFloueScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <View style={s.header}>
          <Squircle accentKey="coral" icon={<Ionicons name="alert-circle-outline" size={24} color={T.coral.fg} />} size={44} r={14} style={{ marginBottom: 10 }} />
          <Text style={s.title}>Photo difficile à lire</Text>
          <Text style={s.sub}>La photo semble floue ou incomplète. Voici les zones à reprendre.</Text>
        </View>

        {/* Mock page with blur zone */}
        <View style={s.pagePreview}>
          <View style={s.pageInner}>
            {[100, 85, 92, 70].map((w, i) => (
              <View key={i} style={[s.pageLine, { width: `${w}%` }]} />
            ))}
            <View style={s.blurZone}>
              {[60, 48].map((w, i) => (
                <View key={i} style={[s.pageLine, s.pageLineBlur, { width: `${w}%` }]} />
              ))}
              <View style={s.blurBorder}>
                <View style={s.blurBadge}>
                  <Text style={s.blurBadgeText}>Flou</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Card pad={6} style={{ marginTop: 16 }}>
          {TIPS.map((tip, i) => (
            <View key={tip} style={[s.tip, i < TIPS.length - 1 && s.tipBorder]}>
              <View style={s.tipCheck}>
                <Ionicons name="checkmark" size={15} color={T.primaryDeep} />
              </View>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        <View style={{ minHeight: 24 }} />
        <Btn full onPress={() => router.push('/scan')} icon={<Ionicons name="camera-outline" size={20} color="#fff" />}>
          Reprendre la photo
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => router.push('/scan')} icon={<Ionicons name="images-outline" size={19} color={T.ink} />}>
            Importer une autre image
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
  header: { marginTop: 18 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 6, fontWeight: '500', lineHeight: 22, marginBottom: 16 },
  pagePreview: { borderRadius: 22, padding: 14, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.line },
  pageInner: { borderRadius: 14, backgroundColor: T.surface, padding: 16, borderWidth: 1, borderColor: T.line },
  pageLine: { height: 9, backgroundColor: T.lineStrong, borderRadius: 4, marginVertical: 6 },
  pageLineBlur: { opacity: 0.7 },
  blurZone: { marginTop: 8, position: 'relative' },
  blurBorder: { position: 'absolute', top: -8, left: -10, right: -10, bottom: -8, borderRadius: 12, borderWidth: 2, borderColor: T.coral.solid, backgroundColor: 'rgba(240,101,76,0.08)', alignItems: 'flex-end', justifyContent: 'flex-start' },
  blurBadge: { backgroundColor: T.coral.solid, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, transform: [{ translateY: -8 }] },
  blurBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  tipCheck: { width: 26, height: 26, borderRadius: 999, backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipText: { fontSize: 14.5, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },
});
