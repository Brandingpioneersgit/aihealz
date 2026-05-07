import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';

export interface TreatmentCostEntry {
    usd?: number;
    min?: number;
    max?: number;
    currency?: string;
    range?: [number, number];
    [k: string]: unknown;
}

export interface Treatment {
    name: string;
    slug?: string;
    simpleName?: string;
    type?: string;
    specialty?: string;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    searchTags?: string[];
    alternateNames?: string[];
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    references?: { title: string; url: string }[];
    costs?: Record<string, TreatmentCostEntry>;
    [k: string]: unknown;
}

export function slugify(name: string): string {
    return (name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Module-scope cache: lang → Treatment[]
const treatmentsByLang = new Map<string, Treatment[]>();
const slugIndexByLang = new Map<string, Map<string, Treatment>>();
const inflightLoads = new Map<string, Promise<Treatment[]>>();

async function loadFromDisk(lang: string): Promise<Treatment[]> {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const langFile = path.join(dataDir, `treatments-${lang}.json`);
    const defaultFile = path.join(dataDir, 'treatments.json');

    let filePath = defaultFile;
    if (lang && lang !== 'en') {
        try {
            await fs.access(langFile);
            filePath = langFile;
        } catch {
            filePath = defaultFile;
        }
    }

    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as Treatment[];
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (err) {
        console.error(`[treatments-cache] failed to load ${filePath}:`, err);
        return [];
    }
}

async function loadAndIndex(lang: string): Promise<Treatment[]> {
    const cached = treatmentsByLang.get(lang);
    if (cached) return cached;

    const inflight = inflightLoads.get(lang);
    if (inflight) return inflight;

    const promise = loadFromDisk(lang).then((data) => {
        treatmentsByLang.set(lang, data);
        const slugMap = new Map<string, Treatment>();
        for (const t of data) {
            if (!t || typeof t.name !== 'string') continue;
            const candidates: string[] = [];
            if (t.slug) candidates.push(t.slug);
            candidates.push(slugify(t.name));
            if (t.simpleName) candidates.push(slugify(t.simpleName));
            for (const s of candidates) {
                if (s && !slugMap.has(s)) slugMap.set(s, t);
            }
        }
        slugIndexByLang.set(lang, slugMap);
        inflightLoads.delete(lang);
        return data;
    }).catch((err) => {
        inflightLoads.delete(lang);
        throw err;
    });

    inflightLoads.set(lang, promise);
    return promise;
}

// React.cache wraps these for per-request memoization in RSC.
export const getTreatments = cache(async (lang: string = 'en'): Promise<Treatment[]> => {
    const key = (lang || 'en').toLowerCase();
    return loadAndIndex(key);
});

export const getTreatmentBySlug = cache(async (
    slug: string,
    lang: string = 'en',
): Promise<Treatment | null> => {
    const key = (lang || 'en').toLowerCase();
    await loadAndIndex(key);
    const slugMap = slugIndexByLang.get(key);
    if (!slugMap) return null;
    const target = (slug || '').toLowerCase();
    return slugMap.get(target) || slugMap.get(slugify(target)) || null;
});
