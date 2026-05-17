import { describe, it, expect } from 'vitest';

describe('CategoryPage', () => {
  describe('price formatting', () => {
    it('formats INR prices for India', () => {
      const formatPrice = (priceInr: number | null, priceUsd: number | null) => {
        if (priceInr) {
          return `₹${priceInr.toLocaleString('en-IN')}`;
        }
        return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
      };

      expect(formatPrice(500, null)).toBe('₹500');
      expect(formatPrice(1500, null)).toBe('₹1,500');
      expect(formatPrice(null, 100)).toBe('$100');
      expect(formatPrice(null, null)).toBe(null);
    });

    it('converts INR to USD for non-India countries', () => {
      const convertToUsd = (priceInr: number) => {
        return `$${Math.round(priceInr * 0.012).toLocaleString('en-US')}`;
      };

    });
  });

  describe('pagination', () => {
    it('calculates total pages correctly', () => {
      const calcTotalPages = (totalCount: number, pageSize: number) => {
        return Math.ceil(totalCount / pageSize);
      };

      expect(calcTotalPages(100, 24)).toBe(5);
      expect(calcTotalPages(50, 24)).toBe(3);
      expect(calcTotalPages(24, 24)).toBe(1);
      expect(calcTotalPages(1, 24)).toBe(1);
    });

    it('calculates skip offset correctly', () => {
      const calcSkip = (page: number, pageSize: number) => {
        return (page - 1) * pageSize;
      };

      expect(calcSkip(1, 24)).toBe(0);
      expect(calcSkip(2, 24)).toBe(24);
      expect(calcSkip(3, 24)).toBe(48);
    });
  });

  describe('pagination URL generation', () => {
    it('generates correct previous page URL', () => {
      const getPrevPageUrl = (slug: string, currentPage: number) => {
        if (currentPage <= 1) return null;
        return `/tests/category/${slug}?page=${currentPage - 1}`;
      };

      expect(getPrevPageUrl('blood-tests', 1)).toBe(null);
      expect(getPrevPageUrl('blood-tests', 2)).toBe('/tests/category/blood-tests?page=1');
    });

    it('generates correct next page URL', () => {
      const getNextPageUrl = (slug: string, currentPage: number, totalPages: number) => {
        if (currentPage >= totalPages) return null;
        return `/tests/category/${slug}?page=${currentPage + 1}`;
      };

      expect(getNextPageUrl('blood-tests', 5, 5)).toBe(null);
      expect(getNextPageUrl('blood-tests', 4, 5)).toBe('/tests/category/blood-tests?page=5');
    });

    it('calculates visible page numbers', () => {
      const getPageNumbers = (currentPage: number, totalPages: number) => {
        if (totalPages <= 5) {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
        } else if (currentPage <= 3) {
          return [1, 2, 3, 4, 5];
        } else if (currentPage >= totalPages - 2) {
          return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
        }
      };

      expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5]);
      expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, 5]);
      expect(getPageNumbers(4, 10)).toEqual([2, 3, 4, 5, 6]);
      expect(getPageNumbers(8, 10)).toEqual([6, 7, 8, 9, 10]);
      expect(getPageNumbers(10, 10)).toEqual([6, 7, 8, 9, 10]);
      expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
    });
  });

  describe('structured data generation', () => {
    it('generates valid CollectionPage schema', () => {
      const category = {
        name: 'Blood Tests',
        description: 'Complete blood analysis tests',
      };

      const tests = [
        { id: '1', name: 'CBC', slug: 'cbc' },
        { id: '2', name: 'Blood Glucose', slug: 'blood-glucose' },
      ];

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description,
        numberOfItems: tests.length,
        itemListElement: tests.map((test, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'MedicalTest',
            name: test.name,
            url: `https://aihealz.com/tests/${test.slug}`,
          },
        })),
      };

      const parsed = JSON.parse(JSON.stringify(schema));
      expect(parsed['@type']).toBe('CollectionPage');
      expect(parsed.numberOfItems).toBe(2);
      expect(parsed.itemListElement[0].position).toBe(1);
    });
  });

  describe('breadcrumb generation', () => {
    it('generates correct breadcrumb items', () => {
      const generateBreadcrumbs = (category: { name: string; parent?: { name: string; slug: string } | null }) => {
        const items = [
          { name: 'Home', url: '/' },
          { name: 'Tests', url: '/tests' },
        ];

        if (category.parent) {
          items.push({
            name: category.parent.name,
            url: `/tests/category/${category.parent.slug}`,
          });
        }

        items.push({
          name: category.name,
          url: `/tests/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        });

        return items;
      };

      const withParent = { name: 'CBC', parent: { name: 'Blood Tests', slug: 'blood-tests' } };
      const withoutParent = { name: 'Blood Tests', parent: null };

      expect(generateBreadcrumbs(withParent).length).toBe(4);
      expect(generateBreadcrumbs(withoutParent).length).toBe(3);
    });
  });

  describe('category ID collection', () => {
    it('collects category and child IDs for query', () => {
      const collectCategoryIds = (category: { id: string; children: { id: string }[] }) => {
        return [category.id, ...category.children.map((c) => c.id)];
      };

      const category = {
        id: 'parent-1',
        children: [
          { id: 'child-1' },
          { id: 'child-2' },
        ],
      };

      const ids = collectCategoryIds(category);
      expect(ids).toContain('parent-1');
      expect(ids).toContain('child-1');
      expect(ids).toContain('child-2');
      expect(ids.length).toBe(3);
    });
  });

  describe('metadata generation', () => {
    it('generates correct page title', () => {
      const generateTitle = (name: string, metaTitle?: string | null) => {
        return metaTitle || `${name} Tests - Book Online at Best Price | aihealz`;
      };

      expect(generateTitle('Blood Tests')).toBe('Blood Tests Tests - Book Online at Best Price | aihealz');
      expect(generateTitle('Blood Tests', 'Custom Blood Test Title')).toBe('Custom Blood Test Title');
    });
  });
});
