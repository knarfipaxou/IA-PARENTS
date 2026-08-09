import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { HC, FONT, R } from '../../constants/handoff';

type Variant = 'parent' | 'enfant' | 'neutral';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bouton principal « touche physique » (handoff Kitsune).
 * Effet Duolingo : une bordure basse de 5px fait office d'ombre portée ;
 * à l'appui, la face descend de 5px et l'ombre disparaît.
 */
const FACES: Record<Variant, { face: string; shadow: string; on: string }> = {
  parent: { face: HC.green, shadow: HC.greenShadow, on: HC.onGreen },
  enfant: { face: HC.cyan, shadow: '#159C90', on: HC.onCyan },
  neutral: { face: 'rgba(255,255,255,0.1)', shadow: 'rgba(255,255,255,0.04)', on: HC.ink },
};

export function PhysicalButton({ label, onPress, variant = 'parent', disabled, style }: Props) {
  const [pressed, setPressed] = useState(false);
  const c = FACES[variant];
  const RIM = 5;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.hit, style, disabled && styles.disabled]}
    >
      <View style={[styles.rim, { backgroundColor: c.shadow, borderRadius: R.btn }]}>
        <View
          style={[
            styles.face,
            {
              backgroundColor: c.face,
              borderRadius: R.btn,
              marginBottom: pressed ? 0 : RIM,
              transform: [{ translateY: pressed ? RIM : 0 }],
            },
          ]}
        >
          <Text style={[styles.label, { color: c.on }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  rim: { alignSelf: 'stretch' },
  face: {
    paddingVertical: 17,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: FONT.title, fontSize: 18 },
});
