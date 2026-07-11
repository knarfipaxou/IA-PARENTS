import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';

const STEPS = ['Rappel de la leçon', 'Reconnaître une fraction', 'Comparer deux fractions', 'Petit défi final'];

export default function MissionScreen() {
  const router = useRouter();
  const { child } = useChild();

  const missionTitle = child?.kind === 'college' ? child.mission?.notion ?? 'Mission du jour' : child?.activity?.label ?? 'Activité du jour';
  const missionMin = child?.kind === 'college' ? child.mission?.min : child?.activity?.min;
  const missionObj = child?.kind === 'college' ? child.mission?.obj : child?.activity?.obj;

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Nav retour */}
          <TouchableOpacity onPress={() => router.back()} style={s.backCircle} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color="#B9C6FF" />
          </TouchableOpacity>

          {/* En-tête mission */}
          <View style={s.headRow}>
            <Image source={DK_ICONS.target} style={s.headIcon} />
            <View style={{ flex: 1 }}>
              <Text style={s.headLabel}>MISSION DU JOUR</Text>
              <Text style={s.headTitle} numberOfLines={2}>{missionTitle}</Text>
            </View>
            <View style={s.minChip}>
              <Ionicons name="time-outline" size={13} color={DK.ink} />
              <Text style={s.minChipText}>{missionMin ?? 20} min</Text>
            </View>
          </View>

          {/* Étape 1 — active (rappel de cours) */}
          <LinearGradient
            colors={['rgba(35,80,110,0.45)', 'rgba(19,26,58,0.65)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.activeCard}
          >
            <View style={s.stepHead}>
              <View style={s.stepNumOn}>
                <Text style={s.stepNumOnText}>1</Text>
              </View>
              <Text style={s.stepTitleOn}>{STEPS[0]}</Text>
              <Text style={s.stepMeta}>5 min</Text>
            </View>
            <Text style={s.activeText}>
              Objectif : <Text style={{ color: DK.ink, fontWeight: '800' }}>{missionObj ?? 'Comparer des fractions'}</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/mission-rappel' as any)} activeOpacity={0.88}>
              <LinearGradient colors={['#1FB8A8', '#35E4D2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.stepCta}>
                <Text style={s.stepCtaText}>Commencer →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          {/* Étapes suivantes — inactives */}
          {STEPS.slice(1).map((step, i) => (
            <View key={step} style={s.dimCard}>
              <View style={s.stepHead}>
                <View style={s.stepNumOff}>
                  <Text style={s.stepNumOffText}>{i + 2}</Text>
                </View>
                <Text style={s.stepTitleOff}>{step}</Text>
              </View>
            </View>
          ))}

          {/* Résultat / XP */}
          <View style={s.dimCard}>
            <View style={s.stepHead}>
              <View style={s.stepNumOff}>
                <Text style={s.stepNumOffText}>{STEPS.length + 1}</Text>
              </View>
              <Text style={s.stepTitleOff}>Résultat</Text>
              <View style={s.xpPill}>
                <Text style={s.xpPillText}>+15 XP à gagner</Text>
              </View>
            </View>
            <Text style={s.dimHint}>Ton score et tes XP s'affichent à la fin de la mission.</Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },

  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
  },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  headIcon: {
    width: 60, height: 60,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 14,
  },
  headLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: DK.cyan },
  headTitle: { fontSize: 21, fontWeight: '800', color: DK.ink, letterSpacing: -0.4, marginTop: 2 },
  minChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(10,14,34,0.7)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  minChipText: { color: DK.ink, fontSize: 11.5, fontWeight: '700' },

  activeCard: {
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.45)', borderRadius: 24,
    padding: 16, marginTop: 20,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 24,
  },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNumOn: {
    width: 28, height: 28, borderRadius: 999, backgroundColor: DK.cyan,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  stepNumOnText: { color: '#052A26', fontSize: 13, fontWeight: '800' },
  stepTitleOn: { flex: 1, fontSize: 14.5, fontWeight: '800', color: DK.cyan },
  stepMeta: { fontSize: 11, fontWeight: '800', color: 'rgba(210,220,255,0.55)' },
  activeText: { fontSize: 13, lineHeight: 21, marginTop: 10, color: 'rgba(230,236,255,0.9)', fontWeight: '500' },
  stepCta: {
    alignItems: 'center', borderRadius: 999, paddingVertical: 12, marginTop: 12,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 5,
  },
  stepCtaText: { color: '#052A26', fontSize: 13.5, fontWeight: '800' },

  dimCard: {
    backgroundColor: 'rgba(19,26,58,0.5)', borderWidth: 1, borderColor: 'rgba(148,168,255,0.18)',
    borderRadius: 24, padding: 16, marginTop: 12,
  },
  stepNumOff: {
    width: 28, height: 28, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumOffText: { color: '#B9C6FF', fontSize: 12, fontWeight: '800' },
  stepTitleOff: { flex: 1, fontSize: 14.5, fontWeight: '800', color: 'rgba(230,236,255,0.85)' },
  dimHint: { fontSize: 12, color: 'rgba(210,220,255,0.6)', fontWeight: '500', marginTop: 8 },

  xpPill: {
    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,194,75,0.45)',
    backgroundColor: 'rgba(255,194,75,0.1)', paddingHorizontal: 11, paddingVertical: 5,
  },
  xpPillText: { fontSize: 11.5, fontWeight: '800', color: '#FFC24B' },
});
