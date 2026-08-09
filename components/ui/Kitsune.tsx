import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, View, Image, Easing, StyleSheet } from 'react-native';

const MOVES = ['nod', 'tilt', 'wag', 'paw', 'blink', 'hop', 'tap'];

/**
 * État de réaction de Kitsune (reprend `pick()` du handoff) : à chaque appel de
 * `react()`, joue une pose aléatoire (différente de la précédente) et affiche
 * éventuellement une bulle d'encouragement.
 */
export function useKitsuneReaction() {
  const [state, setState] = useState<{ move: string; tick: number; cheer: string | null }>({
    move: 'idle',
    tick: 0,
    cheer: null,
  });
  const react = useCallback((cheer: string | null = null, forced?: string) => {
    setState((st) => {
      const pool = MOVES.filter((m) => m !== st.move);
      return { move: forced || pool[Math.floor(Math.random() * pool.length)], tick: st.tick + 1, cheer };
    });
  }, []);
  return { ...state, react };
}

/**
 * Mascotte Kitsune — portée depuis design/handoff/Kitsune.dc.html.
 * 4 calques PNG indépendants (tête, corps, patte, queue) superposés.
 *
 * - Inactivité : respiration du corps, balancement lent de la queue, clignement.
 * - Réaction : à chaque incrément de `tick`, la pose `move` est jouée
 *   (nod / tilt / wag / paw / blink / hop / tap) — « Kitsune réagit à chaque choix ».
 * - `move="work"` : boucle d'activité continue (écran de génération).
 *
 * Positions/tailles = pourcentages du handoff convertis en px depuis `width`
 * (ratio du cadre 700×850).
 */
const RATIO = 850 / 700;

interface Props {
  width?: number;
  move?: string;
  tick?: number;
}

type Frame = [number, number];

