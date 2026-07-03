import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../constants/theme';
import { Btn } from '../components/ui/Btn';
import type { AccentKey } from '../constants/theme';

type Stat = { v: string; l: string; icon: string; a: AccentKey };

const STATS: Stat[] = [
  { v: '4/4', l: 'étapes', icon: 'checkmark-done-outline', a: 'green' },
  { v: '90%', l: 'réussite', icon: 'ribbon-outline', a: 'blue' },
  { v: '+15', l: 'points', icon: 'star-outline', a: 'amber' },
];

export default function MissionResult() {
  const router = useRouter();

  return (
    <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.body}>
          {/* Trophy */}
          <View style={s.trophyBox}>
            <View style={s.trophyBg}>
              <Ionicons name="trophy" size={62} color={T.amber.solid} />
            </View>
            <View style={s.sparkTL}>
              <Ionicons name="sparkles" size={28} color={T.primary} />
            </View>
            <View style={s.sparkBR}>
              <Ionicons name="sparkles" size={22} color={T.primary} />
            </View>
          </View>

          <Text style={s.title}>Mission terminée !</Text>
          <Text style={s.sub}>
            Tu sais maintenant comparer des fractions. Continue comme ça 💪
          </Text>

          {/* Streak */}
          <View style={s.streak}>
            <Ionicons name="flame" size={20} color={T.amber.solid} />
            <Text style={s.streakText}>6 jours d'affilée</Text>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {STATS.map((st, i) => (
              <View key={i} style={s.stat}>
                <Ionicons name={st.icon as any} size={24} color={T[st.a].solid} style={{ marginBottom: 7 }} />
                <Text style={s.statV}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View style={s.btns}>
          <Btn onPress={() => router.replace('/(child-tabs)/espace' as any)} full icon={<Ionicons name="home-outline" size={19} color="#fff" />} iconRight>
            Retour à l'espace
          </Btn>
          <TouchableOpacity
            onPress={() => router.push('/(child-tabs)/echeances' as any)}
            style={s.ghostBtn}
          >
            <Text style={s.ghostBtnText}>Voir les échéances</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, textAlign: 'center' as const },
  trophyBox: { position: 'relative', marginBottom: 8 },
  trophyBg: {
    width: 116, height: 116, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  sparkTL: { position: 'absolute', top: -6, right: -8 },
  sparkBR: { position: 'absolute', top: 10, left: -10 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginTop: 18, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.72)', fontSize: 15.5, fontWeight: '500', marginTop: 8, maxWidth: 280, lineHeight: 22, textAlign: 'center' },
  streak: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, marginTop: 22,
  },
  streakText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 11, marginTop: 26, width: '100%', maxWidth: 340 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, alignItems: 'center' },
  statV: { color: '#fff', fontSize: 21, fontWeight: '800', lineHeight: 24 },
  statL: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  btns: { paddingHorizontal: 18, paddingBottom: 30, gap: 10 },
  ghostBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 15,
    alignItems: 'center',
  },
  ghostBtnText: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
});
