import {
  hashPassword, normalizeEmail, createAccount, login, isLoggedIn, logout, resetPassword,
} from '../lib/auth';

describe('compte local (auth simulée)', () => {
  it('hashPassword est déterministe et non trivial', () => {
    expect(hashPassword('secret123')).toBe(hashPassword('secret123'));
    expect(hashPassword('secret123')).not.toBe(hashPassword('secret124'));
    expect(hashPassword('secret123')).not.toContain('secret');
  });

  it("normalizeEmail ignore casse et espaces", () => {
    expect(normalizeEmail('  Franck@Email.COM ')).toBe('franck@email.com');
  });

  it('parcours complet : création → connecté → logout → login', async () => {
    await createAccount('parent@test.fr', 'motdepasse', 'Famille Test');
    expect(await isLoggedIn()).toBe(true);

    await logout();
    expect(await isLoggedIn()).toBe(false);

    expect(await login('parent@test.fr', 'mauvais')).toBe('bad_credentials');
    expect(await login('autre@test.fr', 'motdepasse')).toBe('bad_credentials');
    expect(await login('PARENT@test.fr', 'motdepasse')).toBe('ok');
    expect(await isLoggedIn()).toBe(true);
  });

  it('resetPassword remplace le mot de passe si l’email correspond', async () => {
    await createAccount('parent@test.fr', 'ancien', 'Famille Test');
    expect(await resetPassword('inconnu@test.fr', 'nouveau')).toBe('bad_email');
    expect(await resetPassword('parent@test.fr', 'nouveau')).toBe('ok');
    await logout();
    expect(await login('parent@test.fr', 'ancien')).toBe('bad_credentials');
    expect(await login('parent@test.fr', 'nouveau')).toBe('ok');
  });
});
