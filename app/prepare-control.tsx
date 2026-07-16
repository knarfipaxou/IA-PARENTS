import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DK, DK_ICONS } from '../constants/darkTheme';
import { useChild } from '../contexts/ChildContext';


export default function PrepareControl() {
  const router = useRouter();
  const { child } = useChild();

  const OPTIONS = [
    {
      img: DK_ICONS.scan,
      glow: DK.green,
      border: 'rgba(52,214,150,0.45)',
      title: 'Par photo',
      sub: "Photo de l'énoncé ou du sujet",
      route: '/scan',
    },
    {
      img: DK_ICONS.pencil,
      glow: DK.blue,
      border: 'rgba(90,140,255,0.45)',
      title: 'Manuel',
      sub: 'Date, matière et notions',
      route: '/manual-deadline',
    },
  ];

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
              <Text style={s.title}>Préparer un contrôle</Text>
              <Text style={s.sub}>Pour {child ? child.name : "l'enfant"} • choisissez le mode</Text>
            </View>
            <Image source={DK_ICONS.trophy} style={s.headIcon} />
          </View>

          <Text style={s.sectionLabel}>COMMENT AJOUTER L'ÉCHÉANCE ?</Text>

          <View style={s.optionsList}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.route}
                onPress={() => router.push(opt.route as any)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[s.optionRow, { borderColor: opt.border }]}
                >
                  <Image source={opt.img} style={[s.optionIcon, { shadowColor: opt.glow }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.optionTitle}>{opt.title}</Text>
                    <Text style={s.optionSub}>{opt.sub}</Text>
                  </View>
                  <View style={[s.chevron, { borderColor: opt.border }]}>
                    <Ionicons name="chevron-forward" size={14} color={DK.ink} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info plan de révision */}
          <LinearGradient
            colors={['rgba(53,228,210,0.1)', 'rgba(148,168,255,0.05)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.infoBox}
          >
            <Ionicons name="information-circle-outline" size={19} color={DK.cyan} />
            <Text style={s.infoText}>
              L'échéance sera rattachée à {child ? child.name : 'cet enfant'} et déclenchera un plan de révision
              du type <Text style={{ color: DK.cyan, fontWeight: '800' }}>J-8 → Jour J</Text> : fiche, QCM,
              missions de maîtrise ciblées, devoir blanc complet, relecture le matin du jour J.
            </Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 8 },
  backCircle: {
    width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  sub: { fontSize: 12.5, color: DK.sub, fontWeight: '600', marginTop: 2 },
  headIcon: {
    width: 44, height: 44,
    shadowColor: DK.violet, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
  },

  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(200,210,255,0.55)',
    marginTop: 14, marginBottom: 10, marginLeft: 4,
  },

  optionsList: { gap: 12 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 22, padding: 16,
  },
  optionIcon: {
    width: 54, height: 54,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 13,
  },
  optionTitle: { fontWeight: '800', fontSize: 16.5, color: DK.ink, letterSpacing: -0.3 },
  optionSub: { fontSize: 13, color: DK.sub, fontWeight: '500', marginTop: 2 },
  chevron: {
    width: 28, height: 28, borderRadius: 999, borderWidth: 1,
    backgroundColor: 'rgba(10,14,34,0.45)', alignItems: 'center', justifyContent: 'center',
  },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 18, padding: 14, marginTop: 18,
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: '600', color: DK.sub, lineHeight: 20 },
});
