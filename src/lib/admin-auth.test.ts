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
        // Decode, flip the last hex digit of the signature, re-encode. This
        // guarantees we touch a meaningful byte (mutating base64 padding can
        // round-trip to the same buffer).
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const lastChar = decoded.slice(-1);
        const flipped = lastChar === '0' ? '1' : '0';
        const tamperedDecoded = decoded.slice(0, -1) + flipped;
        const tampered = Buffer.from(tamperedDecoded, 'utf8').toString('base64');
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
