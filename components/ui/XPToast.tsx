import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { T } from '../../constants/theme';

interface Props {
  amount: number;
  visible: boolean;
  onHide: () => void;
}

export function XPToast({ amount, visible, onHide }: Props) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(-50);
    opacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: 16, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
    ]).start(() => onHide());
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.toast, { transform: [{ translateY }], opacity }]}>
      <Text style={s.text}>+{amount} XP ✨</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: T.green.solid,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: -0.3 },
});
