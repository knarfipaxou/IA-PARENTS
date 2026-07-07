import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

/** Compteur qui défile de 0 jusqu'à `value` (~1 s, ralentit sur la fin). */
export function CountUp({ value, suffix = '', style }: { value: number; suffix?: string; style?: TextStyle | TextStyle[] }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value <= 0) { setDisplay(0); return; }
    const duration = 1000;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p >= 1) clearInterval(id);
    }, 33);
    return () => clearInterval(id);
  }, [value]);

  return <Text style={style}>{display}{suffix}</Text>;
}
