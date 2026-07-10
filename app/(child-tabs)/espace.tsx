import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Breathe } from '../../components/anim/Breathe';
import { ProgressRing } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';
import { isControle } from '../../lib/matiere';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS, type Badge } from '../../lib/gamification';

// ===== Thème sombre néon (maquette) =====
export const DK = {
  bgTop: '#0A0E22',
  bgBottom: '#141B3C',
  card: 'rgba(148,168,255,0.07)',
  cardBorder: 'rgba(148,168,255,0.18)',
  ink: '#FFFFFF',
  sub: '#96A3CC',
  faint: '#5D6890',
  cyan: '#35E4D2',
  xpFrom: '#FF3D8A',
  xpMid: '#FF7A3D',
  xpTo: '#FFC24B',
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
};

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
// pilules badges teintées selon l'accent du badge (comme la maquette)
const PILL_TINT: Record<Badge['accent'], { bg: string; border: string }> = {
  violet: { bg: 'rgba(150,90,230,0.18)', border: 'rgba(150,90,230,0.55)' },
  amber: { bg: 'rgba(239,160,46,0.16)', border: 'rgba(239,160,46,0.55)' },
  green: { bg: 'rgba(53,228,210,0.12)', border: 'rgba(53,228,210,0.5)' },
  blue: { bg: 'rgba(80,120,255,0.16)', border: 'rgba(80,120,255,0.55)' },
  coral: { bg: 'rgba(240,101,76,0.16)', border: 'rgba(240,101,76,0.55)' },
};

type Tile = {
  img: any; grad: [string, string]; border: string; glow: string;
  title: string; desc: string; route: string;
};
const ACTIONS: Tile[] = [
  { img: ICONS.lightning, grad: ['rgba(196,116,32,0.5)', 'rgba(24,20,48,0.35)'], border: 'rgba(255,158,44,0.45)', glow: '#FF9E2C', title: 'Drill du jour', desc: 'Exercices quotidiens IA', route: '/drill' },
  { img: ICONS.scan, grad: ['rgba(40,80,190,0.42)', 'rgba(16,22,52,0.35)'], border: 'rgba(90,140,255,0.45)', glow: '#5A8CFF', title: 'Scanner une leçon', desc: 'Fiches, QCM, flashcards IA', route: '/scan' },
  { img: ICONS.agenda, grad: ['rgba(22,132,88,0.48)', 'rgba(14,28,44,0.35)'], border: 'rgba(52,214,150,0.45)', glow: '#34D696', title: "Scanner l'agenda", desc: 'Contrôles & échéances', route: '/scan-agenda' },
  { img: ICONS.trophy, grad: ['rgba(122,60,196,0.48)', 'rgba(24,18,52,0.35)'], border: 'rgba(178,102,255,0.45)', glow: '#B266FF', title: 'Préparer un contrôle', desc: 'Manuel ou par photo', route: '/prepare-control' },
];
const BOLD_CARDS: Tile[] = [
  { img: ICONS.book, grad: ['rgba(140,76,220,0.5)', 'rgba(30,20,60,0.4)'], border: 'rgba(170,110,255,0.5)', glow: '#AA6EFF', title: 'Carnet de lecture', desc: 'Questions sur les pages lues', route: '/lecture' },
  { img: ICONS.planning, grad: ['rgba(56,86,210,0.5)', 'rgba(18,25,60,0.4)'], border: 'rgba(100,130,255,0.5)', glow: '#6482FF', title: 'Planning', desc: 'Voir les échéances', route: '/(child-tabs)/echeances' },
];

// petites étoiles du fond (positions fixes, discrètes)
const STARS = [
  { top: 24, left: '18%', s: 2 }, { top: 60, left: '58%', s: 3 }, { top: 36, left: '84%', s: 2 },
  { top: 120, left: '42%', s: 2 }, { top: 96, left: '8%', s: 3 }, { top: 160, left: '90%', s: 2 },
  { top: 200, left: '68%', s: 2 }, { top: 148, left: '30%', s: 2 },
] as const;

