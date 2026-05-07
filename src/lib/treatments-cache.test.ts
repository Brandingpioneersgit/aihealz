import { describe, it, expect } from 'vitest';
import { slugify, getTreatments } from './treatments-cache';

describe('slugify', () => {
    it('lowercases and replaces non-alphanumeric runs with a single hyphen', () => {
        expect(slugify('Hello World')).toBe('hello-world');
        expect(slugify('Foo  Bar/Baz')).toBe('foo-bar-baz');
    });

    it('strips leading and trailing hyphens', () => {
        expect(slugify('  Spaced  ')).toBe('spaced');
        expect(slugify('!!!Bang!!!')).toBe('bang');
    });

    it('returns empty string for empty input', () => {
        expect(slugify('')).toBe('');
        // @ts-expect-error — defensive runtime check for nullish input.
        expect(slugify(undefined)).toBe('');
    });
});

describe('getTreatments', () => {
    it('returns an array for the default English locale', async () => {
        const treatments = await getTreatments('en');
        expect(Array.isArray(treatments)).toBe(true);
    });
});
