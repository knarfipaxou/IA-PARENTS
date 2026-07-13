import { useCallback, useState } from 'react';
import { setJSON } from '../../lib/storage';
import type { ChildProfile } from '../../types/childProfile';

export const KEY_PROFILES = 'ppia.profiles';

/** Domaine « profil pédagogique » (niveau, objectif, matières prioritaires…) par enfant. */
export function useProfilesStore() {
  const [profiles, setProfiles] = useState<Record<string, ChildProfile>>({});

  const addProfile = useCallback((profile: ChildProfile) => {
    setProfiles((prev) => {
      const next = { ...prev, [profile.childId]: profile };
      setJSON(KEY_PROFILES, next);
      return next;
    });
  }, []);

  const updateProfile = useCallback((childId: string, patch: Partial<ChildProfile>) => {
    setProfiles((prev) => {
      const existing = prev[childId];
      if (!existing) return prev;
      const next = { ...prev, [childId]: { ...existing, ...patch, updatedAt: new Date().toISOString() } };
      setJSON(KEY_PROFILES, next);
      return next;
    });
  }, []);

  const getProfile = useCallback((childId: string): ChildProfile | undefined => {
    return profiles[childId];
  }, [profiles]);

  return { profiles, setProfilesRaw: setProfiles, addProfile, updateProfile, getProfile };
}
