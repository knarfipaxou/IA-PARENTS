import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DK, Fonts } from '../../constants/darkTheme';

/** Bulle d'encouragement Kitsune. */
export function CheerBubble({ text }: { text: string; tick?: number }) {
  if (!text) return null;
  return (
    <View style={styles.bubble}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: DK.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
  },
  text: {
    color: DK.ink,
    fontFamily: Fonts.displayMed,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
});
