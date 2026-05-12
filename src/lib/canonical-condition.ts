/**
 * Canonical-condition fallback resolver.
 *
 * The MedicalCondition table holds ~72k ICD-10 variants. Only ~5,500 are
 * "base" conditions worth unique content; the rest are clinical variants.
 *
 * When a variant slug is hit but has no ConditionPageContent row, we look up
 * a sibling condition with content that "covers" this variant — either:
 *   1. Same base name after stripping laterality / encounter / unspecified
 *      modifiers (strict match — getBaseConditionName)
 *   2. The variant's commonName CONTAINS the canonical's commonName as a
 *      word substring (loose match — e.g. "Idiopathic chronic gout, right
 *      shoulder" contains "Gout" → falls back to gout page)
 *
 * The resolver returns the longest matching canonical, biased toward exact
 * base-name matches when both strategies hit.
 */

import prisma from '@/lib/db';
import { getBaseConditionName } from '@/lib/condition-cleaner';

export interface CanonicalFallback {
    canonicalSlug: string;
    canonicalConditionId: number;
    canonicalCommonName: string;
}

// In-memory cache of canonical conditions (those with published en content).
// Refreshed at most once per minute. Hot path stays out of the DB.
let canonicalCache: Array<{ id: number; slug: string; commonName: string; baseName: string }> | null = null;
let canonicalCacheExpires = 0;
const CACHE_TTL = 60 * 1000;

async function loadCanonicalIndex(languageCode: string) {
    const now = Date.now();
    if (canonicalCache && canonicalCacheExpires > now) return canonicalCache;

    const rows = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            pageContent: { some: { languageCode, status: 'published' } },
        },
        select: { id: true, slug: true, commonName: true },
    });
    canonicalCache = rows.map(r => ({
        id: r.id,
        slug: r.slug,
        commonName: r.commonName,
        baseName: getBaseConditionName(r.commonName),
    }));
    canonicalCacheExpires = now + CACHE_TTL;
    return canonicalCache;
}

export function _resetCanonicalCacheForTests() {
    canonicalCache = null;
    canonicalCacheExpires = 0;
}

/**
 * Tokenize a condition name into lowercase word tokens, stripping punctuation.
 * "Idiopathic chronic gout, right shoulder, without tophus" →
 *   ["idiopathic","chronic","gout","right","shoulder","without","tophus"]
 */
function tokenize(s: string): string[] {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Returns true if needleTokens appear as a contiguous subsequence in
 * haystackTokens. This is the "word substring" check that detects when one
 * condition name is contained within another.
 */
function containsTokenSequence(haystack: string[], needle: string[]): boolean {
    if (needle.length === 0 || needle.length > haystack.length) return false;
    outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
        for (let j = 0; j < needle.length; j++) {
            if (!tokensMatch(haystack[i + j], needle[j])) continue outer;
        }
        return true;
    }
    return false;
}

/**
 * Medical-vocabulary stem pairs — common cases where a parent's preferred
 * commonName differs in stem from how ICD subtypes phrase it.
 * Each rule: parent term → list of alternate forms it matches.
 */
const STEM_PAIRS: Array<[string, string[]]> = [
    ['syphilis', ['syphilitic']],
    ['gonorrhea', ['gonococcal', 'gonococcic']],
    ['chlamydia', ['chlamydial', 'chlamydophila']],
    ['herpes', ['herpesviral', 'herpetic']],
    ['salmonella', ['salmonellosis']],
    ['typhoid', ['typhoidal']],
    ['amebiasis', ['amebic', 'amoebic', 'amoebiasis']],
    ['trichomoniasis', ['trichomonal']],
    ['tuberculosis', ['tuberculous', 'tuberculotic']],
    ['rotavirus', ['rotaviral']],
    ['adenovirus', ['adenoviral']],
    ['rickettsial', ['rickettsiosis']],
    ['leptospirosis', ['leptospiral']],
    ['brucellosis', ['brucellar']],
];

function tokensMatch(haystack: string, needle: string): boolean {
    if (haystack === needle) return true;
    // Check stem pairs in both directions
    for (const [a, aliases] of STEM_PAIRS) {
        if (needle === a && aliases.includes(haystack)) return true;
        if (haystack === a && aliases.includes(needle)) return true;
        if (aliases.includes(needle) && aliases.includes(haystack)) return true;
    }
    return false;
}

