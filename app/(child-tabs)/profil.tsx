import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProgressRing } from '../../components/ui/Progress';
import { useChild } from '../../contexts/ChildContext';
import { getLevel, getLevelProgress, getNextLevelXP, BADGE_DEFS, type Badge } from '../../lib/gamification';
import { statsByMatiere, fragileCompetences, masteredCompetences } from '../../lib/adaptation';
import { DK, DK_ICONS as ICONS } from '../../constants/darkTheme';

const NIVEAU_LABELS: Record<string, string> = {
  fragile: 'Fragile', moyen: 'Moyen', bon: 'Bon', avance: 'Avancé', tres_avance: 'Très avancé',
};
const OBJ_LABELS: Record<string, string> = {
  consolidation: 'Consolidation', bon_niveau: 'Bon niveau', excellence: 'Excellence', concours: 'Concours / Prépa',
};
const TON_LABELS: Record<string, string> = { bienveillant: 'Bienveillant', exigeant: 'Exigeant' };

// Icônes du pack pour les badges pertinents (sinon Ionicons du badge)
const BADGE_ICON: Record<string, any> = {
  first_flashcard: ICONS.flashcards, first_exercise: ICONS.pencil, first_controle: ICONS.medal,
  first_minitest: ICONS.medal, first_scan: ICONS.scan, perfect_test: ICONS.trophy,
};
// Teintes néon par accent de badge (comme la maquette : débloqué = pilule colorée)
const BADGE_TINT: Record<Badge['accent'], { bg: string; border: string; fg: string }> = {
  violet: { bg: 'rgba(139,124,246,0.12)', border: 'rgba(139,124,246,0.55)', fg: '#C9A8FF' },
  amber: { bg: 'rgba(255,122,61,0.12)', border: 'rgba(255,122,61,0.55)', fg: '#FFB27A' },
  green: { bg: 'rgba(53,228,210,0.1)', border: 'rgba(53,228,210,0.5)', fg: DK.cyan },
  blue: { bg: 'rgba(90,140,255,0.12)', border: 'rgba(90,140,255,0.55)', fg: '#9CB8FF' },
  coral: { bg: 'rgba(255,90,60,0.12)', border: 'rgba(255,90,60,0.55)', fg: '#FF9B8A' },
};
// Couleurs des barres de progression par matière (cycle, comme la maquette)
const MAT_COLORS = ['#8B7CF6', '#FF3D8A', '#FFC24B', '#35E4D2', '#5A8CFF', '#34D696'];
const MAT_LABELS = ['#C9A8FF', '#FF8DB8', '#F5C24B', '#35E4D2', '#9CB8FF', '#7BE6A0'];

