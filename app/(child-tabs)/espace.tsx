import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert,
} from 'react-native';
import { useScheme } from '../../lib/useScheme';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { speakGreeting } from '../../lib/greeting';
import { loadExamResults, type ExamResult } from '../../lib/examResults';
import { progressColor, progressGradient } from '../../lib/progressColor';
import { subjectIcon } from '../../lib/subjectIcons';
import { nextDeadlines, masteryForSubject, isDeadlineAtRisk } from '../../lib/deadlines';
import { AlertPulse } from '../../components/AlertPulse';
import { AvatarRing } from '../../components/AvatarRing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Breathe } from '../../components/anim/Breathe';
import { useChild } from '../../contexts/ChildContext';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS } from '../../lib/gamification';
import { DK_ICONS } from '../../constants/darkTheme';

// ─── Illustrations découpées des maquettes (zones pleines, aucun détourage) ──
const ART = {
  dark: {
    drill: require('../../assets/home/dark_drill.png'),
    scan: require('../../assets/home/dark_scan.png'),
    agenda: require('../../assets/home/dark_agenda.png'),
    trophy: require('../../assets/home/dark_trophy.png'),
    ctrlDoc: require('../../assets/home/dark_ctrl_doc.png'),
    ctrlSqrt: require('../../assets/home/dark_ctrl_sqrt.png'),
  },
  light: {
    drill: require('../../assets/home/light_drill.png'),
    scan: require('../../assets/home/light_scan.png'),
    agenda: require('../../assets/home/light_agenda.png'),
    trophy: require('../../assets/home/light_trophy.png'),
    ctrlDoc: require('../../assets/home/light_ctrl_doc.png'),
    ctrlSqrt: require('../../assets/home/light_ctrl_sqrt.png'),
  },
};
const AVATAR_DEFAULT = require('../../assets/home/avatar.png');

// couleur du badge J-x selon l'urgence uniquement
function urgencyColor(days: number) {
  if (days <= 3) return '#F5C24B';
  if (days <= 10) return '#5A8CFF';
  return 'rgba(148,168,255,0.65)';
}

// ─── Palettes clair / sombre (couleurs échantillonnées dans les maquettes) ──
const PALETTES = {
  dark: {
    scheme: 'dark' as const,
    bg: ['#070A1E', '#101638'] as [string, string],
    ink: '#FFFFFF',
    sub: 'rgba(210,220,255,0.7)',
    teal: '#35E4D2',
    circleBtnBg: 'rgba(148,168,255,0.12)',
    circleBtnBorder: 'rgba(148,168,255,0.25)',
    headerCardBg: 'transparent',
    // cartes contrôle [bg, border, accent] : orange / violet / bleu
    ctrl: [
      { bg: 'rgba(255,158,44,0.08)', border: 'rgba(255,158,44,0.55)', accent: '#FFA82E', track: 'rgba(255,255,255,0.14)' },
      { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.55)', accent: '#9B72F2', track: 'rgba(255,255,255,0.14)' },
      { bg: 'rgba(90,140,255,0.1)', border: 'rgba(90,140,255,0.55)', accent: '#6E9BFF', track: 'rgba(255,255,255,0.14)' },
    ],
    // tuiles actions [fond zone texte] (échantillonné) + accent chevron
    tiles: [
      { bg: '#012439', accent: '#2EC7A6' },
      { bg: '#021940', accent: '#3D7BFF' },
      { bg: '#00232A', accent: '#1FA36B' },
      { bg: '#1B124C', accent: '#8F5CF0' },
    ],
    tileBorder: 'rgba(148,168,255,0.16)',
    card: 'rgba(148,168,255,0.07)',
    cardBorder: 'rgba(148,168,255,0.18)',
  },
  light: {
    scheme: 'light' as const,
    bg: ['#F3F5FA', '#EEF1F8'] as [string, string],
    ink: '#1B2559',
    sub: '#6B7699',
    teal: '#12B886',
    circleBtnBg: '#FFFFFF',
    circleBtnBorder: 'rgba(27,37,89,0.08)',
    headerCardBg: '#FFFFFF',
    ctrl: [
      { bg: '#FDF6E7', border: 'rgba(240,160,30,0.5)', accent: '#F0A01E', track: 'rgba(240,160,30,0.2)' },
      { bg: '#F5F1FD', border: 'rgba(123,82,240,0.45)', accent: '#7B52F0', track: 'rgba(123,82,240,0.2)' },
      { bg: '#EDF3FE', border: 'rgba(60,110,240,0.45)', accent: '#3C6EF0', track: 'rgba(60,110,240,0.2)' },
    ],
    tiles: [
      { bg: '#F7FCFB', accent: '#12B886' },
      { bg: '#F5F8FD', accent: '#3D7BFF' },
      { bg: '#F4FAF5', accent: '#2E9E5B' },
      { bg: '#F8F6FE', accent: '#8F5CF0' },
    ],
    tileBorder: 'rgba(27,37,89,0.07)',
    card: '#FFFFFF',
    cardBorder: 'rgba(27,37,89,0.07)',
  },
};

