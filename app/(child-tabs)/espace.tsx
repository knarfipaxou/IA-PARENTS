import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { T } from '../../constants/theme';
import { Breathe } from '../../components/anim/Breathe';
import { ProgressRing } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';
import { isControle } from '../../lib/matiere';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS } from '../../lib/gamification';

// ===== Thème sombre néon (maquette) =====
export const DK = {
  bgTop: '#0B1023',
  bgBottom: '#131A38',
  card: 'rgba(148,168,255,0.08)',
  cardBorder: 'rgba(148,168,255,0.16)',
  ink: '#FFFFFF',
  sub: '#93A0C7',
  faint: '#5D6890',
  cyan: '#2EE6D6',
  xpFrom: '#FF3D8A',
  xpTo: '#FF9E2C',
  gold: '#F5C24B',
} as const;

const ICONS = {
  avatar: require('../../assets/icons/avatar.png'),
  target: require('../../assets/icons/target.png'),
  flame: require('../../assets/icons/flame.png'),
  lightning: require('../../assets/icons/lightning.png'),
  scan: require('../../assets/icons/scan.png'),
  agenda: require('../../assets/icons/agenda.png'),
  trophy: require('../../assets/icons/trophy.png'),
  book: require('../../assets/icons/book.png'),
  planning: require('../../assets/icons/planning.png'),
  music: require('../../assets/icons/music.png'),
  sqrt: require('../../assets/icons/sqrt.png'),
  calculator: require('../../assets/icons/calculator.png'),
  warning: require('../../assets/icons/warning.png'),
  flashcards: require('../../assets/icons/flashcards.png'),
  pencil: require('../../assets/icons/pencil.png'),
  medal: require('../../assets/icons/medal.png'),
  clock: require('../../assets/icons/clock.png'),
};

// icône par matière pour les listes
function iconForSubject(subj?: string) {
  const s = (subj ?? '').toLowerCase();
  if (s.includes('musi')) return ICONS.music;
  if (s.includes('math')) return ICONS.sqrt;
  if (s.includes('fran') || s.includes('lect')) return ICONS.book;
  return ICONS.planning;
}
const BADGE_ICON: Record<string, any> = {
  first_flashcard: ICONS.flashcards, first_exercise: ICONS.pencil, first_controle: ICONS.medal,
  first_minitest: ICONS.medal, first_scan: ICONS.scan, perfect_test: ICONS.trophy,
};

const ACTIONS = [
  { img: ICONS.lightning, tint: 'rgba(255,158,44,0.13)', border: 'rgba(255,158,44,0.3)', title: 'Drill du jour', desc: 'Exercices quotidiens IA', route: '/drill' },
  { img: ICONS.scan, tint: 'rgba(80,140,255,0.13)', border: 'rgba(80,140,255,0.3)', title: 'Scanner une leçon', desc: 'Fiches, QCM, flashcards IA', route: '/scan' },
  { img: ICONS.agenda, tint: 'rgba(46,230,150,0.11)', border: 'rgba(46,230,150,0.28)', title: "Scanner l'agenda", desc: 'Contrôles & échéances', route: '/scan-agenda' },
  { img: ICONS.trophy, tint: 'rgba(200,90,255,0.12)', border: 'rgba(200,90,255,0.3)', title: 'Préparer un contrôle', desc: 'Manuel ou par photo', route: '/prepare-control' },
];
const BOLD_CARDS = [
  { img: ICONS.book, tint: 'rgba(160,100,255,0.16)', border: 'rgba(160,100,255,0.35)', title: 'Carnet de lecture', desc: 'Questions sur les pages lues', route: '/lecture' },
  { img: ICONS.planning, tint: 'rgba(80,120,255,0.16)', border: 'rgba(80,120,255,0.35)', title: 'Planning', desc: 'Voir les échéances', route: '/(child-tabs)/echeances' },
];

