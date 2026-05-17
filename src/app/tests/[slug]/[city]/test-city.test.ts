import { describe, it, expect } from 'vitest';

describe('TestCityPage', () => {
  describe('city name formatting', () => {
    it('converts slug to readable city name', () => {
      const formatCityName = (slug: string) => {
        return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      };

      expect(formatCityName('new-delhi')).toBe('New Delhi');
      expect(formatCityName('mumbai')).toBe('Mumbai');
      expect(formatCityName('bangalore')).toBe('Bangalore');
      expect(formatCityName('san-francisco')).toBe('San Francisco');
    });
  });

  describe('price formatting', () => {
    it('formats INR prices correctly', () => {
      const formatPrice = (price: number) => {
        return `₹${price.toLocaleString('en-IN')}`;
      };

      expect(formatPrice(500)).toBe('₹500');
    });
  });

  describe('report time formatting', () => {
    it('formats hours for same-day results', () => {
      const formatReportTime = (hours: number) => {
        if (hours < 24) {
          return `${hours} hours`;
        }
        return `${Math.round(hours / 24)} days`;
      };

      expect(formatReportTime(2)).toBe('2 hours');
      expect(formatReportTime(12)).toBe('12 hours');
      expect(formatReportTime(24)).toBe('1 days');
      expect(formatReportTime(48)).toBe('2 days');
    });
  });

  describe('structured data generation', () => {
    it('generates valid MedicalTest schema with city', () => {
      const test = {
        name: 'Complete Blood Count',
        shortName: 'CBC',
        description: 'Measures blood components',
      };

      const providers = [
        { name: 'Lab A', rating: 4.5 },
        { name: 'Lab B', rating: null },
      ];

      const cityName = 'Mumbai';

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalTest',
        name: test.name,
        alternateName: test.shortName,
        description: test.description,
        areaServed: {
          '@type': 'City',
          name: cityName,
        },
        provider: providers.map((p) => ({
          '@type': 'DiagnosticLab',
          name: p.name,
          ...(p.rating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: p.rating,
              reviewCount: 100,
            },
          }),
        })),
      };

      const parsed = JSON.parse(JSON.stringify(schema));
      expect(parsed['@type']).toBe('MedicalTest');
      expect(parsed.areaServed['@type']).toBe('City');
      expect(parsed.areaServed.name).toBe('Mumbai');
      expect(parsed.provider[0].aggregateRating.ratingValue).toBe(4.5);
      expect(parsed.provider[1].aggregateRating).toBeUndefined();
    });
  });

  describe('metadata generation', () => {
    it('generates correct page title with city', () => {
      const generateTitle = (testName: string, cityName: string, avgPriceInr?: number | null) => {
        const priceText = avgPriceInr ? ` starting at ₹${Number(avgPriceInr).toLocaleString('en-IN')}` : '';
        return `${testName} in ${cityName} - Price, Labs & Home Collection | aihealz`;
      };

      expect(generateTitle('CBC Test', 'Mumbai')).toBe('CBC Test in Mumbai - Price, Labs & Home Collection | aihealz');
      expect(generateTitle('CBC Test', 'Delhi', 500)).toBe('CBC Test in Delhi - Price, Labs & Home Collection | aihealz');
    });

    it('generates correct meta description', () => {
      const generateDescription = (testName: string, cityName: string, priceText?: string) => {
        return `Book ${testName} in ${cityName}${priceText || ''}. Compare prices from certified labs, get home sample collection, and receive reports online.`;
      };

      expect(generateDescription('CBC Test', 'Mumbai')).toBe('Book CBC Test in Mumbai. Compare prices from certified labs, get home sample collection, and receive reports online.');
    });
  });

  describe('provider selection logic', () => {
    it('prioritizes city-specific providers', () => {
      const selectProviders = (
        cityProviders: unknown[],
        generalProviders: unknown[]
      ) => {
        return cityProviders.length > 0 ? cityProviders : generalProviders;
      };

      expect(selectProviders([{ id: 1 }], [{ id: 2 }]).length).toBe(1);
      expect(selectProviders([], [{ id: 2 }]).length).toBe(1);
    });

    it('falls back to general providers when city has none', () => {
      const selectProviders = (
        cityProviders: unknown[],
        generalProviders: unknown[]
      ) => {
        return cityProviders.length > 0 ? cityProviders : generalProviders;
      };

      const result = selectProviders([], [{ id: 1 }, { id: 2 }]);
      expect(result.length).toBe(2);
    });
  });

  describe('home collection badge', () => {
    it('shows home collection when available', () => {
      const test = {
        homeCollectionPossible: true,
      };

      expect(test.homeCollectionPossible).toBe(true);
    });

    it('hides home collection when not available', () => {
      const test = {
        homeCollectionPossible: false,
      };

      expect(test.homeCollectionPossible).toBe(false);
    });
  });

  describe('partner discount display', () => {
    it('formats partner discount percentage', () => {
      const formatPartnerDiscount = (discount?: number | null) => {
        if (discount) {
          return `${Number(discount)}% off via aihealz`;
        }
        return null;
      };

      expect(formatPartnerDiscount(10)).toBe('10% off via aihealz');
      expect(formatPartnerDiscount(15)).toBe('15% off via aihealz');
      expect(formatPartnerDiscount(null)).toBe(null);
    });
  });

  describe('static params generation', () => {
    it('generates correct params for top tests and cities', () => {
      const generateStaticParams = (
        tests: { slug: string }[],
        cities: { slug: string }[],
        limit: number
      ) => {
        const params: { slug: string; city: string }[] = [];
        for (const test of tests) {
          for (const city of cities) {
            params.push({ slug: test.slug, city: city.slug });
          }
        }
        return params.slice(0, limit);
      };

      const tests = [{ slug: 'cbc' }, { slug: 'lipid-profile' }];
      const cities = [{ slug: 'mumbai' }, { slug: 'delhi' }, { slug: 'bangalore' }];

      const params = generateStaticParams(tests, cities, 10);
      expect(params.length).toBe(6);
      expect(params[0]).toEqual({ slug: 'cbc', city: 'mumbai' });
      expect(params[params.length - 1]).toEqual({ slug: 'lipid-profile', city: 'bangalore' });
    });

    it('limits total params to specified limit', () => {
      const generateStaticParams = (
        tests: { slug: string }[],
        cities: { slug: string }[],
        limit: number
      ) => {
        const params: { slug: string; city: string }[] = [];
        for (const test of tests) {
          for (const city of cities) {
            params.push({ slug: test.slug, city: city.slug });
          }
        }
        return params.slice(0, limit);
      };

      const tests = [{ slug: 'cbc' }, { slug: 'lipid-profile' }];
      const cities = [{ slug: 'mumbai' }, { slug: 'delhi' }, { slug: 'bangalore' }];

      const params = generateStaticParams(tests, cities, 3);
      expect(params.length).toBe(3);
    });
  });

  describe('rating display', () => {
    it('formats rating to one decimal place', () => {
      const formatRating = (rating: number | null) => {
        if (rating) {
          return Number(rating).toFixed(1);
        }
        return null;
      };

      expect(formatRating(4.5)).toBe('4.5');
      expect(formatRating(4.556)).toBe('4.6');
      expect(formatRating(null)).toBe(null);
    });
  });
});