function ActionTile({ t, delay }: { t: Tile; delay: number }) {
  const router = useRouter();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} style={s.tileWrap}>
      <TouchableOpacity onPress={() => router.push(t.route as any)} activeOpacity={0.85}>
        <LinearGradient colors={t.grad} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[s.tile, { borderColor: t.border }]}>
          <Image source={t.img} style={[s.tileIcon, { shadowColor: t.glow }]} />
          <Text style={s.tileTitle}>{t.title}</Text>
          <View style={s.tileBottom}>
            <Text style={s.tileDesc} numberOfLines={2}>{t.desc}</Text>
            <View style={[s.tileChevron, { borderColor: t.border }]}>
              <Ionicons name="chevron-forward" size={14} color={DK.ink} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EspaceScreen() {
  const router = useRouter();
  const { child, setChild, lessons, gamification } = useChild();
  const childLessons = child ? lessons.filter((l) => l.childId === child.id) : [];
  const controles = (child?.echeances ?? []).filter((e) => isControle(e.type));

  if (!child) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
          <StatusBar style="light" />
          <Text style={{ fontSize: 16, color: DK.sub, marginBottom: 16 }}>Aucun enfant sélectionné</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={s.backBtn}>
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
  const noLessonControle = controles.find((e) => (e.lessonIds ?? []).length === 0);
  const visibleActions = isCollege ? [...ACTIONS, ...BOLD_CARDS] : ACTIONS.slice(2, 4);

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        {/* étoiles discrètes */}
        {STARS.map((st, i) => (
          <View key={i} pointerEvents="none" style={{
            position: 'absolute', top: st.top + 40, left: st.left as any,
            width: st.s, height: st.s, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)',
          }} />
        ))}
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
              <View style={s.avatarGlow}>
                <Image source={ICONS.avatar} style={s.avatar} />
              </View>
            </Breathe>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.name}>{child.name}</Text>
              <Text style={s.classe}>{child.classe} • {child.age} ans</Text>
              {isCollege && child.next && (
                <View style={s.planPill}>
                  <Ionicons name="calendar-outline" size={14} color={DK.cyan} />
                  <Text style={s.planPillText} numberOfLines={1}>
                    {child.next.subj ? `${child.next.type} ${child.next.subj}` : 'Planification'}
                  </Text>
                  <View style={s.planPillDivider} />
                  <Text style={s.planPillJ}>J-{child.next.days}</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing value={child.progress} size={76} sw={7} color={DK.cyan} trackColor="rgba(255,255,255,0.13)">
                <Text style={s.ringText}>{child.progress}%</Text>
              </ProgressRing>
              <Text style={s.ringCaption}>Avancement</Text>
            </View>
          </View>

          {/* ===== Mission du jour ===== */}
          <TouchableOpacity onPress={() => router.push('/mission' as any)} activeOpacity={0.88}>
            <LinearGradient
              colors={['rgba(53,228,210,0.13)', 'rgba(148,168,255,0.06)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.missionCard}
            >
              <Image source={ICONS.target} style={s.missionIcon} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={s.missionLabel}>{isCollege ? 'MISSION DU JOUR' : 'ACTIVITÉ DU JOUR'}</Text>
                  <View style={s.minChip}>
                    <Ionicons name="time-outline" size={13} color={DK.ink} />
                    <Text style={s.minChipText}>{missionMin} min</Text>
                  </View>
                </View>
                <Text style={s.missionTitle} numberOfLines={1}>{missionLabel}</Text>
                <Text style={s.missionSub}>Explore ta journée d'apprentissage</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ===== Niveau ===== */}
          <LinearGradient
            colors={['rgba(255,61,138,0.1)', 'rgba(80,90,220,0.12)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.levelCard}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={ICONS.flame} style={s.flameIcon} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.levelSub}>Niveau actuel</Text>
                <View style={s.levelRow}>
                  <Text style={s.levelName}>{level.label}</Text>
                  <Text style={s.levelXP}>{gam.xp} XP</Text>
                </View>
                <View style={s.xpTrack}>
                  <LinearGradient
                    colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.xpFill, { width: `${Math.max(3, levelPct)}%` }]}
                  />
                </View>
                <Text style={s.levelNext}>vers {nextXP} XP</Text>
              </View>
            </View>
            {recentBadges.length > 0 && (
              <View style={s.badgeRow}>
                {recentBadges.map((b) => {
                  const tint = PILL_TINT[b.accent];
                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => router.push('/(child-tabs)/profil' as any)}
                      style={[s.badgePill, { backgroundColor: tint.bg, borderColor: tint.border }]}
                    >
                      {BADGE_ICON[b.id]
                        ? <Image source={BADGE_ICON[b.id]} style={{ width: 19, height: 19 }} />
                        : <Ionicons name={b.icon as any} size={14} color={DK.ink} />}
                      <Text style={s.badgePillText}>{b.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </LinearGradient>

          {/* ===== Actions scolaires ===== */}
          <Text style={s.sectionLabel}>ACTIONS SCOLAIRES</Text>
          <View style={s.grid}>
            {visibleActions.map((t, i) => <ActionTile key={t.route} t={t} delay={i * 70} />)}
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
                      <View style={{ flex: 1, marginLeft: 13 }}>
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
              colors={['rgba(210,70,45,0.4)', 'rgba(110,30,60,0.3)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.alert}
            >
              <Image source={ICONS.warning} style={{ width: 44, height: 44 }} />
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
                  <View style={{ flex: 1, marginLeft: 13 }}>
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

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6 },
  backLinkText: { color: DK.sub, fontWeight: '700', fontSize: 13.5 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: DK.card,
    borderWidth: 1, borderColor: DK.cardBorder, alignItems: 'center', justifyContent: 'center',
  },

  idRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarGlow: {
    borderRadius: 60, shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 18, elevation: 10,
  },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: 'rgba(53,228,210,0.5)' },
  name: { color: DK.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.7 },
  classe: { color: DK.sub, fontSize: 15, fontWeight: '600', marginTop: 2 },
  planPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    borderWidth: 1.2, borderColor: 'rgba(53,228,210,0.5)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7, marginTop: 9, backgroundColor: 'rgba(53,228,210,0.09)',
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  planPillText: { color: DK.ink, fontSize: 13, fontWeight: '700', maxWidth: 132 },
  planPillDivider: { width: 1, height: 13, backgroundColor: 'rgba(53,228,210,0.4)' },
  planPillJ: { color: DK.cyan, fontSize: 13, fontWeight: '900' },
  ringText: { fontSize: 17, fontWeight: '900', color: DK.ink },
  ringCaption: { color: DK.sub, fontSize: 11.5, fontWeight: '600', marginTop: 5 },

  missionCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 24, padding: 16, marginBottom: 13,
  },
  missionIcon: {
    width: 76, height: 76,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16,
  },
  missionLabel: { color: DK.cyan, fontSize: 11.5, fontWeight: '800', letterSpacing: 1, flex: 1 },
  missionTitle: { color: DK.ink, fontWeight: '900', fontSize: 22, letterSpacing: -0.4, marginTop: 4 },
  missionSub: { color: DK.sub, fontSize: 13, fontWeight: '500', marginTop: 3 },
  minChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: DK.cardBorder, backgroundColor: 'rgba(10,14,34,0.55)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  minChipText: { color: DK.ink, fontSize: 13, fontWeight: '700' },

  levelCard: {
    borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 24, padding: 16, marginBottom: 22,
  },
  flameIcon: {
    width: 76, height: 76,
    shadowColor: '#FF7A3D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14,
  },
  levelSub: { color: DK.sub, fontSize: 13, fontWeight: '600' },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1, marginBottom: 9 },
  levelName: { color: DK.ink, fontSize: 23, fontWeight: '900', letterSpacing: -0.5 },
  levelXP: { color: DK.ink, fontSize: 17, fontWeight: '800' },
  xpTrack: { height: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 999 },
  levelNext: { color: DK.faint, fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'right' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 14 },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderWidth: 1.2, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8,
  },
  badgePillText: { color: DK.ink, fontSize: 13, fontWeight: '700' },

  sectionLabel: { color: DK.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0.8, marginBottom: 13 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12, marginTop: 2 },
  sectionLabel2: { color: DK.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
  seeAll: { color: DK.cyan, fontSize: 13.5, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  tileWrap: { width: '47.6%' },
  tile: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 15, minHeight: 158 },
  tileIcon: {
    width: 64, height: 64, marginBottom: 10,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 13,
  },
  tileTitle: { color: DK.ink, fontWeight: '800', fontSize: 16, letterSpacing: -0.3, marginBottom: 4 },
  tileBottom: { flexDirection: 'row', alignItems: 'flex-end' },
  tileDesc: { flex: 1, color: DK.sub, fontSize: 12.5, fontWeight: '500', lineHeight: 17 },
  tileChevron: {
    width: 28, height: 28, borderRadius: 999, borderWidth: 1,
    backgroundColor: 'rgba(10,14,34,0.45)', alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 13,
  },
  rowIcon: { width: 50, height: 50 },
  rowTitle: { color: DK.ink, fontWeight: '800', fontSize: 15.5, letterSpacing: -0.3 },
  rowSub: { color: DK.sub, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  rowMeta: { color: DK.faint, fontSize: 11.5, fontWeight: '600', marginTop: 3 },
  rowWarn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  rowWarnText: { fontSize: 12, fontWeight: '800', color: '#FF6B5A' },
  rowChevron: {
    width: 27, height: 27, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  jPill: {
    borderWidth: 1.5, borderColor: 'rgba(53,228,210,0.55)', backgroundColor: 'rgba(53,228,210,0.09)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 7,
  },
  jPillText: { color: DK.cyan, fontWeight: '900', fontSize: 12.5 },

  alert: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 24, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,107,90,0.4)',
  },
  alertText: { color: DK.ink, fontSize: 13.5, fontWeight: '600', lineHeight: 20 },
  alertBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: DK.gold, borderRadius: 999,
    paddingHorizontal: 15, paddingVertical: 9, marginTop: 11,
  },
  alertBtnText: { color: DK.gold, fontSize: 13.5, fontWeight: '800' },

  emptyLessons: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, padding: 14,
  },
  emptyLessonsText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: DK.sub },
});
