import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';
import { pickImage, pickFromLibrary } from '../lib/camera';
import { analyzeLesson, AiError } from '../services/ai';

const TIPS = ['Utilisez une bonne lumière', 'Cadrez toute la page', 'Évitez les photos floues'];

export default function ScanScreen() {
  const router = useRouter();
  const { child, addLesson, addXP } = useChild();
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
      const result = await analyzeLesson(base64, child);
      // auto-save: the lesson is persisted immediately so it never disappears
      const lesson = addLesson({
        childId: child.id,
        matiere: result.matiere,
        titre: result.titre,
        niveau: result.niveau,
        notions: result.notions ?? [],
        resume: result.resume,
        imageBase64: base64.length < 1500000 ? base64 : undefined,
      });
      addXP(child.id, 10, 'lesson_scan');
      setScanning(false);
      router.push(`/result?lessonId=${lesson.id}` as any);
    } catch (e) {
      setScanning(false);
      if (e instanceof AiError && e.code === 'NO_KEY') {
        Alert.alert('Clé API manquante', 'Ajoutez votre clé API dans Réglages.');
      } else {
        const msg = e instanceof Error ? e.message : 'Erreur inattendue.';
        Alert.alert("Analyse impossible", msg, [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: () => capture(fromLibrary) },
        ]);
      }
    }
  };

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        <StatusBar style="light" />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* nav */}
          <View style={s.navRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={19} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Scanner une leçon</Text>
              <Text style={s.sub}>Cadrez la page du cahier</Text>
            </View>
            <View style={s.iaPill}>
              <Ionicons name="sparkles" size={13} color={DK.cyan} />
              <Text style={s.iaPillText}>IA</Text>
            </View>
          </View>

          {/* viseur */}
          <LinearGradient colors={['#060915', '#0B1128']} style={s.viewfinder}>
            {/* coins cyan */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
            {/* ligne de scan */}
            <View style={s.scanLine} />
            <View style={s.viewfinderCenter}>
              <Image source={DK_ICONS.scan} style={s.scanIcon} />
              <Text style={s.viewfinderText}>
                {scanning ? 'Analyse en cours…' : "Placez la leçon dans le cadre,\nl'IA détecte le texte"}
              </Text>
              {scanning && <ActivityIndicator color={DK.cyan} style={{ marginTop: 10 }} />}
            </View>
          </LinearGradient>

          {/* conseils */}
          <View style={s.tipsCard}>
            {TIPS.map((tip, i) => (
              <View key={tip} style={[s.tip, i < TIPS.length - 1 && s.tipBorder]}>
                <View style={s.tipCheck}>
                  <Ionicons name="checkmark" size={15} color={DK.cyan} />
                </View>
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={{ minHeight: 22 }} />

          {/* bouton principal */}
          <TouchableOpacity onPress={() => capture(false)} disabled={scanning} activeOpacity={0.88}>
            <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtn}>
              {scanning
                ? <ActivityIndicator color="#052A26" />
                : <Ionicons name="camera-outline" size={20} color="#052A26" />}
              <Text style={s.primaryBtnText}>{scanning ? 'Analyse…' : 'Prendre une photo'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* import galerie */}
          <TouchableOpacity onPress={() => { if (!scanning) capture(true); }} style={s.ghostBtn} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={18} color="#DDE4FF" />
            <Text style={s.ghostBtnText}>Importer depuis la galerie</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CORNER = {
  position: 'absolute' as const,
  width: 34,
  height: 34,
  borderColor: DK.cyan,
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 18 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  sub: { fontSize: 12.5, color: DK.sub, marginTop: 2, fontWeight: '600' },
  iaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.09)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  iaPillText: { color: DK.cyan, fontSize: 12.5, fontWeight: '800' },

  viewfinder: {
    height: 400, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(148,168,255,0.2)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  corner: { ...CORNER, borderRadius: 2 },
  cornerTL: { left: 22, top: 22, borderLeftWidth: 3.5, borderTopWidth: 3.5, borderTopLeftRadius: 8 },
  cornerTR: { right: 22, top: 22, borderRightWidth: 3.5, borderTopWidth: 3.5, borderTopRightRadius: 8 },
  cornerBL: { left: 22, bottom: 22, borderLeftWidth: 3.5, borderBottomWidth: 3.5, borderBottomLeftRadius: 8 },
  cornerBR: { right: 22, bottom: 22, borderRightWidth: 3.5, borderBottomWidth: 3.5, borderBottomRightRadius: 8 },
  scanLine: {
    position: 'absolute', left: 24, right: 24, top: '52%', height: 2, backgroundColor: DK.cyan,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16,
  },
  viewfinderCenter: { alignItems: 'center' },
  scanIcon: {
    width: 64, height: 64, borderRadius: 14, opacity: 0.9,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 14,
  },
  viewfinderText: {
    color: 'rgba(200,212,255,0.55)', fontWeight: '600', fontSize: 12.5,
    marginTop: 10, maxWidth: 210, textAlign: 'center', lineHeight: 18,
  },

  tipsCard: {
    marginTop: 16, backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 6,
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(148,168,255,0.12)' },
  tipCheck: {
    width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(53,228,210,0.12)',
    borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tipText: { fontSize: 14.5, fontWeight: '600', color: DK.ink, letterSpacing: -0.2 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 999, paddingVertical: 16,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8,
  },
  primaryBtnText: { color: '#052A26', fontSize: 15.5, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingVertical: 14, marginTop: 10,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },
});
