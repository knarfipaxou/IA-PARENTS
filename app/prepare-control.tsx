import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { TopBar } from '../components/ui/TopBar';
import { Squircle } from '../components/ui/Squircle';
import { useChild } from '../contexts/ChildContext';

export default function PrepareControl() {
  const router = useRouter();
  const { child } = useChild();

  const OPTIONS = [
    {
      accentKey: 'green' as const,
      iconName: 'camera-outline',
      title: 'Scanner la consigne',
      sub: "Photo de l'énoncé ou du sujet",
      route: '/scan',
    },
    {
      accentKey: 'blue' as const,
      iconName: 'create-outline',
      title: 'Saisir manuellement',
      sub: 'Date, matière et notions',
      route: '/manual-deadline',
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <Text style={s.title}>Préparer un contrôle</Text>
        <Text style={s.sub}>
          Pour {child ? child.name : "l'enfant"} · choisissez comment ajouter l'échéance.
        </Text>

        <View style={s.optionsList}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.route}
              onPress={() => router.push(opt.route as any)}
              style={s.optionRow}
              activeOpacity={0.88}
            >
              <Squircle
                accentKey={opt.accentKey}
                size={52}
                icon={<Ionicons name={opt.iconName as any} size={26} color={T[opt.accentKey].fg} />}
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.optionTitle}>{opt.title}</Text>
                <Text style={s.optionSub}>{opt.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={T.faint} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.infoBox}>
          <Ionicons name="information-circle-outline" size={19} color={T.primaryDeep} />
          <Text style={s.infoText}>
            L'échéance sera rattachée à {child ? child.name : 'cet enfant'} et déclenchera un planning de révision.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: T.ink, letterSpacing: -0.5, marginTop: 14 },
  sub: { fontSize: 14, color: T.sub, fontWeight: '500', marginTop: 6, marginBottom: 20, lineHeight: 20 },
  optionsList: { gap: 13 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 22, padding: 16,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  optionTitle: { fontWeight: '800', fontSize: 16.5, color: T.ink, letterSpacing: -0.3 },
  optionSub: { fontSize: 13.5, color: T.sub, fontWeight: '500', marginTop: 2 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: T.primarySoft, borderRadius: 15, padding: 13, marginTop: 18,
  },
  infoText: { flex: 1, fontSize: 13.5, fontWeight: '600', color: T.primaryDeep, lineHeight: 20 },
});
