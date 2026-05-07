import { describe, it, expect } from 'vitest';
import { categorizeBmi } from './lib';

describe('categorizeBmi', () => {
    it('classifies the WHO ranges at the boundaries', () => {
        expect(categorizeBmi(15)).toBe('Severe thinness');
        expect(categorizeBmi(16)).toBe('Moderate thinness');
        expect(categorizeBmi(17)).toBe('Mild thinness');
        expect(categorizeBmi(18.5)).toBe('Normal weight');
        expect(categorizeBmi(24.9)).toBe('Normal weight');
        expect(categorizeBmi(25)).toBe('Overweight (pre-obese)');
        expect(categorizeBmi(30)).toBe('Obesity class I');
        expect(categorizeBmi(35)).toBe('Obesity class II');
        expect(categorizeBmi(40)).toBe('Obesity class III');
        expect(categorizeBmi(50)).toBe('Obesity class III');
    });
});
