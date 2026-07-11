import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
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
      router.push('/agenda-validate' as any);
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
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={s.headRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color="#B9C6FF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Scanner l'agenda</Text>
              <Text style={s.sub}>Photo nette de l'agenda ou du cahier de texte</Text>
            </View>
            <Image source={DK_ICONS.agenda} style={s.headIcon} />
          </View>

          {/* Viseur */}
          <LinearGradient colors={['#060915', '#0B1128']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.viewfinder}>
            <View style={s.pagePreview}>
              <View style={[s.pageLine, { top: 12, left: 10, right: 10, backgroundColor: 'rgba(200,212,255,0.35)' }]} />
              <View style={[s.pageLine, { top: 22, left: 10, right: 10, backgroundColor: 'rgba(200,212,255,0.25)' }]} />
              <View style={[s.pageLine, { top: 32, left: 10, right: 18, backgroundColor: 'rgba(200,212,255,0.25)' }]} />
              <View style={[s.pageLine, { top: 48, left: 10, right: 10, backgroundColor: 'rgba(53,228,210,0.5)' }]} />
              <View style={[s.pageLine, { top: 58, left: 10, right: 22, backgroundColor: 'rgba(53,228,210,0.35)' }]} />
            </View>
            <View style={{ flex: 1 }}>
              {scanning ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color={DK.cyan} />
                  <Text style={s.viewfinderText}>Lecture de l'agenda par l'IA…</Text>
                </View>
              ) : (
                <Text style={s.viewfinderText}>
                  Prenez une photo de l'agenda, l'IA détecte les <Text style={{ color: DK.ink, fontWeight: '800' }}>contrôles et devoirs</Text>.
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Conseils */}
          <Text style={s.sectionLabel}>CONSEILS POUR UNE BONNE LECTURE</Text>
          <View style={s.tipsCard}>
            {TIPS.map((tip, i) => (
              <View key={tip} style={[s.tip, i < TIPS.length - 1 && s.tipBorder]}>
                <View style={s.tipCheck}>
                  <Ionicons name="checkmark" size={14} color="#052A26" />
                </View>
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={{ minHeight: 24, flex: 1 }} />

          {/* Actions */}
          <TouchableOpacity onPress={() => capture(false)} disabled={scanning} activeOpacity={0.88}>
            <LinearGradient colors={['#1FB8A8', '#35E4D2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cta}>
              {scanning
                ? <ActivityIndicator color="#052A26" />
                : <Ionicons name="camera-outline" size={19} color="#052A26" />}
              <Text style={s.ctaText}>{scanning ? 'Lecture…' : 'Prendre une photo'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { if (!scanning) capture(true); }} style={s.ghostBtn} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={18} color="#B9C6FF" />
            <Text style={s.ghostBtnText}>Importer depuis la galerie</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32, flexGrow: 1 },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 16 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  headIcon: {
    width: 44, height: 44,
    shadowColor: DK.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
  },

  viewfinder: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(148,168,255,0.2)',
    padding: 16, minHeight: 120,
  },
  pagePreview: {
    width: 74, height: 88, borderRadius: 10, backgroundColor: 'rgba(230,235,250,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.3)', overflow: 'hidden',
  },
  pageLine: { position: 'absolute', height: 3, borderRadius: 2 },
  viewfinderText: { color: 'rgba(210,220,255,0.65)', fontSize: 13, fontWeight: '500', lineHeight: 19 },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)',
    marginTop: 22, marginBottom: 10, marginLeft: 4,
  },
  tipsCard: {
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2,
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(148,168,255,0.12)' },
  tipCheck: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: DK.cyan,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  tipText: { fontSize: 14, fontWeight: '600', color: DK.ink, letterSpacing: -0.2 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderRadius: 999, paddingVertical: 15,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6,
  },
  ctaText: { color: '#052A26', fontSize: 15, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.3)', borderRadius: 999,
    paddingVertical: 13, marginTop: 10,
  },
  ghostBtnText: { color: '#B9C6FF', fontSize: 14, fontWeight: '700' },
});
