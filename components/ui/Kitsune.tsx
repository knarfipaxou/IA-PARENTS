import React, { useEffect, useRef } from 'react';
import { Animated, View, Image, Easing, StyleSheet } from 'react-native';

/**
 * Mascotte Kitsune — portée depuis design/handoff/Kitsune.dc.html.
 * 4 calques PNG indépendants (tête, corps, patte, queue) superposés, avec
 * animations d'inactivité : respiration du corps, balancement lent de la queue,
 * clignement des yeux. Un changement de `tick` déclenche un petit rebond
 * (réaction à un choix de l'utilisateur).
 *
 * Les positions/tailles reprennent les pourcentages du handoff, convertis en
 * pixels à partir de `width` (le ratio du cadre est 700×850).
 */
const RATIO = 850 / 700;

interface Props {
  width?: number;
  /** 'idle' par défaut ; toute autre valeur + un tick incrémenté joue un rebond. */
  move?: string;
  tick?: number;
}

export function Kitsune({ width = 196, move = 'idle', tick = 0 }: Props) {
  const W = width;
  const H = W * RATIO;

  const breathe = useRef(new Animated.Value(0)).current;
  const tail = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;

  // Boucles d'inactivité.
  useEffect(() => {
    const loop = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      );
    const b = loop(breathe, 4600);
    const t = loop(tail, 4200);
    const k = loop(blink, 6000);
    b.start();
    t.start();
    k.start();
    return () => {
      b.stop();
      t.stop();
      k.stop();
    };
  }, [breathe, tail, blink]);

  // Rebond de réaction au changement de tick (sauf idle initial).
  useEffect(() => {
    if (tick <= 0) return;
    hop.setValue(0);
    Animated.timing(hop, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: false,
    }).start();
  }, [tick, move, hop]);

  // Calques (boîtes en px) — cf. Kitsune.dc.html.
  const tailBox = { left: 0.6429 * W, top: 0.4353 * H, w: 0.3571 * W, h: 0.5471 * H };
  const pawBox = { left: 0.1214 * W, top: 0.7859 * H, w: 0.24 * W, h: 0.2141 * H };
  const headBox = { left: 0.0214 * W, top: 0, w: 0.7571 * W, h: 0.5882 * H };
  const lidH = 0.16 * headBox.h;

  // Balancement de la queue autour de son point d'attache (20% ; 90%).
  const tailPivotDx = (0.5 - 0.2) * tailBox.w;
  const tailPivotDy = (0.5 - 0.9) * tailBox.h;
  const tailRotate = tail.interpolate({
    inputRange: [0, 0.25, 0.62, 1],
    outputRange: ['0deg', '-3.5deg', '2.5deg', '0deg'],
  });

  const rigScale = breathe.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.015, 1] });
  const hopTranslate = hop.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, -0.09 * H, 0] });
  const lidHeight = blink.interpolate({
    inputRange: [0, 0.93, 0.96, 1],
    outputRange: [0, 0, lidH, 0],
  });

  const layer = (src: any) => (
    <Image source={src} resizeMode="contain" style={styles.fill} />
  );

  return (
    <View style={{ width: W, height: H }}>
      <Animated.View
        style={[styles.fill, { transform: [{ translateY: hopTranslate }, { scale: rigScale }] }]}
      >
        {/* Ombre au sol */}
        <View
          style={{
            position: 'absolute',
            left: 0.14 * W,
            top: 0.96 * H,
            width: 0.66 * W,
            height: 0.055 * H,
            borderRadius: 999,
            backgroundColor: 'rgba(0,0,0,0.42)',
          }}
        />
        {/* Queue */}
        <Animated.View
          style={{
            position: 'absolute',
            left: tailBox.left,
            top: tailBox.top,
            width: tailBox.w,
            height: tailBox.h,
            transform: [
              { translateX: tailPivotDx },
              { translateY: tailPivotDy },
              { rotate: tailRotate },
              { translateX: -tailPivotDx },
              { translateY: -tailPivotDy },
            ],
          }}
        >
          {layer(require('../../assets/kitsune/kitsune-tail.png'))}
        </Animated.View>
        {/* Corps */}
        {layer(require('../../assets/kitsune/kitsune-body.png'))}
        {/* Patte */}
        <View style={{ position: 'absolute', left: pawBox.left, top: pawBox.top, width: pawBox.w, height: pawBox.h }}>
          {layer(require('../../assets/kitsune/kitsune-paw.png'))}
        </View>
        {/* Tête + paupières */}
        <View style={{ position: 'absolute', left: headBox.left, top: headBox.top, width: headBox.w, height: headBox.h }}>
          {layer(require('../../assets/kitsune/kitsune-head.png'))}
          <Animated.View
            style={{
              position: 'absolute',
              left: 0.207 * headBox.w,
              top: 0.616 * headBox.h,
              width: 0.151 * headBox.w,
              height: lidHeight,
              backgroundColor: '#E8894F',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              left: 0.532 * headBox.w,
              top: 0.636 * headBox.h,
              width: 0.143 * headBox.w,
              height: lidHeight,
              backgroundColor: '#E8894F',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
});
