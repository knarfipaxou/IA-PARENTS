import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DK } from '../../constants/darkTheme';

// Boutons sombres réutilisés dans tous les rendus de contenu générés par l'IA.

export function CyanBtn({ label, icon, onPress, style }: { label: string; icon?: React.ReactNode; onPress: () => void; style?: any }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={style}>
      <LinearGradient colors={['#1FB8A8', DK.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cyanBtn}>
        {icon}
        <Text style={s.cyanBtnText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function DarkGhostBtn({ label, icon, onPress, style }: { label: string; icon?: React.ReactNode; onPress: () => void; style?: any }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[s.ghostBtn, style]}>
      {icon}
      <Text style={s.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  cyanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 999, paddingVertical: 15, paddingHorizontal: 18,
    shadowColor: DK.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8,
  },
  cyanBtnText: { color: '#052A26', fontSize: 15, fontWeight: '800' },
  ghostBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(148,168,255,0.35)', borderRadius: 999,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  ghostBtnText: { color: '#DDE4FF', fontSize: 14, fontWeight: '700' },
});
