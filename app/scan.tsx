import React, { useState } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { TopBar } from '../components/ui/TopBar';

const TIPS = ['Utilisez une bonne lumière', 'Cadrez toute la page', 'Évitez les photos floues'];

export default function ScanScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  const capture = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); router.push('/result'); }, 2100);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.green.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>IA</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Scanner une leçon</Text>
          <Text style={s.sub}>Prenez une photo claire de la leçon de votre enfant.</Text>
        </View>

        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.viewfinder}>
          <View style={s.viewfinderInner}>
            {/* paper lines decoration */}
            <View style={s.paperLines}>
              {[...Array(7)].map((_, i) => (
                <View key={i} style={[s.paperLine, { width: i % 3 === 2 ? '55%' : '100%', opacity: 0.1 }]} />
              ))}
            </View>

            <Ionicons name="scan-outline" size={48} color="rgba(255,255,255,0.8)" />
            <Text style={s.viewfinderText}>
              {scanning ? 'Analyse en cours…' : 'Placez la leçon dans le cadre'}
            </Text>

            {scanning && (
              <View style={s.scanLine} />
            )}
          </View>
        </LinearGradient>

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
        <Btn full onPress={capture} loading={scanning} icon={!scanning ? <Ionicons name="camera-outline" size={20} color="#fff" /> : undefined}>
          {scanning ? 'Analyse…' : 'Prendre une photo'}
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => router.push('/result')} icon={<Ionicons name="images-outline" size={19} color={T.ink} />}>
            Importer depuis la galerie
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
  header: { marginTop: 18, marginBottom: 20 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: T.sub, marginTop: 8, fontWeight: '500' },
  viewfinder: { borderRadius: 26, padding: 12 },
  viewfinderInner: { borderRadius: 18, aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', gap: 14, position: 'relative' },
  paperLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 26 },
  paperLine: { height: 2, backgroundColor: '#fff', borderRadius: 2, marginVertical: 8 },
  viewfinderText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 15, letterSpacing: -0.2 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: T.primary, shadowColor: T.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, top: '50%' },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  tipCheck: { width: 26, height: 26, borderRadius: 999, backgroundColor: T.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipText: { fontSize: 14.5, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },
});
