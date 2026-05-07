/**
 * Single source of truth for /tools listings.
 *
 * Consumed by:
 *  - src/app/tools/page.tsx (the index page)
 *  - src/components/v4/Footer.tsx (Tools / Calculators columns) — keep in sync if expanded
 *  - scripts/generate-sitemaps.ts (currently enumerates from the filesystem; switch to this
 *    file when you want the sitemap to reflect curated copy rather than every directory)
 *
 * Each entry's `href` MUST correspond to an existing route under src/app/tools/<slug>/page.tsx.
 */

export interface ToolEntry {
    id: string;
    name: string;
    desc: string;
    href: string;
    abbr?: string;
    category?: string;
}

export const HEALTH_TOOLS: ToolEntry[] = [
    {
        id: 'drug-interactions',
        name: 'Drug interactions',
        desc: 'Check dangerous interactions between medications',
        href: '/tools/drug-interactions',
        abbr: 'RX',
    },
    {
        id: 'lab-tests',
        name: 'Lab test directory',
        desc: 'Normal ranges, costs, and what each test means',
        href: '/tools/lab-tests',
        abbr: 'LAB',
    },
    {
        id: 'vaccinations',
        name: 'Vaccination schedule',
        desc: 'Country immunization & travel vaccines',
        href: '/tools/vaccinations',
        abbr: 'VAX',
    },
    {
        id: 'emergency',
        name: 'Emergency services',
        desc: 'Numbers, first aid, crisis support',
        href: '/tools/emergency',
        abbr: 'ER',
    },
    {
        id: 'glossary',
        name: 'Medical glossary',
        desc: 'Searchable dictionary of medical terms',
        href: '/tools/glossary',
        abbr: 'GLS',
    },
    {
        id: 'surgery-checklist',
        name: 'Surgery checklists',
        desc: 'Pre-op and post-op for common surgeries',
        href: '/tools/surgery-checklist',
        abbr: 'OR',
    },
];

export const CALCULATORS: ToolEntry[] = [
    {
        id: 'bmi',
        name: 'BMI',
        desc: 'Body mass index',
        category: 'Body metrics',
        href: '/tools/bmi-calculator',
    },
    {
        id: 'bmr',
        name: 'BMR & calories',
        desc: 'Daily calorie needs',
        category: 'Nutrition',
        href: '/tools/bmr-calculator',
    },
    {
        id: 'heart-risk',
        name: 'Heart risk',
        desc: 'Cardiovascular 10-yr risk',
        category: 'Cardiovascular',
        href: '/tools/heart-risk-calculator',
    },
    {
        id: 'kidney',
        name: 'eGFR',
        desc: 'Kidney function estimate',
        category: 'Nephrology',
        href: '/tools/kidney-function-calculator',
    },
    {
        id: 'pregnancy',
        name: 'Pregnancy due date',
        desc: 'EDD calculator',
        category: 'Obstetrics',
        href: '/tools/pregnancy-due-date-calculator',
    },
    {
        id: 'diabetes-risk',
        name: 'Diabetes risk',
        desc: 'Type 2 diabetes screen',
        category: 'Endocrinology',
        href: '/tools/diabetes-risk-calculator',
    },
    {
        id: 'water',
        name: 'Water intake',
        desc: 'Daily hydration target',
        category: 'Nutrition',
        href: '/tools/water-intake-calculator',
    },
    {
        id: 'body-fat',
        name: 'Body fat (Navy)',
        desc: 'U.S. Navy circumference method',
        category: 'Body metrics',
        href: '/tools/body-fat-calculator',
    },
];

export const ALL_TOOL_HREFS: string[] = [
    ...HEALTH_TOOLS.map((t) => t.href),
    ...CALCULATORS.map((t) => t.href),
];