export function Kitsune({ width = 196, move = 'idle', tick = 0 }: Props) {
  const W = width;
  const H = W * RATIO;

  // Boîtes des calques (px) — cf. Kitsune.dc.html.
  const tailBox = { left: 0.6429 * W, top: 0.4353 * H, w: 0.3571 * W, h: 0.5471 * H };
  const pawBox = { left: 0.1214 * W, top: 0.7859 * H, w: 0.24 * W, h: 0.2141 * H };
  const headBox = { left: 0.0214 * W, top: 0, w: 0.7571 * W, h: 0.5882 * H };
  const lidMax = 0.16 * headBox.h;

  // Valeurs d'inactivité (boucles).
  const breathe = useRef(new Animated.Value(0)).current;
  const idleTail = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  // Valeurs de réaction (one-shot), en degrés / px.
  const rHeadDeg = useRef(new Animated.Value(0)).current;
  const rHeadTY = useRef(new Animated.Value(0)).current;
  const rTailDeg = useRef(new Animated.Value(0)).current;
  const rPawDeg = useRef(new Animated.Value(0)).current;
  const rPawTY = useRef(new Animated.Value(0)).current;
  const rBodyTY = useRef(new Animated.Value(0)).current;
  const rSquash = useRef(new Animated.Value(0)).current;
  const workLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const loop = (v: Animated.Value, duration: number) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }));
    const b = loop(breathe, 4600);
    const t = loop(idleTail, 4200);
    const k = loop(blink, 6000);
    b.start();
    t.start();
    k.start();
    return () => {
      b.stop();
      t.stop();
      k.stop();
    };
  }, [breathe, idleTail, blink]);

  // Réaction : joue la pose `move` au changement de `tick`.
  useEffect(() => {
    workLoop.current?.stop();
    workLoop.current = null;

    const kf = (v: Animated.Value, frames: Frame[], duration: number, easing = Easing.inOut(Easing.ease)) => {
      v.setValue(frames[0][1]);
      const seq = frames.slice(1).map((f, i) =>
        Animated.timing(v, { toValue: f[1], duration: (f[0] - frames[i][0]) * duration, easing, useNativeDriver: false }),
      );
      return Animated.sequence(seq);
    };
    const settle = () => {
      [rHeadDeg, rHeadTY, rTailDeg, rPawDeg, rPawTY, rBodyTY, rSquash].forEach((v) => v.setValue(0));
    };

    const back = Easing.bezier(0.34, 1.4, 0.64, 1);
    let anim: Animated.CompositeAnimation | null = null;

    switch (move) {
      case 'nod':
        anim = Animated.parallel([
          kf(rHeadDeg, [[0, 0], [0.22, 3], [0.46, -1.5], [0.7, 2.4], [1, 0]], 800, back),
          kf(rHeadTY, [[0, 0], [0.22, 0.02 * H], [0.7, 0.015 * H], [1, 0]], 800),
          kf(rTailDeg, [[0, 0], [0.5, -7], [1, 0]], 900),
        ]);
        break;
      case 'tilt':
        anim = Animated.parallel([
          kf(rHeadDeg, [[0, 0], [0.3, -7], [0.62, 4], [1, 0]], 900, back),
          kf(rTailDeg, [[0, 0], [0.45, 4], [1, 0]], 1000),
        ]);
        break;
      case 'wag':
        anim = Animated.parallel([
          kf(rTailDeg, [[0, 0], [0.18, -13], [0.38, 9], [0.58, -8], [0.78, 5], [1, 0]], 1000),
          kf(rSquash, [[0, 0], [0.3, 0.05], [0.6, -0.02], [1, 0]], 700),
          kf(rHeadTY, [[0, 0], [0.4, 0.018 * H], [1, 0]], 700),
        ]);
        break;
      case 'paw':
        anim = Animated.parallel([
          kf(rPawDeg, [[0, 0], [0.3, -16], [0.55, -13], [0.8, -4], [1, 0]], 1000, back),
          kf(rPawTY, [[0, 0], [0.3, -0.06 * pawBox.h], [1, 0]], 1000),
          kf(rHeadDeg, [[0, 0], [0.45, 3.5], [1, 0]], 1000),
        ]);
        break;
      case 'blink':
        anim = Animated.parallel([
          kf(rSquash, [[0, 0], [0.3, 0.04], [0.6, 0.02], [1, 0]], 800),
          kf(rHeadTY, [[0, 0], [0.3, -0.01 * H], [1, 0]], 800, back),
        ]);
        break;
      case 'hop':
        anim = Animated.parallel([
          kf(rBodyTY, [[0, 0], [0.18, 0], [0.42, -0.09 * H], [0.7, 0], [1, 0]], 800, back),
          kf(rSquash, [[0, 0], [0.18, 0.08], [0.42, -0.05], [0.7, 0.05], [1, 0]], 800),
          kf(rTailDeg, [[0, 0], [0.3, -12], [0.6, 8], [1, 0]], 900),
        ]);
        break;
      case 'tap':
        anim = Animated.parallel([
          kf(rPawDeg, [[0, 0], [0.2, -10], [0.4, 0], [0.6, -8], [0.8, 0], [1, 0]], 1000),
          kf(rPawTY, [[0, 0], [0.2, -0.04 * pawBox.h], [0.6, -0.03 * pawBox.h], [1, 0]], 1000),
          kf(rHeadDeg, [[0, 0], [0.5, 2.5], [1, 0]], 900),
        ]);
        break;
      case 'work':
        anim = Animated.loop(
          Animated.parallel([
            kf(rPawDeg, [[0, 0], [0.25, -9], [0.5, 0], [0.75, -7], [1, 0]], 1400),
            kf(rHeadTY, [[0, 0], [0.5, 0.014 * H], [1, 0]], 2200),
            kf(rTailDeg, [[0, 0], [0.5, -6], [1, 0]], 2800),
          ]),
        );
        workLoop.current = anim;
        break;
      default:
        settle();
        return;
    }

    anim.start(({ finished }) => {
      if (finished && move !== 'work') settle();
    });
    return () => {
      anim?.stop();
    };
  }, [tick, move, H, pawBox.h, rHeadDeg, rHeadTY, rTailDeg, rPawDeg, rPawTY, rBodyTY, rSquash]);

  // Compositions.
  const idleTailDeg = idleTail.interpolate({ inputRange: [0, 0.25, 0.62, 1], outputRange: [0, -3.5, 2.5, 0] });
  const tailDeg = Animated.add(idleTailDeg, rTailDeg);
  const toDeg = (v: Animated.AnimatedInterpolation<number> | Animated.Animated) =>
    (v as any).interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });

  const breatheScale = breathe.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.015, 1] });
  const scaleX = Animated.multiply(breatheScale, Animated.add(1, rSquash));
  const scaleY = Animated.multiply(breatheScale, Animated.add(1, Animated.multiply(rSquash, -1)));
  const lidHeight = blink.interpolate({ inputRange: [0, 0.93, 0.96, 1], outputRange: [0, 0, lidMax, 0] });

  // Émulation de transform-origin par translations (RN pivote au centre).
  const originRotate = (deg: any, boxW: number, boxH: number, ox: number, oy: number) => {
    const dx = (0.5 - ox) * boxW;
    const dy = (0.5 - oy) * boxH;
    return [
      { translateX: dx },
      { translateY: dy },
      { rotate: toDeg(deg) },
      { translateX: -dx },
      { translateY: -dy },
    ];
  };

  const layer = (src: any) => <Image source={src} resizeMode="contain" style={styles.fill} />;

  return (
    <View style={{ width: W, height: H }}>
      <Animated.View style={[styles.fill, { transform: [{ translateY: rBodyTY }, { scaleX }, { scaleY }] }]}>
        <View
          style={{ position: 'absolute', left: 0.14 * W, top: 0.96 * H, width: 0.66 * W, height: 0.055 * H, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.42)' }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            left: tailBox.left,
            top: tailBox.top,
            width: tailBox.w,
            height: tailBox.h,
            transform: originRotate(tailDeg, tailBox.w, tailBox.h, 0.2, 0.9),
          }}
        >
          {layer(require('../../assets/kitsune/kitsune-tail.png'))}
        </Animated.View>
        {layer(require('../../assets/kitsune/kitsune-body.png'))}
        <Animated.View
          style={{
            position: 'absolute',
            left: pawBox.left,
            top: pawBox.top,
            width: pawBox.w,
            height: pawBox.h,
            transform: [{ translateY: rPawTY }, ...originRotate(rPawDeg, pawBox.w, pawBox.h, 0.5, 0.18)],
          }}
        >
          {layer(require('../../assets/kitsune/kitsune-paw.png'))}
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            left: headBox.left,
            top: headBox.top,
            width: headBox.w,
            height: headBox.h,
            transform: [{ translateY: rHeadTY }, ...originRotate(rHeadDeg, headBox.w, headBox.h, 0.5, 0.94)],
          }}
        >
          {layer(require('../../assets/kitsune/kitsune-head.png'))}
          <Animated.View style={{ position: 'absolute', left: 0.207 * headBox.w, top: 0.616 * headBox.h, width: 0.151 * headBox.w, height: lidHeight, backgroundColor: '#E8894F', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />
          <Animated.View style={{ position: 'absolute', left: 0.532 * headBox.w, top: 0.636 * headBox.h, width: 0.143 * headBox.w, height: lidHeight, backgroundColor: '#E8894F', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
});
