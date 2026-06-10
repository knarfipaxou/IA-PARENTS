import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn, GhostBtn } from '../components/ui/Btn';
import { Card } from '../components/ui/Card';
import { TopBar } from '../components/ui/TopBar';
import { useChild } from '../contexts/ChildContext';
import { pickImage, pickFromLibrary } from '../lib/camera';
import { analyzeAgenda, AiError } from '../services/ai';

const TIPS = ['Bonne lumière, sans reflet', 'Cadrez la semaine entière', 'Texte bien lisible'];

export default function ScanAgendaScreen() {
  const router = useRouter();
  const { child, saveGenerated } = useChild();
  const [scanning, setScanning] = useState(false);

  const capture = async (fromLibrary = false) => {
    if (!child) {
      Alert.alert('Aucun enfant sélectionné', "Sélectionnez d'abord un enfant depuis l'accueil.");
      return;
    }
    const base64 = fromLibrary ? await pickFromLibrary() : await pickImage();
    if (!base64) return;
    setScanning(true);
    try {
      const result = await analyzeAgenda(base64, child);
      saveGenerated(child.id, 'devoirs', result.devoirs ?? []);
      setScanning(false);
      router.push('/agenda-results');
    } catch (e) {
      setScanning(false);
      if (e instanceof AiError && e.code === 'NO_KEY') {
        Alert.alert('Clé API manquante', 'Ajoutez votre clé API dans Réglages.');
      } else {
        const msg = e instanceof Error ? e.message : 'Erreur inattendue.';
        Alert.alert('Lecture impossible', msg, [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: () => capture(fromLibrary) },
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.blue.solid, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>IA</Text>
          </View>
        } />

        <View style={s.header}>
          <Text style={s.title}>Scanner l'agenda</Text>
          <Text style={s.sub}>Prenez une photo nette de l'agenda ou du cahier de texte.</Text>
        </View>

        <LinearGradient colors={['#1E2C66', '#121A40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.viewfinder}>
          <View style={s.viewfinderInner}>
            <View style={s.agendaLines}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={s.agendaLine} />
              ))}
            </View>
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.8)" />
            <Text style={s.viewfinderText}>
              {scanning ? "Lecture de l'agenda…" : "Placez l'agenda dans le cadre"}
            </Text>
          </View>
        </LinearGradient>

        <Card pad={6} style={{ marginTop: 16 }}>
          {TIPS.map((tip, i) => (
            <View key={tip} style={[s.tip, i < TIPS.length - 1 && s.tipBorder]}>
              <View style={[s.tipCheck, { backgroundColor: T.blue.soft }]}>
                <Ionicons name="checkmark" size={15} color={T.blue.fg} />
              </View>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        <View style={{ minHeight: 24 }} />
        <Btn
          full
          onPress={() => capture(false)}
          color={T.blue.solid} deep="#2C44AE"
          loading={scanning}
          icon={!scanning ? <Ionicons name="camera-outline" size={20} color="#fff" /> : undefined}
        >
          {scanning ? 'Lecture…' : 'Prendre une photo'}
        </Btn>
        <View style={{ marginTop: 10 }}>
          <GhostBtn full onPress={() => { if (!scanning) capture(true); }} icon={<Ionicons name="images-outline" size={19} color={T.ink} />}>
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
  agendaLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 26, gap: 8, justifyContent: 'center' },
  agendaLine: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  viewfinderText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 15, letterSpacing: -0.2 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: T.line },
  tipCheck: { width: 26, height: 26, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipText: { fontSize: 14.5, fontWeight: '600', color: T.ink, letterSpacing: -0.2 },
});
