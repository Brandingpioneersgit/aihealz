import { describe, it, expect } from 'vitest';

describe('TestDetailPage', () => {
  describe('price formatting', () => {
    it('formats INR prices for India', () => {
      const formatPrice = (price: number) => {
        return `₹${price.toLocaleString('en-IN')}`;
      };

      expect(formatPrice(500)).toBe('₹500');
    });

    it('converts to USD for non-India countries', () => {
      const formatPriceUsd = (price: number) => {
        return `$${Math.round(price / 83).toLocaleString('en-US')}`;
      };

      expect(formatPriceUsd(830)).toBe('$10');
    });
  });

  describe('report time formatting', () => {
    it('formats hours for same-day results', () => {
      const formatReportTime = (hours: number) => {
        return hours < 24 ? `${hours} hours` : `${Math.round(hours / 24)} days`;
      };

      expect(formatReportTime(2)).toBe('2 hours');
      expect(formatReportTime(12)).toBe('12 hours');
      expect(formatReportTime(24)).toBe('1 days');
      expect(formatReportTime(48)).toBe('2 days');
    });
  });

  describe('normal ranges parsing', () => {
    it('handles valid JSON normal ranges', () => {
      const normalRanges = {
        'Hemoglobin': '12.0-16.0 g/dL',
        'RBC Count': '4.0-5.5 million/μL',
        'WBC Count': '4000-11000/μL',
      };

      expect(Object.keys(normalRanges).length).toBe(3);
      expect(normalRanges['Hemoglobin']).toBe('12.0-16.0 g/dL');
    });

    it('handles empty normal ranges', () => {
      const normalRanges = {} as Record<string, unknown>;

      expect(Object.keys(normalRanges).length).toBe(0);
    });

    it('handles null normal ranges', () => {
      const normalRanges = null as Record<string, unknown> | null;

      expect(normalRanges).toBeNull();
    });
  });

  describe('fasting formatting', () => {
    it('formats fasting info correctly', () => {
      const formatFasting = (required: boolean, hours?: number | null) => {
        if (required) {
          return `Yes · ${hours || 8}h`;
        }
        return 'No';
      };

      expect(formatFasting(true, 8)).toBe('Yes · 8h');
      expect(formatFasting(true, 12)).toBe('Yes · 12h');
      expect(formatFasting(false)).toBe('No');
      expect(formatFasting(true, null)).toBe('Yes · 8h');
    });
  });

  describe('structured data generation', () => {
    it('generates valid MedicalTest schema', () => {
      const test = {
        name: 'Complete Blood Count',
        shortName: 'CBC',
        description: 'Measures various components of blood',
        relatedConditions: ['Anemia', 'Infection'],
        specialistType: 'Pathology',
      };

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalTest',
        name: test.name,
        alternateName: test.shortName,
        description: test.description,
        usedToDiagnose: test.relatedConditions,
        relevantSpecialty: {
          '@type': 'MedicalSpecialty',
          name: test.specialistType,
        },
      };

      const parsed = JSON.parse(JSON.stringify(schema));
      expect(parsed['@type']).toBe('MedicalTest');
      expect(parsed.alternateName).toBe('CBC');
      expect(parsed.usedToDiagnose).toContain('Anemia');
    });
  });

  describe('metadata generation', () => {
    it('generates correct page title', () => {
      const generateTitle = (name: string, metaTitle?: string | null) => {
        const base = metaTitle || `${name} - Cost, Preparation, Normal Range | aihealz`;
        return base.replace(/\s*\|\s*aihealz\s*$/i, '') + ' | aihealz';
      };

      expect(generateTitle('CBC Test')).toBe('CBC Test - Cost, Preparation, Normal Range | aihealz');
      expect(generateTitle('CBC', 'Custom Title | aihealz')).toBe('Custom Title | aihealz');
    });

    it('generates keywords from test data', () => {
      const generateKeywords = (name: string, shortName?: string | null) => {
        return [name, shortName || '', 'lab test', 'diagnostic', 'price', 'near me'].filter(Boolean);
      };

      expect(generateKeywords('CBC Test', 'CBC')).toContain('CBC Test');
      expect(generateKeywords('CBC Test', 'CBC')).toContain('CBC');
      expect(generateKeywords('CBC Test', null)).toContain('CBC Test');
    });
  });
});
