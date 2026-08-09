import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { getJSON, setJSON } from './storage';

/**
 * Thème clair/sombre de l'app, contrôlé par le commutateur « Mode sombre »
 * des Réglages (persisté dans ppia.darkMode). Tant que l'utilisateur n'a
 * pas touché au commutateur, on suit le réglage du téléphone.
 */

const KEY_DARK = 'ppia.darkMode';

let pref: boolean | null = null; // null = suivre le système
let loaded = false;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((l) => l()); }

async function loadPref() {
  if (loaded) return;
  loaded = true;
  const v = await getJSON<boolean | null>(KEY_DARK, null);
  if (typeof v === 'boolean') { pref = v; notify(); }
}

export function currentScheme(): 'light' | 'dark' {
  if (pref !== null) return pref ? 'dark' : 'light';
  // Défaut « nouvelle voie graphique » : sombre (handoff Kitsune) tant que
  // l'utilisateur n'a pas explicitement choisi le mode clair (héritage).
  return 'dark';
}

export function isDarkMode(): boolean { return currentScheme() === 'dark'; }

export function setDarkMode(dark: boolean) {
  pref = dark;
  setJSON(KEY_DARK, dark);
  notify();
}

export function useScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>(currentScheme());
  useEffect(() => {
    loadPref();
    const update = () => setScheme(currentScheme());
    listeners.add(update);
    const sub = Appearance.addChangeListener(update);
    update();
    return () => { listeners.delete(update); sub.remove(); };
  }, []);
  return scheme;
}