export default function EspaceScreen() {
  const router = useRouter();
  const { child, setChild, lessons, gamification } = useChild();
  const childLessons = child ? lessons.filter((l) => l.childId === child.id) : [];
  const controles = (child?.echeances ?? []).filter((e) => isControle(e.type));

  if (!child) {
    return (
      <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 16, color: DK.sub, marginBottom: 16 }}>Aucun enfant sélectionné</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={s.backBtn}>
          <Text style={s.backBtnText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
  const noLessonControle = controles.find((e) => (e.lessonIds ?? []).length === 0);
  const visibleActions = isCollege ? ACTIONS : ACTIONS.slice(2, 4);

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* nav */}
          <View style={s.topNav}>
            <TouchableOpacity onPress={() => { setChild(null); router.replace('/(tabs)/' as any); }} style={s.backLink}>
              <Ionicons name="arrow-back" size={19} color={DK.sub} />
              <Text style={s.backLinkText}>Retour aux enfants</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(child-tabs)/profil' as any)} style={s.profileBtn}>
              <Ionicons name="person-outline" size={18} color={DK.cyan} />
            </TouchableOpacity>
          </View>

          {/* ===== Identité ===== */}
          <View style={s.idRow}>
            <Breathe>
              <Image source={ICONS.avatar} style={s.avatar} />
            </Breathe>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.name}>{child.name}</Text>
              <Text style={s.classe}>{child.classe} • {child.age} ans</Text>
              {isCollege && child.next && (
                <View style={s.planPill}>
                  <Ionicons name="calendar-outline" size={13} color={DK.cyan} />
                  <Text style={s.planPillText} numberOfLines={1}>
                    {child.next.subj ? `${child.next.type} ${child.next.subj}` : 'Planification'}
                  </Text>
                  <View style={s.planPillDivider} />
                  <Text style={s.planPillJ}>J-{child.next.days}</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing value={child.progress} size={64} sw={6} color={DK.cyan}>
                <Text style={s.ringText}>{child.progress}%</Text>
              </ProgressRing>
              <Text style={s.ringCaption}>Avancement</Text>
            </View>
          </View>

          {/* ===== Mission du jour ===== */}
          <TouchableOpacity onPress={() => router.push('/mission' as any)} activeOpacity={0.88} style={s.missionCard}>
            <Image source={ICONS.target} style={s.missionIcon} />
            <View style={{ flex: 1, marginLeft: 13 }}>
              <Text style={s.missionLabel}>{isCollege ? 'MISSION DU JOUR' : 'ACTIVITÉ DU JOUR'}</Text>
              <Text style={s.missionTitle} numberOfLines={1}>{missionLabel}</Text>
              <Text style={s.missionSub}>Explore ta journée d'apprentissage</Text>
            </View>
            <View style={s.minChip}>
              <Ionicons name="time-outline" size={13} color={DK.ink} />
              <Text style={s.minChipText}>{missionMin} min</Text>
            </View>
          </TouchableOpacity>

          {/* ===== Niveau ===== */}
          <View style={s.levelCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={ICONS.flame} style={s.flameIcon} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.levelSub}>Niveau actuel</Text>
                <View style={s.levelRow}>
                  <Text style={s.levelName}>{level.label}</Text>
                  <Text style={s.levelXP}>{gam.xp} XP</Text>
                </View>
                <View style={s.xpTrack}>
                  <LinearGradient
                    colors={[DK.xpFrom, DK.xpTo]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.xpFill, { width: `${Math.max(2, levelPct)}%` }]}
                  />
                </View>
                <Text style={s.levelNext}>vers {nextXP} XP</Text>
              </View>
            </View>
            {recentBadges.length > 0 && (
              <View style={s.badgeRow}>
                {recentBadges.map((b) => (
                  <TouchableOpacity key={b.id} onPress={() => router.push('/(child-tabs)/profil' as any)} style={s.badgePill}>
                    {BADGE_ICON[b.id]
                      ? <Image source={BADGE_ICON[b.id]} style={{ width: 17, height: 17 }} />
                      : <Ionicons name={b.icon as any} size={13} color={DK.cyan} />}
                    <Text style={s.badgePillText}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ===== Actions scolaires ===== */}
          <Text style={s.sectionLabel}>ACTIONS SCOLAIRES</Text>
          <View style={s.grid}>
            {visibleActions.map((ac, i) => (
              <Animated.View key={ac.route} entering={FadeInDown.delay(i * 70).springify().damping(16)} style={s.tileWrap}>
                <TouchableOpacity
                  onPress={() => router.push(ac.route as any)}
                  style={[s.tile, { backgroundColor: ac.tint, borderColor: ac.border }]}
                  activeOpacity={0.85}
                >
                  <Image source={ac.img} style={s.tileIcon} />
                  <Text style={s.tileTitle}>{ac.title}</Text>
                  <Text style={s.tileDesc} numberOfLines={2}>{ac.desc}</Text>
                  <View style={s.tileChevron}>
                    <Ionicons name="chevron-forward" size={13} color={DK.ink} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
            {isCollege && BOLD_CARDS.map((c, i) => (
              <Animated.View key={c.route} entering={FadeInDown.delay(280 + i * 70).springify().damping(16)} style={s.tileWrap}>
                <TouchableOpacity
                  onPress={() => router.push(c.route as any)}
                  style={[s.tile, { backgroundColor: c.tint, borderColor: c.border }]}
                  activeOpacity={0.85}
                >
                  <Image source={c.img} style={s.tileIcon} />
                  <Text style={s.tileTitle}>{c.title}</Text>
                  <Text style={s.tileDesc} numberOfLines={2}>{c.desc}</Text>
                  <View style={s.tileChevron}>
                    <Ionicons name="chevron-forward" size={13} color={DK.ink} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ===== Contrôles à venir ===== */}
          {controles.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <Ionicons name="time-outline" size={16} color={DK.sub} />
                <Text style={s.sectionLabel2}>CONTRÔLES À VENIR</Text>
              </View>
              <View style={{ gap: 11, marginBottom: 16 }}>
                {controles.map((e) => {
                  const noLesson = (e.lessonIds ?? []).length === 0;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => router.push(`/echeance-detail?id=${e.id}` as any)}
                      style={s.row}
                      activeOpacity={0.85}
                    >
                      <Image source={iconForSubject(e.subj)} style={s.rowIcon} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.rowTitle}>{e.type} de {e.subj}</Text>
                        <Text style={s.rowSub}>
                          {e.date} · {(e.lessonIds ?? []).length} {(e.lessonIds ?? []).length > 1 ? 'leçons liées' : 'leçon liée'}
                        </Text>
                        {noLesson && (
                          <View style={s.rowWarn}>
                            <Ionicons name="warning" size={12} color="#FF6B5A" />
                            <Text style={s.rowWarnText}>Aucune leçon rattachée</Text>
                          </View>
                        )}
                      </View>
                      <View style={s.jPill}>
                        <Text style={s.jPillText}>{e.days === 0 ? 'Auj.' : `J-${e.days}`}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* ===== Alerte leçons non rattachées ===== */}
          {noLessonControle && (
            <LinearGradient
              colors={['rgba(200,60,40,0.35)', 'rgba(120,30,60,0.25)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.alert}
            >
              <Image source={ICONS.warning} style={{ width: 40, height: 40 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertText}>
                  Contrôle de {noLessonControle.subj} dans {noLessonControle.days} {noLessonControle.days > 1 ? 'jours' : 'jour'} : avez-vous rattaché les leçons concernées ?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/link-lessons?echeanceId=${noLessonControle.id}` as any)}
                  style={s.alertBtn}
                  activeOpacity={0.85}
                >
                  <Text style={s.alertBtnText}>Rattacher des leçons</Text>
                  <Ionicons name="arrow-forward" size={14} color={DK.gold} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}

          {/* ===== Leçons enregistrées ===== */}
          <View style={s.sectionRow}>
            <Text style={s.sectionLabel2}>LEÇONS ENREGISTRÉES</Text>
            {childLessons.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/lessons' as any)} style={{ marginLeft: 'auto' }}>
                <Text style={s.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>
          {childLessons.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/scan' as any)} style={s.emptyLessons} activeOpacity={0.85}>
              <Ionicons name="scan-outline" size={19} color={DK.cyan} />
              <Text style={s.emptyLessonsText}>Aucune leçon enregistrée. Scannez la première !</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 10 }}>
              {childLessons.slice(0, 4).map((l) => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => router.push(`/lesson-detail?id=${l.id}` as any)}
                  style={s.row}
                  activeOpacity={0.85}
                >
                  <Image source={iconForSubject(l.matiere)} style={s.rowIcon} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.rowSub}>{l.matiere}</Text>
                    <Text style={s.rowTitle} numberOfLines={2}>{l.titre}</Text>
                    <Text style={s.rowMeta}>{l.notions.length} {l.notions.length > 1 ? 'notions' : 'notion'}</Text>
                  </View>
                  <View style={s.rowChevron}>
                    <Ionicons name="chevron-forward" size={14} color={DK.ink} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  backBtn: { backgroundColor: DK.cyan, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: DK.bgTop, fontWeight: '800', fontSize: 15 },

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6 },
  backLinkText: { color: DK.sub, fontWeight: '700', fontSize: 13.5 },
  profileBtn: {
    width: 38, height: 38, borderRadius: 999, backgroundColor: DK.card,
    borderWidth: 1, borderColor: DK.cardBorder, alignItems: 'center', justifyContent: 'center',
  },

  idRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(46,230,214,0.4)' },
  name: { color: DK.ink, fontSize: 27, fontWeight: '900', letterSpacing: -0.6 },
  classe: { color: DK.sub, fontSize: 14, fontWeight: '600', marginTop: 2 },
  planPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(46,230,214,0.45)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5, marginTop: 7, backgroundColor: 'rgba(46,230,214,0.07)',
  },
  planPillText: { color: DK.ink, fontSize: 12, fontWeight: '700', maxWidth: 130 },
  planPillDivider: { width: 1, height: 12, backgroundColor: 'rgba(46,230,214,0.35)' },
  planPillJ: { color: DK.cyan, fontSize: 12, fontWeight: '900' },
  ringText: { fontSize: 14.5, fontWeight: '800', color: DK.ink },
  ringCaption: { color: DK.sub, fontSize: 10.5, fontWeight: '600', marginTop: 4 },

  missionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 22, padding: 14, marginBottom: 12,
  },
  missionIcon: { width: 56, height: 56 },
  missionLabel: { color: DK.cyan, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  missionTitle: { color: DK.ink, fontWeight: '900', fontSize: 18.5, letterSpacing: -0.3, marginTop: 2 },
  missionSub: { color: DK.sub, fontSize: 12, fontWeight: '500', marginTop: 2 },
  minChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(11,16,35,0.5)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  minChipText: { color: DK.ink, fontSize: 12.5, fontWeight: '700' },

  levelCard: {
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 22, padding: 14, marginBottom: 18,
  },
  flameIcon: { width: 54, height: 54 },
  levelSub: { color: DK.sub, fontSize: 11.5, fontWeight: '600' },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1, marginBottom: 7 },
  levelName: { color: DK.ink, fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  levelXP: { color: DK.ink, fontSize: 15, fontWeight: '800' },
  xpTrack: { height: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 999 },
  levelNext: { color: DK.faint, fontSize: 11, fontWeight: '600', marginTop: 5, textAlign: 'right' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(11,16,35,0.4)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  badgePillText: { color: DK.ink, fontSize: 12, fontWeight: '700' },

  sectionLabel: { color: DK.ink, fontSize: 13.5, fontWeight: '800', letterSpacing: 0.6, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12, marginTop: 2 },
  sectionLabel2: { color: DK.ink, fontSize: 13.5, fontWeight: '800', letterSpacing: 0.6 },
  seeAll: { color: DK.cyan, fontSize: 13.5, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 18 },
  tileWrap: { width: '47.8%' },
  tile: { width: '100%', borderRadius: 22, borderWidth: 1, padding: 13, minHeight: 132 },
  tileIcon: { width: 52, height: 52, marginBottom: 7 },
  tileTitle: { color: DK.ink, fontWeight: '800', fontSize: 14.5, letterSpacing: -0.3, marginBottom: 3 },
  tileDesc: { color: DK.sub, fontSize: 11.5, fontWeight: '500', paddingRight: 18 },
  tileChevron: {
    position: 'absolute', bottom: 11, right: 11, width: 25, height: 25, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 12,
  },
  rowIcon: { width: 46, height: 46 },
  rowTitle: { color: DK.ink, fontWeight: '800', fontSize: 15, letterSpacing: -0.3 },
  rowSub: { color: DK.sub, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  rowMeta: { color: DK.faint, fontSize: 11.5, fontWeight: '600', marginTop: 3 },
  rowWarn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  rowWarnText: { fontSize: 12, fontWeight: '800', color: '#FF6B5A' },
  rowChevron: {
    width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  jPill: {
    borderWidth: 1.5, borderColor: 'rgba(46,230,214,0.5)', backgroundColor: 'rgba(46,230,214,0.08)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
  },
  jPillText: { color: DK.cyan, fontWeight: '900', fontSize: 12 },

  alert: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 22, padding: 15, marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(255,107,90,0.35)',
  },
  alertText: { color: DK.ink, fontSize: 13.5, fontWeight: '600', lineHeight: 20 },
  alertBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: DK.gold, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 10,
  },
  alertBtnText: { color: DK.gold, fontSize: 13.5, fontWeight: '800' },

  emptyLessons: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, padding: 14,
  },
  emptyLessonsText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: DK.sub },
});