const STARS = [
  { top: 30, left: '20%', s: 2 }, { top: 70, left: '60%', s: 3 }, { top: 44, left: '86%', s: 2 },
  { top: 130, left: '44%', s: 2 }, { top: 104, left: '9%', s: 3 }, { top: 170, left: '91%', s: 2 },
] as const;

export default function EspaceScreen() {
  const router = useRouter();
  const scheme = useScheme();
  const P = scheme === 'light' ? PALETTES.light : PALETTES.dark;
  const A = scheme === 'light' ? ART.light : ART.dark;
  const { child, setChild, updateChild, gamification } = useChild();
  // toutes les échéances à venir (toutes matières et tous types d'évaluation)
  const controles = child?.echeances ?? [];

  // maîtrise par matière (dernière note de devoir blanc)
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (child) loadExamResults(child.id).then(setExamResults);
    }, [child?.id])
  );
  const masteryFor = (subj?: string) => masteryForSubject(examResults, subj);

  // voix de bienvenue : à CHAQUE arrivée sur l'accueil de l'enfant —
  // encouragement suivant de sa rotation (1→20 puis reboucle) + prochaine
  // échéance à venir (désactivable dans Réglages)
  useFocusEffect(
    useCallback(() => {
      if (child) speakGreeting(child);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [child?.id])
  );

  async function changePhoto() {
    if (!child) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      updateChild(child.id, { photoUri: res.assets[0].uri });
    }
  }
  function onAvatarPress() {
    Alert.alert('Photo de profil', undefined, [
      { text: 'Modifier la photo', onPress: changePhoto },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  if (!child) {
    return (
      <LinearGradient colors={P.bg} style={{ flex: 1 }}>
        <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
          <StatusBar style={P.scheme === 'dark' ? 'light' : 'dark'} />
          <Text style={{ fontSize: 16, color: P.sub, marginBottom: 16 }}>Aucun enfant sélectionné</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={[s.backBtn, { backgroundColor: P.teal }]}>
            <Text style={s.backBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isCollege = child.kind === 'college';
  const gam = gamification(child.id);
  const level = getLevel(gam.xp);
  const levelPct = Math.min(100, getLevelProgress(gam.xp) * 100);
  const nextXP = getNextLevelXP(gam.xp);
  const recentBadges = BADGE_DEFS.filter((b) => gam.badges.includes(b.id)).slice(-3);
  const missionLabel = isCollege
    ? (child.mission?.notion ?? child.mission?.obj ?? 'Découverte')
    : (child.activity?.label ?? 'Découverte');
  const missionMin = (isCollege ? child.mission?.min : child.activity?.min) ?? 20;
  // 3 échéances les plus proches, classées par date (comme la page Échéances)
  const prochainControles = nextDeadlines(controles, 3);

  // 3 cartes verticales côte à côte (maquette) — « Préparer un contrôle » retiré
  const TILES = [
    { img: A.drill, title: 'Drill du jour', desc: 'Exercices quotidiens IA adaptés à ses besoins', route: '/drill', accent: '#2BC48A', bodyBg: P.scheme === 'dark' ? '#01313F' : '#F0FAF7' },
    { img: A.scan, title: 'Scanner une leçon', desc: 'Fiches, exercices, devoir blanc IA', route: '/scan', accent: '#3D7BFF', bodyBg: P.scheme === 'dark' ? '#0A1E4A' : '#F2F6FE' },
    { img: A.agenda, title: "Scanner l'agenda", desc: 'Contrôles & échéances', route: '/scan-agenda', accent: '#2E9E5B', bodyBg: P.scheme === 'dark' ? '#0A2E22' : '#F2FAF4' },
  ];
  const visibleTiles = isCollege ? TILES : TILES.slice(2, 3);

  return (
    <LinearGradient colors={P.bg} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style={P.scheme === 'dark' ? 'light' : 'dark'} />
        {P.scheme === 'dark' && STARS.map((st, i) => (
          <View key={i} pointerEvents="none" style={{
            position: 'absolute', top: st.top + 40, left: st.left as any,
            width: st.s, height: st.s, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)',
          }} />
        ))}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* nav : retour + cloche */}
          <View style={s.topNav}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setChild(null); router.replace('/(tabs)/' as any); }}
                style={[s.circleBtn, { backgroundColor: P.circleBtnBg, borderColor: P.circleBtnBorder }]}
              >
                <Ionicons name="chevron-back" size={20} color={P.ink} />
              </TouchableOpacity>
              <Text style={[s.navTitle, { color: P.ink }]}>Retour aux enfants</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(child-tabs)/echeances' as any)}
              style={[s.circleBtn, { backgroundColor: P.circleBtnBg, borderColor: P.circleBtnBorder }]}
            >
              <Ionicons name="notifications-outline" size={19} color={P.ink} />
              {prochainControles.length > 0 && <View style={[s.bellDot, { backgroundColor: P.teal }]} />}
            </TouchableOpacity>
          </View>

          {/* ===== En-tête identité ===== */}
          <View style={[s.headerCard, P.scheme === 'light' && { backgroundColor: P.headerCardBg, borderRadius: 26, padding: 18, shadowColor: '#1B2559', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 }]}>
            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.85}>
              <Breathe>
                <View style={s.avatarWrap}>
                  <Image
                    source={child.photoUri ? { uri: child.photoUri } : AVATAR_DEFAULT}
                    style={s.avatar}
                  />
                  <AvatarRing size={148} teal={P.teal} track={P.scheme === 'dark' ? 'rgba(53,228,210,0.3)' : 'rgba(18,184,134,0.25)'} />
                  <View style={[s.starBadge, { backgroundColor: P.teal, borderColor: P.scheme === 'light' ? '#fff' : '#0B1023' }]}>
                    <Ionicons name="star" size={15} color="#fff" />
                  </View>
                </View>
              </Breathe>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={[s.name, { color: P.ink }]}>{child.name}</Text>
              <Text style={s.classeLine}>
                <Text style={{ color: P.teal, fontWeight: '800' }}>{child.classe}</Text>
                <Text style={{ color: P.sub, fontWeight: '600' }}>  •  {child.age} ans</Text>
              </Text>
            </View>
          </View>

          {/* ===== Contrôles à venir ===== */}
          {prochainControles.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <View style={[s.sectionIcon, { backgroundColor: P.circleBtnBg, borderColor: P.circleBtnBorder }]}>
                  <Ionicons name="calendar-outline" size={16} color={P.ink} />
                </View>
                <Text style={[s.sectionLabel, { color: P.ink }]}>CONTRÔLES À VENIR</Text>
                <TouchableOpacity onPress={() => router.push('/(child-tabs)/echeances' as any)} style={s.seeAll}>
                  <Text style={{ color: P.scheme === 'dark' ? P.sub : '#7B52F0', fontWeight: '700', fontSize: 13.5 }}>Voir tout</Text>
                  <Ionicons name="chevron-forward" size={14} color={P.scheme === 'dark' ? P.sub : '#7B52F0'} />
                </TouchableOpacity>
              </View>
              <View style={{ gap: 12, marginBottom: 22 }}>
                {prochainControles.map((e) => {
                  // jauge de maîtrise (dernier devoir blanc de la matière)
                  const mastery = masteryFor(e.subj);
                  const pct = mastery ? Math.max(0.04, mastery.pct / 100) : 0.08;
                  const urg = urgencyColor(e.days);
                  const nLessons = (e.lessonIds ?? []).length;
                  // état d'alerte : non évalué OU maîtrise < 80 %
                  const alert = isDeadlineAtRisk(mastery);
                  const neutral = {
                    borderWidth: 1.2, borderColor: P.cardBorder,
                    backgroundColor: P.scheme === 'dark' ? 'rgba(20,27,51,0.75)' : '#FFFFFF',
                  };
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => router.push(`/echeance-detail?id=${e.id}` as any)}
                      activeOpacity={0.85}
                    >
                      <AlertPulse active={alert} scheme={P.scheme} neutralStyle={neutral}>
                        <View style={s.ctrlRow}>
                          <Image source={subjectIcon(e.subj, P.scheme)} style={s.ctrlIconTile} />
                          <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={[s.ctrlTitle, { color: P.ink }]} numberOfLines={1}>{e.type} de {e.subj}</Text>
                            <Text style={[s.ctrlSub, { color: P.sub }]}>
                              {e.date}  •  {nLessons} {nLessons > 1 ? 'leçons liées' : 'leçon liée'}
                            </Text>
                            <View style={[s.ctrlTrack, {
                              backgroundColor: P.scheme === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(27,37,89,0.1)',
                            }]}>
                              <LinearGradient
                                colors={mastery ? progressGradient(mastery.pct) : [P.teal, P.teal]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={[s.ctrlFill, { width: `${pct * 100}%` }]}
                              />
                            </View>
                            <Text
                              style={[s.ctrlMastery, { color: mastery ? progressColor(mastery.pct) : (P.scheme === 'dark' ? '#FF8A80' : '#D6353A') }]}
                              numberOfLines={2}
                            >
                              {mastery
                                ? `${mastery.pct} % de maîtrise • dernier devoir blanc ${mastery.note}/20`
                                : 'À préparer — pas encore de devoir blanc noté'}
                            </Text>
                          </View>
                          <View style={[s.jPill, { borderColor: urg }]}>
                            <Text style={[s.jPillText, { color: urg }]}>{e.days === 0 ? 'Auj.' : `J-${e.days}`}</Text>
                          </View>
                        </View>
                      </AlertPulse>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* ===== Actions scolaires ===== */}
          <View style={s.sectionRow}>
            <View style={[s.sectionIcon, { backgroundColor: P.scheme === 'dark' ? 'rgba(53,228,210,0.12)' : '#E2F8F0', borderColor: 'transparent' }]}>
              <Ionicons name="flash" size={15} color={P.teal} />
            </View>
            <Text style={[s.sectionLabel, { color: P.ink }]}>ACTIONS SCOLAIRES</Text>
          </View>
          <View style={s.grid}>
            {visibleTiles.map((t, i) => (
              <Animated.View key={t.route} entering={FadeInDown.delay(i * 70).springify().damping(16)} style={s.tileWrap}>
                <TouchableOpacity
                  onPress={() => router.push(t.route as any)}
                  style={[s.tile, { backgroundColor: t.bodyBg, borderColor: P.tileBorder }]}
                  activeOpacity={0.88}
                >
                  <Image source={t.img} style={s.tileArt} />
                  <View style={s.tileBody}>
                    <Text style={[s.tileTitle, { color: P.scheme === 'dark' ? '#fff' : P.ink }]}>{t.title}</Text>
                    <Text style={[s.tileDesc, { color: P.scheme === 'dark' ? 'rgba(220,230,255,0.7)' : P.sub }]} numberOfLines={3}>{t.desc}</Text>
                    <View style={[s.tileChevron, { backgroundColor: t.accent }]}>
                      <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ===== Mission du jour ===== */}
          <TouchableOpacity onPress={() => router.push('/mission' as any)} activeOpacity={0.88}>
            <View style={[s.missionCard, { backgroundColor: P.card, borderColor: P.cardBorder }]}>
              <Image source={DK_ICONS.target} style={s.missionIcon} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[s.missionLabel, { color: P.teal }]}>{isCollege ? 'MISSION DU JOUR' : 'ACTIVITÉ DU JOUR'}</Text>
                  <View style={[s.minChip, { borderColor: P.cardBorder }]}>
                    <Ionicons name="time-outline" size={13} color={P.ink} />
                    <Text style={[s.minChipText, { color: P.ink }]}>{missionMin} min</Text>
                  </View>
                </View>
                <Text style={[s.missionTitle, { color: P.ink }]} numberOfLines={1}>{missionLabel}</Text>
                <Text style={[s.missionSub, { color: P.sub }]}>Explore ta journée d'apprentissage</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ===== Niveau ===== */}
          <View style={[s.levelCard, { backgroundColor: P.card, borderColor: P.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={DK_ICONS.flame} style={s.flameIcon} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.levelSub, { color: P.sub }]}>Niveau actuel</Text>
                <View style={s.levelRow}>
                  <Text style={[s.levelName, { color: P.ink }]}>{level.label}</Text>
                  <Text style={[s.levelXP, { color: P.ink }]}>{gam.xp} XP</Text>
                </View>
                <View style={[s.xpTrack, { backgroundColor: P.scheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(27,37,89,0.08)' }]}>
                  <LinearGradient
                    colors={['#FF3D8A', '#FF7A3D', '#FFC24B']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.xpFill, { width: `${Math.max(3, levelPct)}%` }]}
                  />
                </View>
                <Text style={[s.levelNext, { color: P.sub }]}>vers {nextXP} XP</Text>
              </View>
            </View>
            {recentBadges.length > 0 && (
              <View style={s.badgeRow}>
                {recentBadges.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => router.push('/(child-tabs)/profil' as any)}
                    style={[s.badgePill, { borderColor: P.cardBorder, backgroundColor: P.scheme === 'dark' ? 'rgba(11,16,35,0.4)' : '#F5F6FA' }]}
                  >
                    <Ionicons name={b.icon as any} size={13} color={P.teal} />
                    <Text style={[s.badgePillText, { color: P.ink }]}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  backBtn: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  circleBtn: {
    width: 44, height: 44, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontWeight: '700', fontSize: 15.5, letterSpacing: -0.2 },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999 },

  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarWrap: { width: 148, height: 148, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 126, height: 126, borderRadius: 63 },
  starBadge: {
    position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2.5,
  },
  name: { fontSize: 36, fontWeight: '900', letterSpacing: -0.8 },
  classeLine: { fontSize: 17, marginTop: 4 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  sectionIcon: {
    width: 34, height: 34, borderRadius: 11, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1.5, flex: 1 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  ctrlRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, minHeight: 122,
  },
  ctrlIconTile: { width: 72, height: 78, borderRadius: 18 },
  ctrlTitle: { fontSize: 16.5, fontWeight: '800', letterSpacing: -0.3 },
  ctrlSub: { fontSize: 13, fontWeight: '600', marginTop: 3 },
  ctrlTrack: { height: 6, borderRadius: 999, marginTop: 9, overflow: 'hidden', width: '85%' },
  ctrlFill: { height: '100%', borderRadius: 999 },
  ctrlMastery: { fontSize: 11, fontWeight: '700', marginTop: 5 },
  jPill: {
    borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 12, marginLeft: 8,
  },
  jPillText: { fontWeight: '900', fontSize: 15.5 },


  // 3 cartes verticales côte à côte (maquette) : illustration en haut,
  // texte dessous, bulle chevron colorée en bas à droite
  grid: { flexDirection: 'row', gap: 11, marginBottom: 22 },
  tileWrap: { flex: 1 },
  tile: { width: '100%', borderRadius: 24, borderWidth: 1, overflow: 'hidden', minHeight: 268 },
  tileArt: { width: '100%', height: 128 },
  tileBody: { flex: 1, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 10 },
  tileTitle: { fontWeight: '800', fontSize: 15.5, letterSpacing: -0.3, marginBottom: 6, lineHeight: 20 },
  tileDesc: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  tileChevron: {
    width: 36, height: 36, borderRadius: 999, alignSelf: 'flex-end', marginTop: 'auto',
    alignItems: 'center', justifyContent: 'center',
  },

  missionCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 24, padding: 16, marginBottom: 13,
  },
  missionIcon: {
    width: 68, height: 68,
    shadowColor: '#35E4D2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 14,
  },
  missionLabel: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, flex: 1 },
  missionTitle: { fontWeight: '900', fontSize: 21, letterSpacing: -0.4, marginTop: 4 },
  missionSub: { fontSize: 13, fontWeight: '500', marginTop: 3 },
  minChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  minChipText: { fontSize: 13, fontWeight: '700' },

  levelCard: { borderWidth: 1, borderRadius: 24, padding: 16 },
  flameIcon: {
    width: 68, height: 68,
    shadowColor: '#FF7A3D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12,
  },
  levelSub: { fontSize: 13, fontWeight: '600' },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1, marginBottom: 9 },
  levelName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  levelXP: { fontSize: 16.5, fontWeight: '800' },
  xpTrack: { height: 9, borderRadius: 999, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 999 },
  levelNext: { fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'right' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 14 },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderWidth: 1.2, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8,
  },
  badgePillText: { fontSize: 13, fontWeight: '700' },
});
