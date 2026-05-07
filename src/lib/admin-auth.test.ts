import { describe, it, expect, beforeAll } from 'vitest';

// Set the secret BEFORE importing the module (it captures env at module load).
beforeAll(() => {
    process.env.SESSION_SECRET = 'test-secret-do-not-use-in-prod';
});

describe('admin-auth session signing', () => {
    it('round-trips a signed session payload', async () => {
        const { signSession, verifySession } = await import('./admin-auth');
        const payload = {
            id: 'admin-1',
            role: 'admin',
            iat: Date.now(),
            exp: Date.now() + 60_000,
        };
        const token = signSession(payload);
        const verified = verifySession(token);
        expect(verified).not.toBeNull();
        expect(verified?.id).toBe('admin-1');
        expect(verified?.role).toBe('admin');
    });

    it('rejects a tampered signature', async () => {
        const { signSession, verifySession } = await import('./admin-auth');
        const payload = {
            id: 'admin-1',
            role: 'admin',
            iat: Date.now(),
            exp: Date.now() + 60_000,
        };
        const token = signSession(payload);
        // Flip a character in the base64 payload to break the signature.
        const tampered = token.slice(0, -2) + (token.endsWith('A') ? 'B' : 'A') + token.slice(-1);
        const verified = verifySession(tampered);
        expect(verified).toBeNull();
    });

    it('rejects an expired session', async () => {
        const { signSession, verifySession } = await import('./admin-auth');
        const expiredPayload = {
            id: 'admin-1',
            role: 'admin',
            iat: Date.now() - 120_000,
            exp: Date.now() - 60_000,
        };
        const token = signSession(expiredPayload);
        expect(verifySession(token)).toBeNull();
    });
});
