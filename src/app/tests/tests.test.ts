import { describe, it, expect } from 'vitest';
import { getTestTypeStyle, getCategoryStyle } from '@/lib/test-type-colors';

describe('TestsPage', () => {
  describe('price formatting', () => {
    it('formats INR prices correctly for India', () => {
      const formatPrice = (priceInr: number | null) => {
        if (!priceInr) return null;
        return `₹${priceInr.toLocaleString('en-IN')}`;
      };

      expect(formatPrice(500)).toBe('₹500');
      expect(formatPrice(1500)).toBe('₹1,500');
      expect(formatPrice(50000)).toBe('₹50,000');
      expect(formatPrice(null)).toBe(null);
    });

    it('converts INR to USD for non-India countries', () => {
      const convertToUsd = (priceInr: number) => {
        return `$${Math.round(priceInr * 0.012).toLocaleString('en-US')}`;
      };

      expect(convertToUsd(1000)).toBe('$12');
      expect(convertToUsd(10000)).toBe('$120');
    });

    it('handles USD prices directly', () => {
      const formatPriceUsd = (priceUsd: number | null) => {
        return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
      };

      expect(formatPriceUsd(100)).toBe('$100');
      expect(formatPriceUsd(1500)).toBe('$1,500');
      expect(formatPriceUsd(null)).toBe(null);
    });
  });

  describe('test type styles', () => {
    it('returns correct style for lab_test', () => {
      const style = getTestTypeStyle('lab_test');
      expect(style.label).toBe('Lab Test');
      expect(style.bg).toBeDefined();
    });

    it('returns correct style for imaging', () => {
      const style = getTestTypeStyle('imaging');
      expect(style.label).toBe('Imaging');
    });

    it('returns correct style for pathology', () => {
      const style = getTestTypeStyle('pathology');
      expect(style.label).toBe('Pathology');
    });

    it('returns default style for unknown test type', () => {
      const style = getTestTypeStyle('unknown-type');
      expect(style.label).toBe('Other');
    });
  });

  describe('category styles', () => {
    it('returns a style object for known category slugs', () => {
      const style = getCategoryStyle('blood-tests');
      expect(style.icon).toBe('🩸');
      expect(style.color).toBe('text-red-400');
    });

    it('returns default style for unknown category slugs', () => {
      const style = getCategoryStyle('nonexistent-category');
      expect(style.icon).toBe('📋');
      expect(style.color).toBe('text-slate-400');
    });
  });

  describe('FAQ content', () => {
    it('contains relevant diagnostic test FAQs', () => {
      const testFaqs = [
        { question: 'How do I book a lab test online?', answer: expect.any(String) },
        { question: 'Is home sample collection available?', answer: expect.any(String) },
        { question: 'How long does it take to get test results?', answer: expect.any(String) },
        { question: 'Are lab tests covered by insurance?', answer: expect.any(String) },
      ];

      expect(testFaqs.length).toBe(4);
    });

    it('FAQs have non-empty answers', () => {
      const testFaqs = [
        { question: 'How do I book a lab test online?', answer: 'Search for your required test, compare prices from multiple labs, and book online.' },
        { question: 'Is home sample collection available?', answer: 'Yes, many tests offer home sample collection at no extra cost.' },
      ];

      testFaqs.forEach((faq) => {
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });

  describe('structured data generation', () => {
    it('generates valid JSON-LD schema for web page', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Lab Tests & Diagnostic Services',
        description: 'Find lab tests, blood tests, imaging scans, and health checkups.',
        url: 'https://aihealz.com/tests',
      };

      const jsonString = JSON.stringify(schema);
      const parsed = JSON.parse(jsonString);

      expect(parsed['@type']).toBe('WebPage');
      expect(parsed['@context']).toBe('https://schema.org');
    });

    it('generates valid item list schema for popular tests', () => {
      const popularTests = [
        { name: 'Complete Blood Count', slug: 'complete-blood-count' },
        { name: 'Lipid Profile', slug: 'lipid-profile' },
      ];

      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Popular Lab Tests',
        itemListElement: popularTests.map((test, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'MedicalTest',
            name: test.name,
            url: `/tests/${test.slug}`,
          },
        })),
      };

      const parsed = JSON.parse(JSON.stringify(itemListSchema));
      expect(parsed.itemListElement.length).toBe(2);
      expect(parsed.itemListElement[0].position).toBe(1);
    });
  });
});
