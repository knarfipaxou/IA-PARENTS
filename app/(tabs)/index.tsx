import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DK } from '../../constants/darkTheme';
import { HC, FONT } from '../../constants/handoff';
import { Starfield } from '../../components/Starfield';
import { AvatarRing } from '../../components/AvatarRing';
import { Breathe } from '../../components/anim/Breathe';
import { useChild } from '../../contexts/ChildContext';
import { logout } from '../../lib/auth';
import { upcomingDeadlines } from '../../lib/deadlines';
import { type Child } from '../../types/childProfile';

const AVATAR_DEFAULT = require('../../assets/home/avatar.png');

/** Sélecteur de profil « Choisir un enfant » — point d'entrée après connexion. */
export default function ChildPicker() {
  const router = useRouter();
  const { setChild, children: allChildren } = useChild();
  const children = allChildren.filter((c) => !c.archived);

  const urgentCount = children.reduce(
    (acc, c) => acc + upcomingDeadlines(c.echeances ?? []).filter((e) => e.days <= 7).length, 0);

  function openChild(c: Child) {
    setChild(c);
    router.push('/(child-tabs)/espace' as any);
  }

  async function signOut() {
    await logout();
    router.replace('/(onboarding)/welcome' as any);
  }

  return (
    <LinearGradient colors={[HC.gradTop, HC.gradBottom]} locations={[0, 0.6]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <Starfield />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* réglages + alertes */}
          <View style={s.topRow}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings' as any)}
              style={s.circleBtn} activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={21} color="#DDE4FF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/notifications' as any)}
              style={s.circleBtn} activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={21} color="#DDE4FF" />
              {urgentCount > 0 && <View style={s.bellDot} />}
            </TouchableOpacity>
          </View>

          <Text style={s.title}>Choisir un enfant</Text>
          <Text style={s.sub}>Sélectionnez un profil pour accéder{'\n'}au tableau de bord.</Text>

          {/* cartes enfants */}
          <View style={{ gap: 16, marginTop: 30 }}>
            {children.map((c, i) => {
              const proches = upcomingDeadlines(c.echeances ?? []).filter((e) => e.days <= 7).length;
              return (
                <Animated.View key={c.id} entering={FadeInDown.delay(i * 90).springify().damping(16)}>
                  <TouchableOpacity onPress={() => openChild(c)} style={s.childCard} activeOpacity={0.88}>
                    <Breathe>
                      <View style={s.avatarWrap}>
                        <Image
                          source={c.photoUri ? { uri: c.photoUri } : AVATAR_DEFAULT}
                          style={s.avatar}
                        />
                        <AvatarRing size={128} teal={DK.cyan} track="rgba(53,228,210,0.3)" />
                        <View style={s.starBadge}>
                          <Ionicons name="star" size={13} color="#fff" />
                        </View>
                      </View>
                    </Breathe>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={s.childName}>{c.name}</Text>
                      <Text style={s.childMeta}>
                        <Text style={{ color: DK.cyan, fontWeight: '800' }}>{c.classe}</Text>
                        <Text style={{ color: DK.sub }}>  •  {c.age} ans</Text>
                      </Text>
                      {proches > 0 && (
                        <View style={s.deadlinePill}>
                          <Ionicons name="time-outline" size={13} color={DK.cyan} />
                          <Text style={s.deadlinePillText}>
                            {proches} échéance{proches > 1 ? 's' : ''} proche{proches > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={DK.sub} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* ajouter un enfant */}
          <TouchableOpacity
            onPress={() => router.push('/add-child' as any)}
            style={s.addCard} activeOpacity={0.85}
          >
            <View style={s.addIcon}>
              <Ionicons name="add" size={30} color={DK.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.addTitle}>Ajouter un enfant</Text>
              <Text style={s.addSub}>Créer un nouveau profil</Text>
            </View>
          </TouchableOpacity>

          {/* déconnexion */}
          <TouchableOpacity onPress={signOut} style={s.logoutRow} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={19} color={DK.sub} />
            <Text style={s.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 22, paddingBottom: 36 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 6 },
  circleBtn: {
    width: 52, height: 52, borderRadius: 999, backgroundColor: 'rgba(148,168,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 12, right: 13, width: 9, height: 9,
    borderRadius: 999, backgroundColor: DK.cyan,
  },

  title: { color: '#fff', fontFamily: FONT.title, fontSize: 34, letterSpacing: -0.6, textAlign: 'center', marginTop: 28 },
  sub: { color: DK.sub, fontFamily: FONT.body, fontSize: 15.5, textAlign: 'center', marginTop: 12, lineHeight: 24 },

  childCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 28, borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.45)',
    backgroundColor: 'rgba(148,168,255,0.05)', padding: 18,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 18,
  },
  avatarWrap: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 108, height: 108, borderRadius: 54 },
  starBadge: {
    position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: 999,
    backgroundColor: DK.cyan, borderWidth: 2.5, borderColor: '#0B1023',
    alignItems: 'center', justifyContent: 'center',
  },
  childName: { color: '#fff', fontFamily: FONT.title, fontSize: 28, letterSpacing: -0.5 },
  childMeta: { fontFamily: FONT.body, fontSize: 16.5, marginTop: 4 },
  deadlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1.1, borderColor: 'rgba(53,228,210,0.5)', backgroundColor: 'rgba(53,228,210,0.07)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 12,
  },
  deadlinePillText: { color: DK.cyan, fontSize: 13, fontWeight: '800' },

  addCard: {
    flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 22,
    borderRadius: 26, borderWidth: 1.4, borderColor: 'rgba(148,168,255,0.3)', borderStyle: 'dashed',
    backgroundColor: 'rgba(148,168,255,0.03)', padding: 22,
  },
  addIcon: {
    width: 74, height: 74, borderRadius: 999, borderWidth: 1.4, borderStyle: 'dashed',
    borderColor: 'rgba(53,228,210,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  addTitle: { color: '#fff', fontFamily: FONT.num, fontSize: 20, letterSpacing: -0.4 },
  addSub: { color: DK.sub, fontFamily: FONT.body, fontSize: 14.5, marginTop: 4 },

  logoutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    marginTop: 40, paddingVertical: 10,
  },
  logoutText: { color: DK.sub, fontSize: 16, fontWeight: '700' },
});
