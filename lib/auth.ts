import { getJSON, setJSON } from './storage';

// Compte parent LOCAL (aucun serveur) : email + empreinte du mot de passe
// stockés uniquement sur le téléphone. Simule le parcours compte/connexion
// des maquettes, prêt à être remplacé par un vrai backend plus tard.

export interface LocalAccount {
  email: string;
  passwordHash: string;
  familyName: string;
  createdAt: string;
}

const KEY_ACCOUNT = 'ppia.account';
const KEY_SESSION = 'ppia.session';

/**
 * Empreinte non réversible du mot de passe (djb2 double passe). Suffisant pour
 * un verrou local sans serveur — ce n'est PAS une sécurité de niveau backend.
 */
export function hashPassword(password: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    h1 = ((h1 * 33) ^ c) >>> 0;
    h2 = ((h2 * 37) ^ c) >>> 0;
  }
  return `${h1.toString(36)}.${h2.toString(36)}.${password.length}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function loadAccount(): Promise<LocalAccount | null> {
  return getJSON<LocalAccount | null>(KEY_ACCOUNT, null);
}

export async function createAccount(email: string, password: string, familyName: string): Promise<LocalAccount> {
  const account: LocalAccount = {
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    familyName: familyName.trim(),
    createdAt: new Date().toISOString(),
  };
  await setJSON(KEY_ACCOUNT, account);
  await setJSON(KEY_SESSION, true);
  return account;
}

/** Vérifie email + mot de passe contre le compte local ; ouvre la session si OK. */
export async function login(email: string, password: string): Promise<'ok' | 'no_account' | 'bad_credentials'> {
  const account = await loadAccount();
  if (!account) return 'no_account';
  if (account.email !== normalizeEmail(email) || account.passwordHash !== hashPassword(password)) {
    return 'bad_credentials';
  }
  await setJSON(KEY_SESSION, true);
  return 'ok';
}

export async function isLoggedIn(): Promise<boolean> {
  const account = await loadAccount();
  if (!account) return false;
  return getJSON<boolean>(KEY_SESSION, false);
}

export async function logout(): Promise<void> {
  await setJSON(KEY_SESSION, false);
}

/** Redéfinit le mot de passe du compte local (« mot de passe oublié », sans serveur). */
export async function resetPassword(email: string, newPassword: string): Promise<'ok' | 'no_account' | 'bad_email'> {
  const account = await loadAccount();
  if (!account) return 'no_account';
  if (account.email !== normalizeEmail(email)) return 'bad_email';
  await setJSON(KEY_ACCOUNT, { ...account, passwordHash: hashPassword(newPassword) });
  return 'ok';
}