/**
 * Parent-canonical aliases — when the parent's commonName is a short umbrella
 * concept (e.g. "Alcohol Use Disorder") but ICD subtypes phrase it differently
 * (e.g. "Alcohol abuse", "Alcohol dependence"), the resolver checks each alias
 * as an alternative canonical token sequence.
 *
 * Keyed by parent slug — when computing whether a parent matches a variant,
 * we try ALL these alternate token sequences in addition to the parent's
 * commonName tokenization.
 */
const PARENT_ALIASES: Record<string, string[]> = {
    'alcohol-use-disorder': ['Alcohol abuse', 'Alcohol dependence', 'Alcohol use'],
    'opioid-use-disorder': ['Opioid abuse', 'Opioid dependence', 'Opioid use'],
    'cocaine-use-disorder': ['Cocaine abuse', 'Cocaine dependence'],
    'cannabis-use-disorder': ['Cannabis abuse', 'Cannabis dependence'],
    'nicotine-dependence': ['Nicotine dependence', 'Tobacco use'],
    'sedative-use-disorder': ['Sedative abuse', 'Sedative dependence'],
    'stimulant-use-disorder': ['Stimulant abuse', 'Stimulant dependence', 'Other stimulant abuse', 'Other stimulant dependence'],
    'hallucinogen-use-disorder': ['Hallucinogen abuse', 'Hallucinogen dependence'],
    'inhalant-use-disorder': ['Inhalant abuse', 'Inhalant dependence'],
    'kaposi-sarcoma': ['Kaposi sarcoma', 'Kaposi'],
    'merkel-cell-carcinoma': ['Merkel cell'],
    'herpes-simplex-infection': ['Herpesviral infection', 'Herpetic infection', 'Herpes simplex'],
    'chlamydia-infection': ['Chlamydial infection', 'Chlamydial'],
    'salmonella-infection': ['Salmonella'],
    'e-coli-infection': ['Escherichia coli', 'E. coli'],
    'foodborne-illness': ['Foodborne'],
    'rotavirus-infection': ['Rotaviral'],
    'adenovirus-infection': ['Adenoviral'],
    'cytomegalovirus-infection': ['Cytomegaloviral', 'CMV infection'],
    'atypical-mycobacterial-infection': ['Mycobacterial infection', 'Mycobacterial'],
};


export async function findCanonicalConditionForVariant(
    variantConditionId: number,
    variantCommonName: string,
    languageCode: string = 'en'
): Promise<CanonicalFallback | null> {
    const variantTokens = tokenize(variantCommonName);
    if (variantTokens.length === 0) return null;

    const variantBaseName = getBaseConditionName(variantCommonName);
    const index = await loadCanonicalIndex(languageCode);

    let best: { entry: typeof index[0]; matchScore: number } | null = null;

    for (const entry of index) {
        if (entry.id === variantConditionId) continue;

        // Strategy 1: exact base-name match (high score)
        if (variantBaseName && entry.baseName === variantBaseName) {
            const score = 1000 + entry.commonName.length;
            if (!best || score > best.matchScore) best = { entry, matchScore: score };
            continue;
        }

        // Strategy 2: canonical's name (or any registered alias) appears as a
        // contiguous token sequence in the variant's name. Skip 1-token
        // canonical names too short to be specific (commonName length ≥ 4).
        const candidates: string[][] = [];
        const primaryTokens = tokenize(entry.commonName);
        if (primaryTokens.length > 0 && entry.commonName.length >= 4) {
            candidates.push(primaryTokens);
        }
        for (const alias of (PARENT_ALIASES[entry.slug] || [])) {
            const t = tokenize(alias);
            if (t.length > 0) candidates.push(t);
        }
        if (candidates.length === 0) continue;

        for (const canonicalTokens of candidates) {
            if (containsTokenSequence(variantTokens, canonicalTokens)) {
                // Bias toward longer canonical matches (more specific)
                const score = canonicalTokens.length * 10 + entry.commonName.length;
                if (!best || score > best.matchScore) best = { entry, matchScore: score };
                break;
            }
        }
    }

    if (!best) return null;
    return {
        canonicalSlug: best.entry.slug,
        canonicalConditionId: best.entry.id,
        canonicalCommonName: best.entry.commonName,
    };
}
