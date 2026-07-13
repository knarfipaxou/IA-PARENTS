// Mock minimal d'AsyncStorage (store en mémoire) pour tester la logique pure
// qui importe lib/storage sans dépendre du runtime React Native.
const store = new Map<string, string>();
export default {
  getItem: async (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: async (k: string, v: string) => { store.set(k, v); },
  removeItem: async (k: string) => { store.delete(k); },
  clear: async () => { store.clear(); },
};
