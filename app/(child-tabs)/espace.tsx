import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { T, type AccentKey } from '../../constants/theme';
import { Breathe } from '../../components/anim/Breathe';
import { Squircle } from '../../components/ui/Squircle';
import { ProgressRing, ProgressBar } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';
import { iconForMatiere, accentForMatiere, isControle } from '../../lib/matiere';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS } from '../../lib/gamification';

type ActionItem = {
  accent: AccentKey;
  iconName: string;
  title: string;
  desc: string;
  route: string;
};

// Grille pastel « Actions scolaires » — icônes 3D découpées de la maquette,
// fond de tuile = couleur exacte du fond de l'icône pour une fusion parfaite
const PASTEL_ACTIONS: (ActionItem & { img: any; bg: string })[] = [
  { accent: 'green', iconName: 'flash', title: 'Drill du jour', desc: 'Exercices IA adaptés', route: '/drill', img: require('../../assets/icons/drill_tile.png'), bg: '#F2F4F0' },
  { accent: 'violet', iconName: 'scan', title: 'Scanner une leçon', desc: 'Fiches, QCM, flashcards IA', route: '/scan', img: require('../../assets/icons/scan_tile.png'), bg: '#F2F0FB' },
  { accent: 'blue', iconName: 'camera', title: "Scanner l'agenda", desc: 'Contrôles & échéances', route: '/scan-agenda', img: require('../../assets/icons/agenda_tile.png'), bg: '#EFF9F2' },
  { accent: 'amber', iconName: 'trophy', title: 'Préparer un contrôle', desc: 'Manuel ou par photo', route: '/prepare-control', img: require('../../assets/icons/trophy_tile.png'), bg: '#FDF1E8' },
];

// Grandes cartes colorées — dégradés et icônes 3D de la maquette
const BOLD_CARDS: { colors: [string, string]; img: any; title: string; desc: string; route: string }[] = [
  { colors: ['#6D40A8', '#40296E'], img: require('../../assets/icons/lecture_big.png'), title: 'Carnet de lecture', desc: 'Questions sur les pages lues', route: '/lecture' },
  { colors: ['#5366BE', '#324489'], img: require('../../assets/icons/planning_big.png'), title: 'Planning', desc: 'Voir les échéances', route: '/(child-tabs)/echeances' },
];

const GOLD = '#F5C24B';