export default function ProfilScreen() {
  const router = useRouter();
  const { child, gamification, getProfile, getDrillResults } = useChild();
  const profile = child ? getProfile(child.id) : undefined;
  const drillResults = child ? getDrillResults(child.id) : [];
  const matStats = statsByMatiere(drillResults);
  const fragiles = fragileCompetences(drillResults);
  const maitrisees = masteredCompetences(drillResults);

  if (!child) {
    return (
      <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
        <SafeAreaView style={s.safe}>
          <StatusBar style="light" />
          <View style={s.center}>
            <Text style={s.noChild}>Aucun enfant sélectionné</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const gam = gamification(child.id);
  const level = getLevel(gam.xp);
  const levelPct = getLevelProgress(gam.xp);
  const nextXP = getNextLevelXP(gam.xp);
  const unlockedCount = BADGE_DEFS.filter((b) => gam.badges.includes(b.id)).length;

  return (
    <LinearGradient colors={[DK.bgTop, DK.bgBottom]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* ===== Identité + streak ===== */}
          <View style={s.identity}>
            <View style={s.avatarGlow}>
              <Image source={ICONS.avatar} style={s.avatar} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{child.name}</Text>
              <Text style={s.classe}>{child.classe} • {child.age} ans</Text>
            </View>
            <View style={s.streakPill}>
              <Image source={ICONS.flame} style={s.streakFlame} />
              <Text style={s.streakText}>{gam.streak} {gam.streak > 1 ? 'jours' : 'jour'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.editBtn}>
              <Ionicons name="create-outline" size={19} color={DK.cyan} />
            </TouchableOpacity>
          </View>

          {/* ===== Niveau : anneau + XP ===== */}
          <LinearGradient
            colors={['rgba(60,40,80,0.4)', 'rgba(19,26,58,0.65)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.levelCard}
          >
            <ProgressRing value={Math.round(levelPct * 100)} size={86} sw={7} color={DK.xpMid} trackColor="rgba(148,168,255,0.18)">
              <Text style={s.ringXP}>{gam.xp}</Text>
              <Text style={s.ringXPSub}>/ {nextXP} XP</Text>
            </ProgressRing>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.levelSub}>Niveau actuel</Text>
              <Text style={s.levelName}>{level.label}</Text>
              <Text style={s.levelNext}>Prochain niveau : <Text style={s.levelNextGold}>{nextXP} XP</Text></Text>
              <View style={s.xpTrack}>
                <LinearGradient
                  colors={[DK.xpFrom, DK.xpMid, DK.xpTo]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.xpFill, { width: `${Math.max(3, levelPct * 100)}%` }]}
                />
              </View>
            </View>
          </LinearGradient>

          <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.editRow} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={DK.cyan} />
            <Text style={s.editRowText}>Modifier le profil</Text>
            <Ionicons name="chevron-forward" size={16} color={DK.cyan} />
          </TouchableOpacity>

          {/* ===== Badges ===== */}
          <View style={s.sectionRowBetween}>
            <Text style={s.sectionLabel}>BADGES</Text>
            <Text style={s.sectionCount}>{unlockedCount} / {BADGE_DEFS.length}</Text>
          </View>
          <View style={s.badgeGrid}>
            {BADGE_DEFS.map((b, i) => {
              const unlocked = gam.badges.includes(b.id);
              const tint = BADGE_TINT[b.accent];
              return (
                <Animated.View
                  key={b.id}
                  entering={FadeInDown.delay(i * 45).springify().damping(16)}
                  style={[
                    s.badgeTile,
                    unlocked
                      ? { backgroundColor: tint.bg, borderColor: tint.border }
                      : s.badgeTileLocked,
                  ]}
                >
                  {unlocked ? (
                    BADGE_ICON[b.id]
                      ? <Image source={BADGE_ICON[b.id]} style={[s.badgeImg, { shadowColor: tint.fg }]} />
                      : <Ionicons name={b.icon as any} size={22} color={tint.fg} />
                  ) : (
                    <Ionicons name="lock-closed" size={18} color={DK.faint} />
                  )}
                  <Text
                    style={[s.badgeName, { color: unlocked ? tint.fg : DK.faint }]}
                    numberOfLines={2}
                  >
                    {b.label}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* ===== Profil scolaire ===== */}
          {profile ? (
            <>
              <Text style={[s.sectionLabel, s.sectionSpace]}>PROFIL SCOLAIRE</Text>
              <View style={s.profGrid}>
                {[
                  { icon: 'bar-chart-outline', label: 'Niveau', value: NIVEAU_LABELS[profile.niveauEstime] },
                  { icon: 'flag-outline', label: 'Objectif', value: OBJ_LABELS[profile.objectif] },
                  { icon: 'time-outline', label: 'Durée/jour', value: profile.dureeQuotidienne === 'custom' ? 'Libre' : `${profile.dureeQuotidienne} min` },
                  { icon: 'heart-outline', label: 'Ton', value: TON_LABELS[profile.ton] },
                ].map((it) => (
                  <View key={it.label} style={s.profItem}>
                    <Ionicons name={it.icon as any} size={16} color={DK.cyan} />
                    <Text style={s.profItemLabel}>{it.label}</Text>
                    <Text style={s.profItemValue}>{it.value}</Text>
                  </View>
                ))}
              </View>
              {profile.etablissement && (
                <View style={s.profSchool}>
                  <Ionicons name="school-outline" size={15} color={DK.sub} />
                  <Text style={s.profSchoolText}>{profile.etablissement}</Text>
                </View>
              )}
              {profile.noteLibre && (
                <View style={s.profNote}>
                  <Text style={s.profNoteLabel}>NOTE POUR L'IA</Text>
                  <Text style={s.profNoteText}>{profile.noteLibre}</Text>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity onPress={() => router.push('/edit-child' as any)} style={s.profEmpty} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={20} color={DK.cyan} />
              <Text style={s.profEmptyText}>Complétez le profil scolaire pour personnaliser l'IA</Text>
            </TouchableOpacity>
          )}

          {/* ===== Matières suivies ===== */}
          <Text style={[s.sectionLabel, s.sectionSpace]}>MATIÈRES SUIVIES</Text>
          <View style={s.chipsRow}>
            {child.matieres.map((m, i) => (
              <View key={m.s} style={[s.chip, { borderColor: `${MAT_COLORS[i % MAT_COLORS.length]}66` }]}>
                <Ionicons name={m.icon as any} size={14} color={MAT_LABELS[i % MAT_LABELS.length]} />
                <Text style={[s.chipText, { color: MAT_LABELS[i % MAT_LABELS.length] }]}>{m.s}</Text>
                <Text style={[s.chipPct, { color: MAT_LABELS[i % MAT_LABELS.length] }]}>{m.v}%</Text>
              </View>
            ))}
          </View>

          {/* ===== Forts / Faibles ===== */}
          <View style={s.row2}>
            <View style={s.halfCard}>
              <View style={[s.halfIcon, { backgroundColor: 'rgba(52,214,150,0.14)', borderColor: 'rgba(52,214,150,0.45)' }]}>
                <Ionicons name="trending-up-outline" size={19} color="#7BE6A0" />
              </View>
              <Text style={s.cardLabel}>POINTS FORTS</Text>
              {child.forts.map((f) => (
                <Text key={f} style={s.cardItem}>{f}</Text>
              ))}
            </View>
            <View style={s.halfCard}>
              <View style={[s.halfIcon, { backgroundColor: 'rgba(255,107,90,0.14)', borderColor: 'rgba(255,107,90,0.45)' }]}>
                <Ionicons name="radio-button-off-outline" size={19} color="#FF9B8A" />
              </View>
              <Text style={s.cardLabel}>À AMÉLIORER</Text>
              {child.faibles.map((f) => (
                <Text key={f} style={s.cardItem}>{f}</Text>
              ))}
            </View>
          </View>

          {/* ===== Progression globale ===== */}
          <Text style={[s.sectionLabel, s.sectionSpace]}>PROGRESSION</Text>
          <View style={s.progressCard}>
            <ProgressRing value={child.progress} size={64} sw={7} color={DK.cyan} trackColor="rgba(148,168,255,0.18)">
              <Text style={s.ringText}>{child.progress}%</Text>
            </ProgressRing>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.progressTitle}>Bon rythme de révision</Text>
              <Text style={s.progressSub}>Régulier sur les 2 dernières semaines.</Text>
            </View>
          </View>

          {/* ===== Progression par matière (drills) ===== */}
          {matStats.length > 0 && (
            <>
              <Text style={[s.sectionLabel, s.sectionSpace]}>PROGRESSION PAR MATIÈRE</Text>
              <LinearGradient
                colors={['rgba(47,60,112,0.45)', 'rgba(19,26,58,0.6)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.matCard}
              >
                {matStats.map((m, i) => (
                  <View key={m.matiere}>
                    <View style={s.matStatRow}>
                      <Text style={s.matStatName}>{m.matiere}</Text>
                      <Text style={[s.matStatPct, { color: MAT_LABELS[i % MAT_LABELS.length] }]}>
                        {m.taux} % · {m.total} exo{m.total > 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={s.matTrack}>
                      <View style={[s.matFill, { width: `${Math.max(3, m.taux)}%`, backgroundColor: MAT_COLORS[i % MAT_COLORS.length] }]} />
                    </View>
                  </View>
                ))}
              </LinearGradient>

              {/* ===== Compétences fragiles / maîtrisées ===== */}
              {(fragiles.length > 0 || maitrisees.length > 0) && (
                <Text style={[s.sectionLabel, s.sectionSpace]}>COMPÉTENCES</Text>
              )}
              {fragiles.length > 0 && (
                <View style={s.compRow}>
                  <Text style={s.compLabelFragile}>Fragiles :</Text>
                  {fragiles.map((f) => (
                    <View key={`${f.matiere}-${f.competence}`} style={s.compPillFragile}>
                      <Text style={s.compPillFragileText}>{f.competence} · {f.taux}%</Text>
                    </View>
                  ))}
                </View>
              )}
              {maitrisees.length > 0 && (
                <View style={s.compRow}>
                  <Text style={s.compLabelMaster}>Maîtrisées :</Text>
                  {maitrisees.map((f) => (
                    <View key={`${f.matiere}-${f.competence}`} style={s.compPillMaster}>
                      <Text style={s.compPillMasterText}>{f.competence} · {f.taux}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ===== Historique ===== */}
          {child.history.length > 0 && (
            <>
              <Text style={[s.sectionLabel, s.sectionSpace]}>HISTORIQUE</Text>
              <View style={{ gap: 8 }}>
                {child.history.map((h, i) => (
                  <LinearGradient
                    key={i}
                    colors={['rgba(47,60,112,0.4)', 'rgba(19,26,58,0.55)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.histRow}
                  >
                    <Image source={ICONS.book} style={s.histIcon} />
                    <View style={{ flex: 1, marginLeft: 11 }}>
                      <Text style={s.histTitle}>{h.subj} · {h.type}</Text>
                      <Text style={s.histDate}>{h.date}</Text>
                    </View>
                    <Text style={[s.histScore, { color: BADGE_TINT[h.accent]?.fg ?? DK.cyan }]}>{h.score}</Text>
                  </LinearGradient>
                ))}
              </View>
            </>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noChild: { fontSize: 16, color: DK.sub },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarGlow: {
    borderRadius: 42, shadowColor: DK.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  avatar: { width: 74, height: 74, borderRadius: 37, borderWidth: 2, borderColor: 'rgba(53,228,210,0.35)' },
  name: { fontSize: 24, fontWeight: '800', color: DK.ink, letterSpacing: -0.5 },
  classe: { fontSize: 13, color: DK.sub, fontWeight: '600', marginTop: 1 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,122,61,0.12)', borderWidth: 1, borderColor: 'rgba(255,122,61,0.55)',
  },
  streakFlame: { width: 20, height: 20 },
  streakText: { fontSize: 13, fontWeight: '800', color: '#FFB27A' },
  editBtn: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: DK.card,
    borderWidth: 1, borderColor: DK.cardBorder, alignItems: 'center', justifyContent: 'center',
  },

  levelCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 24, padding: 16, marginBottom: 12,
  },
  ringXP: { fontSize: 17, fontWeight: '800', color: DK.ink },
  ringXPSub: { fontSize: 10.5, fontWeight: '600', color: DK.sub, marginTop: 1 },
  levelSub: { fontSize: 12, color: DK.sub, fontWeight: '600' },
  levelName: { fontSize: 22, fontWeight: '800', color: DK.ink, letterSpacing: -0.4 },
  levelNext: { fontSize: 12, color: DK.sub, fontWeight: '600', marginTop: 3 },
  levelNextGold: { color: DK.gold, fontWeight: '800' },
  xpTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(148,168,255,0.15)', marginTop: 8, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },

  editRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(53,228,210,0.09)', borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)',
    borderRadius: 15, padding: 13,
  },
  editRowText: { flex: 1, fontSize: 14, fontWeight: '800', color: DK.cyan },

  sectionLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(200,210,255,0.55)', letterSpacing: 2, marginBottom: 11 },
  sectionSpace: { marginTop: 22 },
  sectionRowBetween: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22,
  },
  sectionCount: { fontSize: 12, fontWeight: '700', color: DK.sub },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeTile: {
    width: '22.7%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderRadius: 18, borderWidth: 1,
  },
  badgeTileLocked: {
    backgroundColor: 'rgba(148,168,255,0.06)', borderColor: 'rgba(148,168,255,0.14)', opacity: 0.75,
  },
  badgeImg: {
    width: 24, height: 24,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8,
  },
  badgeName: { fontSize: 9.5, fontWeight: '700', marginTop: 4, textAlign: 'center', lineHeight: 12 },

  profGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  profItem: {
    width: '47.5%', backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 16, padding: 13, gap: 3,
  },
  profItemLabel: { fontSize: 11.5, fontWeight: '700', color: DK.faint, marginTop: 4 },
  profItemValue: { fontSize: 15, fontWeight: '800', color: DK.ink, letterSpacing: -0.3 },
  profSchool: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  profSchoolText: { fontSize: 13.5, fontWeight: '600', color: DK.sub },
  profNote: {
    backgroundColor: 'rgba(53,228,210,0.08)', borderWidth: 1, borderColor: 'rgba(53,228,210,0.3)',
    borderRadius: 14, padding: 13, marginTop: 10,
  },
  profNoteLabel: { fontSize: 11, fontWeight: '800', color: DK.cyan, letterSpacing: 0.3, marginBottom: 5 },
  profNoteText: { fontSize: 13.5, fontWeight: '500', color: DK.ink, lineHeight: 19 },
  profEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22,
    backgroundColor: 'rgba(53,228,210,0.09)', borderWidth: 1, borderColor: 'rgba(53,228,210,0.4)',
    borderRadius: 14, padding: 14,
  },
  profEmptyText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: DK.cyan },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: DK.card, borderWidth: 1,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12,
  },
  chipText: { fontSize: 13.5, fontWeight: '700' },
  chipPct: { fontSize: 12, fontWeight: '800' },

  row2: { flexDirection: 'row', gap: 11, marginTop: 22 },
  halfCard: {
    flex: 1, backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 15,
  },
  halfIcon: {
    width: 36, height: 36, borderRadius: 11, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardLabel: { fontSize: 12, fontWeight: '800', color: DK.sub, marginBottom: 6, letterSpacing: 0.5 },
  cardItem: { fontSize: 14, fontWeight: '700', color: DK.ink, marginTop: 3 },

  progressCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DK.card, borderWidth: 1, borderColor: DK.cardBorder,
    borderRadius: 20, padding: 16,
  },
  ringText: { fontSize: 16, fontWeight: '800', color: DK.ink },
  progressTitle: { fontSize: 15, fontWeight: '800', color: DK.ink },
  progressSub: { fontSize: 13, color: DK.sub, fontWeight: '500', marginTop: 2 },

  matCard: {
    borderWidth: 1, borderColor: DK.cardBorder, borderRadius: 22, padding: 16, gap: 13,
  },
  matStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  matStatName: { fontSize: 12.5, fontWeight: '700', color: DK.ink },
  matStatPct: { fontSize: 12.5, fontWeight: '800' },
  matTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(148,168,255,0.15)', overflow: 'hidden' },
  matFill: { height: '100%', borderRadius: 4 },

  compRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center', marginBottom: 8 },
  compLabelFragile: { fontSize: 11.5, fontWeight: '800', color: '#FF6B6B', marginRight: 2 },
  compLabelMaster: { fontSize: 11.5, fontWeight: '800', color: '#7BE6A0', marginRight: 2 },
  compPillFragile: {
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,90,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,90,60,0.45)',
  },
  compPillFragileText: { fontSize: 11.5, fontWeight: '700', color: '#FF9B8A' },
  compPillMaster: {
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(110,230,150,0.1)', borderWidth: 1, borderColor: 'rgba(110,230,150,0.45)',
  },
  compPillMasterText: { fontSize: 11.5, fontWeight: '700', color: '#7BE6A0' },

  histRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(148,168,255,0.16)', borderRadius: 18,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  histIcon: { width: 34, height: 34 },
  histTitle: { fontSize: 13, fontWeight: '700', color: DK.ink },
  histDate: { fontSize: 11.5, color: DK.sub, fontWeight: '600', marginTop: 1 },
  histScore: { fontSize: 12.5, fontWeight: '800' },
});
