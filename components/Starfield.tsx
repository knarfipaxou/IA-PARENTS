import React from 'react';
import { View } from 'react-native';

// Semis d'étoiles discret pour les fonds bleu nuit (positions fixes).
const STARS = [
  { top: 40, left: '12%', s: 2 }, { top: 90, left: '55%', s: 3 }, { top: 60, left: '85%', s: 2 },
  { top: 150, left: '30%', s: 2 }, { top: 130, left: '70%', s: 2 }, { top: 210, left: '8%', s: 3 },
  { top: 260, left: '90%', s: 2 }, { top: 330, left: '20%', s: 2 }, { top: 380, left: '78%', s: 3 },
  { top: 460, left: '45%', s: 2 }, { top: 540, left: '10%', s: 2 }, { top: 600, left: '88%', s: 2 },
] as const;

export function Starfield() {
  return (
    <>
      {STARS.map((st, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute', top: st.top, left: st.left as any,
            width: st.s, height: st.s, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </>
  );
}