export default function EspaceScreen() {
  const router = useRouter();
  const { child, setChild, lessons, gamification } = useChild();
  const childLessons = child ? lessons.filter((l) => l.childId === child.id) : [];
  const controles = (child?.echeances ?? []).filter((e) => isControle(e.type));

  if (!child) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.noChildText}>Aucun enfant sélectionné</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={s.backBtn}>
            <Text style={s.backBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCollege = child.kind === 'college';
  const gam = gamification(child.id);
  const level = getLevel(gam.xp);
  const levelPct = getLevelProgress(gam.xp) * 100;
  const nextXP = getNextLevelXP(gam.xp);
  const recentBadges = BADGE_DEFS.filter((b) => gam.badges.includes(b.id)).slice(-3);
  const missionLabel = isCollege
    ? (child.mission?.notion ?? child.mission?.obj ?? 'Découverte')
    : (child.activity?.label ?? 'Découverte');
  const missionMin = (isCollege ? child.mission?.min : child.activity?.min) ?? 20;
  const noLessonControle = controles.find((e) => (e.lessonIds ?? []).length === 0);

  return (
    <SafeAreaView style={s.safe} edges={['left', 'right']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ===== HERO vert profond ===== */}
        <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={s.hero}>
          {/* nav */}
          <View style={s.topNav}>
            <TouchableOpacity onPress={() => { setChild(null); router.replace('/(tabs)/' as any); }} style={s.backLink}>
              <Ionicons name="arrow-back" size={19} color="rgba(255,255,255,0.8)" />
              <Text style={s.backLinkText}>Retour aux enfants</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(child-tabs)/profil' as any)} style={s.profileBtn}>
              <Ionicons name="person-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* identité + anneau */}
          <View style={s.heroIdRow}>
            <Breathe>
              <View style={s.heroAvatar}>
                <Text style={s.heroAvatarText}>{child.name.charAt(0)}</Text>
              </View>
            </Breathe>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.heroName}>{child.name}</Text>
              <Text style={s.heroClass}>{child.classe} • {child.age} ans</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing value={child.progress} size={64} sw={7} color={GOLD}>
                <Text style={s.heroProgress}>{child.progress}%</Text>
              </ProgressRing>
              <Text style={s.heroProgressCaption}>de progression</Text>
            </View>
          </View>

          {/* prochaine échéance */}
          {isCollege && child.next && (
            <View style={s.nextRow}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={s.nextText} numberOfLines={1}>
                {child.next.type}{child.next.subj ? ` de ${child.next.subj}` : ' de —'}
              </Text>
              <View style={s.jPillHero}>
                <Text style={s.jPillHeroText}>J-{child.next.days}</Text>
              </View>
            </View>
          )}

          {/* Mission du jour */}
          <TouchableOpacity onPress={() => router.push('/mission' as any)} activeOpacity={0.9}>
            <LinearGradient colors={['#E8F7EC', '#C9EAD3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.missionCard}>
              <View style={s.missionPlay}>
                <Ionicons name="play" size={22} color="#fff" style={{ marginLeft: 2 }} />
              </View>
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text style={s.missionLabel}>{isCollege ? 'MISSION DU JOUR' : 'ACTIVITÉ DU JOUR'}</Text>
                <Text style={s.missionTitle} numberOfLines={1}>{missionLabel}</Text>
              </View>
              <View style={s.missionChip}>
                <Ionicons name="time-outline" size={14} color={T.heroFrom} />
                <Text style={s.missionChipText}>{missionMin} min</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Niveau + badges */}
          <View style={s.gamCard}>
            <View style={s.gamRow}>
              <View style={s.levelHex}>
                <Text style={{ fontSize: 22 }}>🔥</Text>
                <View style={s.levelNum}><Text style={s.levelNumText}>{gam.streak}</Text></View>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={s.gamLabelRow}>
                  <Text style={s.gamLevel}>{level.label}</Text>
                  <Text style={s.gamXP}>{gam.xp} XP</Text>
                </View>
                <ProgressBar value={levelPct} color={T.primary} h={7} />
                <Text style={s.gamNext}>Prochain palier : {nextXP} XP</Text>
              </View>
            </View>
            {recentBadges.length > 0 && (
              <View style={s.badgeRow}>
                {recentBadges.map((b, i) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => router.push('/(child-tabs)/profil' as any)}
                    style={[
                      s.badgePill,
                      i < 2
                        ? { backgroundColor: T[b.accent].solid }
                        : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)' },
                    ]}
                  >
                    <Text style={s.badgePillText}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={s.body}>
          {/* ===== Actions scolaires ===== */}
          <View style={s.sectionRow}>
            <Text style={s.sectionLabel}>ACTIONS SCOLAIRES</Text>
            <Text style={{ fontSize: 14 }}>✨</Text>
          </View>
          <View style={s.actionsGrid}>
            {(isCollege ? PASTEL_ACTIONS : PASTEL_ACTIONS.slice(2, 4)).map((ac, i) => (
              <Animated.View key={ac.route} entering={FadeInDown.delay(i * 70).springify().damping(16)} style={s.actionTileWrap}>
                <TouchableOpacity
                  onPress={() => router.push(ac.route as any)}
                  style={[s.actionTile, { backgroundColor: ac.bg }]}
                  activeOpacity={0.88}
                >
                  <Image source={ac.img} style={s.actionImg} />
                  <Text style={s.actionTitle}>{ac.title}</Text>
                  <Text style={s.actionDesc} numberOfLines={2}>{ac.desc}</Text>
                  <View style={s.actionChevron}>
                    <Ionicons name="chevron-forward" size={14} color={T[ac.accent].fg} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ===== Grandes cartes colorées ===== */}
          {isCollege && (
            <View style={s.boldGrid}>
              {BOLD_CARDS.map((c, i) => (
                <Animated.View key={c.route} entering={FadeInDown.delay(250 + i * 80).springify().damping(16)} style={s.actionTileWrap}>
                  <TouchableOpacity onPress={() => router.push(c.route as any)} activeOpacity={0.9}>
                    <LinearGradient colors={c.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.boldCard}>
                      <Image source={c.img} style={s.boldImg} />
                      <Text style={s.boldTitle}>{c.title}</Text>
                      <Text style={s.boldDesc} numberOfLines={2}>{c.desc}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* ===== Contrôles à venir ===== */}
          {controles.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <Text style={s.sectionLabel}>CONTRÔLES À VENIR</Text>
                <View style={s.countChip}><Text style={s.countChipText}>{controles.length}</Text></View>
              </View>
              <View style={{ gap: 11, marginBottom: 18 }}>
                {controles.map((e) => {
                  const noLesson = (e.lessonIds ?? []).length === 0;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => router.push(`/echeance-detail?id=${e.id}` as any)}
                      style={s.controleRow}
                      activeOpacity={0.88}
                    >
                      <Squircle accentKey={e.accent} size={44} r={14} icon={<Ionicons name={(e.icon || 'school-outline') as any} size={21} color={T[e.accent].fg} />} style={{ marginRight: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.controleTitle}>{e.type} de {e.subj}</Text>
                        <Text style={s.controleSub}>
                          {e.date} · {(e.lessonIds ?? []).length} {(e.lessonIds ?? []).length > 1 ? 'leçons liées' : 'leçon liée'}
                        </Text>
                        {noLesson && (
                          <View style={s.controleWarn}>
                            <Ionicons name="warning-outline" size={13} color={T.amber.fg} />
                            <Text style={s.controleWarnText}>Aucune leçon rattachée</Text>
                          </View>
                        )}
                      </View>
                      <View style={[s.jBadge, { backgroundColor: T[e.accent].solid }]}>
                        <Text style={s.jBadgeText}>{e.days === 0 ? 'Auj.' : `J-${e.days}`}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={T.faint} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* ===== Bannière verte : leçons à rattacher ===== */}
          {noLessonControle && (
            <LinearGradient colors={[T.heroFrom, T.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
              <Text style={{ fontSize: 22 }}>🎼</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.bannerText}>
                  <Text style={{ color: GOLD, fontWeight: '800' }}>Contrôle de {noLessonControle.subj} dans {noLessonControle.days} {noLessonControle.days > 1 ? 'jours' : 'jour'} :</Text>
                  {' '}avez-vous rattaché les leçons concernées ?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/link-lessons?echeanceId=${noLessonControle.id}` as any)}
                  style={s.bannerBtn}
                  activeOpacity={0.88}
                >
                  <Text style={s.bannerBtnText}>Rattacher des leçons</Text>
                  <Ionicons name="arrow-forward" size={15} color={T.heroTo} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}

          {/* ===== Leçons enregistrées ===== */}
          <View style={s.sectionRow}>
            <Text style={s.sectionLabel}>LEÇONS ENREGISTRÉES</Text>
            {childLessons.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/lessons' as any)}>
                <Text style={s.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>
          {childLessons.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/scan' as any)} style={s.emptyLessons} activeOpacity={0.85}>
              <Ionicons name="scan-outline" size={20} color={T.primary} />
              <Text style={s.emptyLessonsText}>Aucune leçon enregistrée. Scannez la première !</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 10, marginBottom: 18 }}>
              {childLessons.slice(0, 4).map((l) => {
                const a = accentForMatiere(l.matiere);
                return (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                    style={s.lessonRow}
                    activeOpacity={0.88}
                  >
                    <Squircle accentKey={a} size={42} r={13} icon={<Ionicons name={iconForMatiere(l.matiere) as any} size={20} color={T[a].fg} />} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.lessonMatiere}>{l.matiere}</Text>
                      <Text style={s.lessonTitre} numberOfLines={1}>{l.titre}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={T.faint} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noChildText: { fontSize: 16, color: T.sub, textAlign: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: T.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Hero
  hero: {
    paddingTop: 58, paddingHorizontal: 18, paddingBottom: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 18,
  },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6 },
  backLinkText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 13.5 },
  profileBtn: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroIdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroAvatarText: { color: '#fff', fontWeight: '800', fontSize: 27 },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  heroClass: { color: 'rgba(255,255,255,0.66)', fontSize: 14.5, fontWeight: '600', marginTop: 2 },
  heroProgress: { fontSize: 15, fontWeight: '800', color: '#fff' },
  heroProgressCaption: { color: 'rgba(255,255,255,0.6)', fontSize: 10.5, fontWeight: '600', marginTop: 4 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  nextText: { flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  jPillHero: { backgroundColor: T.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  jPillHeroText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  missionCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, marginBottom: 12,
  },
  missionPlay: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: T.heroFrom,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0B2A23', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  missionLabel: { fontSize: 11, fontWeight: '800', color: T.primaryDeep, letterSpacing: 0.5 },
  missionTitle: { fontWeight: '900', fontSize: 17.5, color: T.heroTo, letterSpacing: -0.3, marginTop: 2 },
  missionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
  },
  missionChipText: { fontSize: 13, fontWeight: '800', color: T.heroFrom },
  gamCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14 },
  gamRow: { flexDirection: 'row', alignItems: 'center' },
  levelHex: {
    width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  levelNum: {
    position: 'absolute', bottom: -4, right: -4, width: 19, height: 19, borderRadius: 999,
    backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  levelNumText: { fontSize: 11, fontWeight: '900', color: T.heroTo },
  gamLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  gamLevel: { fontSize: 15.5, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  gamXP: { fontSize: 14, fontWeight: '800', color: '#fff' },
  gamNext: { fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginTop: 5, textAlign: 'right' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badgePill: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  badgePillText: { fontSize: 12.5, fontWeight: '800', color: '#fff' },

  // Body
  body: { paddingHorizontal: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: T.ink, letterSpacing: 0.3 },
  countChip: {
    minWidth: 22, height: 22, borderRadius: 999, backgroundColor: T.primarySoft,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  countChipText: { fontSize: 12, fontWeight: '800', color: T.primaryDeep },
  seeAll: { fontSize: 13.5, fontWeight: '800', color: T.primary, marginLeft: 'auto' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 14 },
  actionTileWrap: { width: '47.8%' },
  actionTile: { width: '100%', borderRadius: 22, padding: 14, minHeight: 128 },
  actionImg: { width: 54, height: 58, borderRadius: 12, marginBottom: 8 },
  actionTitle: { fontWeight: '800', fontSize: 14.5, color: T.ink, letterSpacing: -0.3, marginBottom: 3 },
  actionDesc: { fontSize: 12, color: T.sub, fontWeight: '500', paddingRight: 20 },
  actionChevron: {
    position: 'absolute', bottom: 12, right: 12, width: 26, height: 26, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center',
  },

  boldGrid: { flexDirection: 'row', gap: 11, marginBottom: 18 },
  boldCard: { width: '100%', borderRadius: 22, padding: 15, minHeight: 140 },
  boldImg: { width: 74, height: 60, borderRadius: 12, marginBottom: 9 },
  boldTitle: { fontWeight: '900', fontSize: 15.5, color: '#fff', letterSpacing: -0.3, marginBottom: 3 },
  boldDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  controleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
    borderRadius: 20, padding: 13,
    shadowColor: '#102818', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  controleTitle: { fontWeight: '800', fontSize: 15, color: T.ink, letterSpacing: -0.3 },
  controleSub: { fontSize: 12.5, color: T.sub, fontWeight: '600', marginTop: 2 },
  controleWarn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  controleWarnText: { fontSize: 12, fontWeight: '800', color: T.amber.fg },
  jBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  jBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11.5 },

  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 22, padding: 16, marginBottom: 18,
  },
  bannerText: { fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  bannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9, marginTop: 11,
  },
  bannerBtnText: { fontSize: 13.5, fontWeight: '800', color: T.heroTo },

  emptyLessons: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.primarySoft, borderRadius: 16, padding: 14, marginBottom: 18,
  },
  emptyLessonsText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: T.primaryDeep },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, borderRadius: 18, padding: 12,
  },
  lessonMatiere: { fontSize: 11.5, fontWeight: '800', color: T.sub, letterSpacing: 0.2 },
  lessonTitre: { fontSize: 14.5, fontWeight: '800', color: T.ink, letterSpacing: -0.3, marginTop: 1 },
});
