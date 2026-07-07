import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing, FadeIn, useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../constants/theme';
import { BADGE_DEFS, type BadgeId } from '../../lib/gamification';
import { playSfx } from '../../lib/sfx';

function Star({ angle, delay }: { angle: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle) * t.value * 90 },
      { translateY: Math.sin(angle) * t.value * 90 },
      { scale: 0.4 + t.value * 0.8 },
    ],
    opacity: 1 - t.value,
  }));
  return (
    <Animated.Text style={[{ position: 'absolute', fontSize: 20 }, style]}>✨</Animated.Text>
  );
}

function BadgePop({ badgeId, onDone }: { badgeId: BadgeId; onDone: () => void }) {
  const badge = BADGE_DEFS.find((b) => b.id === badgeId);
  const scale = useSharedValue(0);
  useEffect(() => {
    playSfx('badge');
    scale.value = withSequence(
      withSpring(1.15, { damping: 9, stiffness: 160 }),
      withSpring(1, { damping: 14 }),
      // léger battement pendant l'affichage
      withRepeat(withSequence(withTiming(1.04, { duration: 700 }), withTiming(1, { duration: 700 })), -1),
    );
  }, [badgeId]);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (!badge) { onDone(); return null; }
  const accent = T[badge.accent];
  return (
    <View style={s.centerZone}>
      {Array.from({ length: 8 }, (_, i) => (
        <Star key={i} angle={(i / 8) * Math.PI * 2 - Math.PI / 2} delay={i * 40} />
      ))}
      <Animated.View style={[s.badgeCircle, { backgroundColor: accent.soft }, pop]}>
        <Ionicons name={badge.icon as any} size={54} color={accent.fg} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(250)}>
        <Text style={s.unlockLabel}>NOUVEAU BADGE</Text>
        <Text style={s.badgeName}>{badge.label}</Text>
        <Text style={s.badgeDesc}>{badge.desc}</Text>
      </Animated.View>
    </View>
  );
}

/**
 * Fanfare de badge : affiche chaque badge débloqué au centre de l'écran
 * (pop + étoiles + son). Passe `badges` puis remets-le à [] via onFinished.
 */
export function BadgeCelebration({ badges, onFinished }: { badges: BadgeId[]; onFinished: () => void }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [badges]);
  if (badges.length === 0) return null;

  const next = () => {
    if (index + 1 < badges.length) setIndex(index + 1);
    else onFinished();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={next}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={next}>
        <BadgePop badgeId={badges[index]} onDone={next} />
        <Text style={s.tapHint}>
          {index + 1 < badges.length ? `Touchez pour continuer (${index + 1}/${badges.length})` : 'Touchez pour fermer'}
        </Text>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(12,24,16,0.82)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  centerZone: { alignItems: 'center', justifyContent: 'center' },
  badgeCircle: {
    width: 120, height: 120, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    marginBottom: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)',
  },
  unlockLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  badgeName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginTop: 4 },
  badgeDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 14.5, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  tapHint: { position: 'absolute', bottom: 56, color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
});
