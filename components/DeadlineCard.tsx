import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DK } from '../constants/darkTheme';
import { subjectIcon } from '../lib/subjectIcons';
import { progressColor, progressGradient } from '../lib/progressColor';
import { AlertPulse } from './AlertPulse';

export interface DeadlineCardData {
  type: string;
  subj: string;
  date: string;
  days: number;
  lessonCount?: number;
}

/**
 * Carte échéance unifiée (accueil enfant + écran Échéances) :
 * icône matière · titre · date + chip « DB n/20 » (dernier devoir blanc) ·
 * grand % de maîtrise + jauge · pastille J-X. Encadré rouge pulsant si
 * maîtrise < 80 % ou non évalué.
 */
export function DeadlineCard({
  e, mastery, scheme, noLesson, lessonTitles,
}: {
  e: DeadlineCardData;
  /** dernier devoir blanc de la matière (null = non évalué) */
  mastery: { pct: number; note: number } | null;
  scheme: 'dark' | 'light';
  noLesson?: boolean;
  /** titres des leçons rattachées à l'échéance */
  lessonTitles?: string[];
}) {
  const light = scheme === 'light';
  const alert = !mastery || mastery.pct < 80;
  const pct = mastery ? mastery.pct : 0;
  const pctColor = mastery ? progressColor(pct) : (light ? '#D6353A' : '#FF5A5F');
  const neutral = {
    borderWidth: 1.2, borderColor: light ? 'rgba(27,37,89,0.14)' : 'rgba(148,168,255,0.28)',
    backgroundColor: light ? '#FFFFFF' : 'rgba(20,27,51,0.75)',
  };

  return (
    <AlertPulse active={alert} scheme={scheme} neutralStyle={neutral}>
      <View style={s.row}>
        <Image source={subjectIcon(e.subj, scheme)} style={s.icon} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[s.title, light && { color: '#1B2559' }]} numberOfLines={1}>
            {e.type} de {e.subj}
          </Text>

          {/* leçon(s) rattachée(s) */}
          {lessonTitles && lessonTitles.length > 0 && (
            <View style={s.lessonRow}>
              <Ionicons name="book" size={11} color={light ? '#7B52F0' : '#B39DFF'} />
              <Text style={[s.lessonText, { color: light ? '#7B52F0' : '#B39DFF' }]} numberOfLines={1}>
                {lessonTitles.join(' · ')}
              </Text>
            </View>
          )}

          {/* date + note du dernier devoir blanc */}
          <View style={s.metaRow}>
            <Text style={[s.date, light && { color: '#6B7699' }]}>{e.date}</Text>
            <View style={[s.dbChip, { borderColor: mastery ? `${progressColor(pct)}88` : 'rgba(255,90,95,0.55)' }]}>
              <Text style={[s.dbChipText, { color: mastery ? progressColor(pct) : (light ? '#D6353A' : '#FF8A80') }]}>
                {mastery ? `DB ${mastery.note}/20` : 'À préparer'}
              </Text>
            </View>
            {noLesson && (
              <View style={s.warnRow}>
                <Ionicons name="warning" size={11} color={DK.red} />
                <Text style={s.warnText}>0 leçon</Text>
              </View>
            )}
          </View>

          {/* grand % + jauge */}
          <View style={s.gaugeRow}>
            <Text style={[s.bigPct, { color: pctColor }]}>
              {mastery ? `${pct}` : '—'}<Text style={s.bigPctSign}>{mastery ? ' %' : ''}</Text>
            </Text>
            <View style={[s.track, { backgroundColor: light ? 'rgba(27,37,89,0.1)' : 'rgba(255,255,255,0.13)' }]}>
              <LinearGradient
                colors={mastery ? progressGradient(pct) : ['rgba(255,90,95,0.9)', 'rgba(255,90,95,0.9)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.fill, { width: `${Math.max(5, pct)}%` }]}
              />
            </View>
          </View>
        </View>

        <View style={s.jPill}>
          <Text style={s.jPillText}>{e.days <= 0 ? 'Auj.' : `J-${e.days}`}</Text>
        </View>
      </View>
    </AlertPulse>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 14 },
  icon: { width: 62, height: 66, borderRadius: 16 },
  title: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.35 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  lessonText: { flex: 1, fontSize: 12.5, fontWeight: '700', letterSpacing: -0.1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 },
  date: { fontSize: 13.5, color: 'rgba(190,202,240,0.75)', fontWeight: '600' },
  dbChip: { borderWidth: 1.1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  dbChipText: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.2 },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  warnText: { fontSize: 10.5, fontWeight: '800', color: DK.red },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  bigPct: { fontSize: 30, fontWeight: '900', letterSpacing: -1, minWidth: 64 },
  bigPctSign: { fontSize: 18, fontWeight: '800' },
  track: { flex: 1, height: 9, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  jPill: {
    borderWidth: 1.6, borderColor: DK.gold, backgroundColor: 'rgba(245,194,75,0.07)',
    borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, marginLeft: 10,
  },
  jPillText: { color: DK.gold, fontWeight: '900', fontSize: 14 },
});
