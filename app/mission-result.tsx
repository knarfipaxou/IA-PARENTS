import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { HC, FONT } from '../constants/handoff';
import { PhysicalButton } from '../components/ui/PhysicalButton';
import { Kitsune } from '../components/ui/Kitsune';

type Stat = { v: string; l: string; color: string };
const STATS: Stat[] = [
  { v: '4/4', l: 'étapes', color: HC.greenLight },
  { v: '90%', l: 'réussite', color: HC.cyan },
  { v: '+15', l: 'XP gagnés', color: HC.amber },
];

/** Résultat de mission — style handoff Kitsune (écran « missionResult »). */
export default function MissionResult() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#10403A', HC.bgApp]} locations={[0, 0.62]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={s.body}>
          <Kitsune width={176} move="hop" tick={1} />
          <Text style={s.title}>Mission réussie&nbsp;!</Text>
          <Text style={s.sub}>Tu sais maintenant comparer des fractions. Continue comme ça&nbsp;!</Text>

          <View style={s.streak}>
            <Text style={s.streakText}>🔥 6 jours d'affilée</Text>
          </View>

          <View style={s.statsRow}>
            {STATS.map((st, i) => (
              <View key={i} style={s.stat}>
                <Text style={[s.statV, { color: st.color }]}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>

          <View style={s.noteCard}>
            <Text style={s.noteTxt}>
              Une erreur sur la droite graduée. Kitsune la reproposera demain.
            </Text>
          </View>
        </View>

        <View style={s.btns}>
          <PhysicalButton label="CONTINUER" variant="enfant" onPress={() => router.replace('/(child-tabs)/espace' as any)} />
          <Pressable onPress={() => router.push('/(child-tabs)/echeances' as any)} style={s.ghostBtn}>
            <Text style={s.ghostBtnText}>Voir les échéances</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: HC.cyan, fontFamily: FONT.title, fontSize: 30, marginTop: 10, textAlign: 'center' },
  sub: { color: HC.sub, fontFamily: FONT.body, fontSize: 15, marginTop: 8, maxWidth: 300, lineHeight: 22, textAlign: 'center' },
  streak: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, marginTop: 20,
  },
  streakText: { color: HC.ink, fontFamily: FONT.num, fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 11, marginTop: 22, width: '100%', maxWidth: 360 },
  stat: {
    flex: 1, backgroundColor: '#1B2238', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, paddingVertical: 16, alignItems: 'center', gap: 5,
  },
  statV: { fontFamily: FONT.title, fontSize: 24 },
  statL: { color: '#5C6B8F', fontFamily: FONT.body, fontSize: 11.5 },
  noteCard: {
    width: '100%', maxWidth: 360, marginTop: 16,
    backgroundColor: 'rgba(255,176,32,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,176,32,0.28)',
    borderRadius: 20, padding: 16,
  },
  noteTxt: { color: HC.ink, fontFamily: FONT.num, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  btns: { paddingHorizontal: 18, paddingBottom: 30, gap: 10 },
  ghostBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 15, alignItems: 'center' },
  ghostBtnText: { color: HC.ink, fontFamily: FONT.num, fontSize: 15.5 },
});
