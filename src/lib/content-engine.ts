import prisma from '@/lib/db';
import { resolveGeoChain, getDeepestGeo, getAncestorIds } from '@/lib/geo-resolver';
import { redis } from '@/lib/redis';
import type { GeoChain } from '@/lib/geo-resolver';

/**
 * Content Engine — "Golden Record" Stitcher
 *
 * The core of aihealz's programmatic SEO. Takes URL parameters and resolves
 * three data sources into one unified page payload:
 *
 * 1. Static Global Data (Golden Record) — Hard medical facts
 * 2. Local Context Data — Regional insights, localized descriptions
 * 3. Provider Data — Top 2 Free + Top 13 Premium doctors for this location
 *
 * OPTIMIZED: All independent queries run in parallel via Promise.all
 */

export interface PageData {
    // ─── Golden Record (Static) ──────────────────────
    condition: {
        id: number;
        slug: string;
        scientificName: string;
        commonName: string;
        description: string | null;
        symptoms: string[];
        treatments: string[];
        faqs: Array<{ q: string; a: string }>;
        specialistType: string;
        severityLevel: string | null;
        icdCode: string | null;
        bodySystem: string | null;
    };

    // ─── Local Context (Dynamic per locale) ──────────
    localContent: {
        title: string;
        description: string;
        localizedAdvice: string | null;
        localFactors: unknown;
        consultationTips: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        status: string;
    } | null;

    // ─── Provider Data (Dynamic per location) ────────
    doctors: {
        premium: DoctorCard[];
        free: DoctorCard[];
    };

    // ─── E-E-A-T Reviewer ───────────────────────────
    reviewer: {
        name: string;
        slug: string;
        licenseNumber: string | null;
        licensingBody: string | null;
        qualifications: string[];
        reviewDate: Date;
    } | null;

    // ─── Automated Content (Generated from ConditionPageContent) ───
    automatedContent: {
        // Hero Section
        h1Title: string | null;
        heroOverview: string | null;
        keyStats: { prevalence?: string; demographics?: string; avgAge?: string; globalCases?: string } | null;

        // Section 1: Overview
        definition: string | null;
        typesClassification: Array<{ type: string; description: string }> | null;

        // Section 2: Symptoms
        primarySymptoms: string[] | null;
        earlyWarningSigns: string[] | null;
        emergencySigns: string[] | null;

        // Section 3: Causes & Risk Factors
        causes: Array<{ cause: string; description: string }> | null;
        riskFactors: Array<{ factor: string; category: string; description: string }> | null;
        affectedDemographics: string[] | null;

        // Section 4: Diagnosis
        diagnosisOverview: string | null;
        diagnosticTests: Array<{ test: string; purpose: string; whatToExpect?: string }> | null;

        // Section 5: Treatments
        treatmentOverview: string | null;
        medicalTreatments: Array<{ name: string; description: string; effectiveness?: string }> | null;
        surgicalOptions: Array<{ name: string; description: string; successRate?: string }> | null;
        alternativeTreatments: Array<{ name: string; description: string }> | null;
        linkedTreatmentSlugs: string[] | null;

        // Section 6: Doctors
        specialistType: string | null;
        whySeeSpecialist: string | null;
        doctorSelectionGuide: string | null;

        // Section 7: Hospitals
        hospitalCriteria: string[] | null;
        keyFacilities: string[] | null;

        // Section 8: Costs
        costBreakdown: Array<{ treatment: string; minCost: number; maxCost: number; currency: string }> | null;
        insuranceGuide: string | null;
        financialAssistance: string | null;

        // Section 9: Prevention & Lifestyle
        preventionStrategies: string[] | null;
        lifestyleModifications: string[] | null;
        dietRecommendations: { recommended: string[]; avoid: string[] } | null;
        exerciseGuidelines: string | null;

        // Section 10: Living With
        dailyManagement: string[] | null;
        prognosis: string | null;
        recoveryTimeline: string | null;
        complications: string[] | null;
        supportResources: Array<{ name: string; url?: string; description?: string }> | null;

        // Section 11: Related Conditions
        confusedWithConditions: Array<{ slug: string; name: string; keyDifference: string }> | null;
        coOccurringConditions: Array<{ slug: string; name: string }> | null;
        relatedConditions: Array<{ slug: string; name: string; relevance?: string }> | null;

        // Section 12: FAQs
        faqs: Array<{ question: string; answer: string; schemaEligible?: boolean }> | null;

        // Simple Names & Regional Tags (for searchability)
        simpleName: string | null;
        regionalNames: Array<{ name: string; region: string; language: string }> | null;
        searchTags: string[] | null;
        symptomKeywords: string[] | null;

        // SEO Meta
        metaTitle: string | null;
        metaDescription: string | null;
        keywords: string[] | null;

        // EEAT Signals
        sources: Array<{ title: string; url?: string; accessedDate?: string }> | null;
        lastReviewed: Date | null;

        // Schema Markup
        schemaMedicalCondition: unknown | null;
        schemaFaqPage: unknown | null;

        // Quality
        qualityScore: number | null;
        wordCount: number | null;
    } | null;

    // ─── Treatment Cost (Phase 9) ────────────────────
    treatmentCost: {
        min: number;
        max: number;
        avg: number;
        currency: string;
        treatmentName: string;
    } | null;

    // ─── Visuals (Phase 9) ───────────────────────────
    featureImage: string | null;

    // ─── Curated images for each section ──────────────
    // Populated from MediaAsset rows where entityType='condition'. Section
    // hints (anatomy/symptoms/diagnosis/etc.) come from MediaAsset.promptUsed
    // (legacy storage slot until a proper section column is added).
    images: Array<{
        assetType: string;
        section: string | null;
        url: string;
        thumbnailUrl: string | null;
        altText: string;
        caption: string | null;
        license: string | null;
        credit: string | null;
        width: number | null;
        height: number | null;
    }>;

    // ─── Meta ────────────────────────────────────────
    geoChain: GeoChain;
    language: string;
    availableLanguages: string[];
    isFallbackContent: boolean;
    needsTranslation?: boolean;
    conditionId?: number;

    // ─── Local Data Density (uniqueness / indexation gate) ───
    // Quantifies how much genuinely location-specific data backs this
    // page. Drives the robots index/noindex decision in generateMetadata
    // so thin sub-country pages don't compete as near-duplicates of the
    // country-level page. See computeLocalDataDensity().
    localData: {
        geoLevel: string;            // country | state | city | locality
        doctorCount: number;         // geo-matched verified doctors
        hasAnyCost: boolean;         // any TreatmentCost row for this country
        hasCityCost: boolean;        // city-level TreatmentCost row
        hasLocalContent: boolean;    // non-fallback, geo-specific LocalizedContent
        score: number;               // weighted density score (for audits)
        isIndexable: boolean;        // robots: index when true
    };

    // ─── Variant Fallback (canonical consolidation for ICD-10 variants) ───
    // When the requested slug has no ConditionPageContent but a sibling base
    // condition does, we serve the sibling's content here. The page must then:
    //   - Render a banner noting the variant relationship
    //   - Emit <link rel="canonical"> to the canonical URL
    //   - Use the canonical's metaTitle/metaDescription for SEO consolidation
    isVariantFallback?: boolean;
    canonicalSlug?: string;
    canonicalCommonName?: string;
}

interface DoctorCard {
    id: number;
    slug: string;
    name: string;
    bio: string | null;
    qualifications: string[];
    experienceYears: number | null;
    rating: number | null;
    reviewCount: number;
    consultationFee: number | null;
    feeCurrency: string;
    profileImage: string | null;
    subscriptionTier: string;
    isVerified: boolean;
    isPrimarySpecialist: boolean;
}

// ─── Page Cache ────────────────────────────────────────────
// Source of truth: Redis (shared across PM2 cluster workers).
// Microcache: tiny in-process map with 200ms TTL to absorb burst traffic
// for the same URL without re-serializing the JSON from Redis.
//
// Why not the old per-worker Map(500)? With pm2 instances='max' each worker
// kept its own 500-entry Map and there was no shared invalidation — a write
// in worker A wouldn't show up in worker B for up to 5 minutes.
const CACHE_TTL_SECONDS = 5 * 60;
const MICRO_TTL_MS = 200;
const MICRO_CACHE = new Map<string, { data: PageData; expires: number }>();

/**
 * Main stitching function — resolves all data for a condition page.
 * OPTIMIZED: Parallel queries + in-memory cache.
 */
export async function stitchPageData(
    lang: string,
    condSlug: string,
    geoSlugs: string[]
): Promise<PageData | null> {
    // ─── Cache lookup: microcache → Redis ────────────
    const cacheKey = `${lang}:${condSlug}:${geoSlugs.join(':')}`;
    const redisKey = `pagedata:${cacheKey}`;

    const micro = MICRO_CACHE.get(cacheKey);
    if (micro && micro.expires > Date.now()) {
        return micro.data;
    }

    try {
        const cachedRaw = await redis.get(redisKey);
        if (cachedRaw) {
            const data = JSON.parse(cachedRaw) as PageData;
            MICRO_CACHE.set(cacheKey, { data, expires: Date.now() + MICRO_TTL_MS });
            return data;
        }
    } catch {
        // Redis miss/error — fall through to DB
    }

    // ─── Phase 1: Condition + GeoChain (must resolve first) ──
    const [condition, geoChain] = await Promise.all([
        prisma.medicalCondition.findUnique({
            where: { slug: condSlug, isActive: true },
            select: {
                id: true, slug: true, scientificName: true, commonName: true,
                description: true, symptoms: true, treatments: true, faqs: true,
                specialistType: true, severityLevel: true, icdCode: true, bodySystem: true,
            },
        }),
        resolveGeoChain(geoSlugs),
    ]);

    if (!condition) return null;

    const deepestGeo = getDeepestGeo(geoChain);
    const { SLUG_TO_CODE } = await import('./countries');
    const countryCode = (SLUG_TO_CODE[geoChain.country?.slug || ''] || geoChain.country?.slug || 'IN').toLowerCase();

    // ─── Phase 2: All independent queries in parallel ────────
    let [
        { localContent, isFallbackContent: localContentIsFallback },
        pageContent,
        costRaw,
        mediaAssets,
        doctors,
        reviewer,
    ] = await Promise.all([
        resolveLocalContent(condition.id, lang, deepestGeo?.id ?? null, geoChain),
        resolvePageContent(condition.id, lang),
        resolveTreatmentCost(condSlug, countryCode, geoChain.city?.slug ?? null),
        prisma.mediaAsset.findMany({
            where: {
                conditionSlug: condSlug,
                entityType: 'condition',
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 12,
        }),
        fetchDoctorsForPage(condition.specialistType, geoChain),
        fetchReviewer(condition.id, deepestGeo?.id ?? null, geoChain),
    ]);

    // ─── Variant fallback: when this slug has no content, serve the canonical
    //     sibling's content with a banner + <link rel="canonical">.
    let isVariantFallback = false;
    let canonicalSlug: string | undefined;
    let canonicalCommonName: string | undefined;
    if (!pageContent) {
        const { findCanonicalConditionForVariant } = await import('./canonical-condition');
        const canonical = await findCanonicalConditionForVariant(condition.id, condition.commonName, lang);
        if (canonical) {
            const canonicalContent = await resolvePageContent(canonical.canonicalConditionId, lang);
            if (canonicalContent) {
                pageContent = canonicalContent;
                isVariantFallback = true;
                canonicalSlug = canonical.canonicalSlug;
                canonicalCommonName = canonical.canonicalCommonName;
                // Use the canonical's reviewer too if we don't already have one
                if (!reviewer) {
                    reviewer = await fetchReviewer(canonical.canonicalConditionId, deepestGeo?.id ?? null, geoChain);
                }
            }
        }
    }

    // ─── Build automatedContent from pageContent ─────────────
    let automatedContent: PageData['automatedContent'] = null;
    if (pageContent) {
        automatedContent = {
            h1Title: pageContent.h1Title,
            heroOverview: pageContent.heroOverview,
            keyStats: pageContent.keyStats as PageData['automatedContent'] extends { keyStats: infer T } ? T : null,
            definition: pageContent.definition,
            typesClassification: pageContent.typesClassification as Array<{ type: string; description: string }> | null,
            primarySymptoms: pageContent.primarySymptoms as string[] | null,
            earlyWarningSigns: pageContent.earlyWarningSigns as string[] | null,
            emergencySigns: pageContent.emergencySigns as string[] | null,
            causes: pageContent.causes as Array<{ cause: string; description: string }> | null,
            riskFactors: pageContent.riskFactors as Array<{ factor: string; category: string; description: string }> | null,
            affectedDemographics: pageContent.affectedDemographics as string[] | null,
            diagnosisOverview: pageContent.diagnosisOverview,
            diagnosticTests: pageContent.diagnosticTests as Array<{ test: string; purpose: string; whatToExpect?: string }> | null,
            treatmentOverview: pageContent.treatmentOverview,
            medicalTreatments: pageContent.medicalTreatments as Array<{ name: string; description: string; effectiveness?: string }> | null,
            surgicalOptions: pageContent.surgicalOptions as Array<{ name: string; description: string; successRate?: string }> | null,
            alternativeTreatments: pageContent.alternativeTreatments as Array<{ name: string; description: string }> | null,
            linkedTreatmentSlugs: pageContent.linkedTreatmentSlugs as string[] | null,
            specialistType: pageContent.specialistType,
            whySeeSpecialist: pageContent.whySeeSpecialist,
            doctorSelectionGuide: pageContent.doctorSelectionGuide,
            hospitalCriteria: pageContent.hospitalCriteria as string[] | null,
            keyFacilities: pageContent.keyFacilities as string[] | null,
            costBreakdown: pageContent.costBreakdown as Array<{ treatment: string; minCost: number; maxCost: number; currency: string }> | null,
            insuranceGuide: pageContent.insuranceGuide,
            financialAssistance: pageContent.financialAssistance,
            preventionStrategies: pageContent.preventionStrategies as string[] | null,
            lifestyleModifications: pageContent.lifestyleModifications as string[] | null,
            dietRecommendations: pageContent.dietRecommendations as { recommended: string[]; avoid: string[] } | null,
            exerciseGuidelines: pageContent.exerciseGuidelines,
            dailyManagement: pageContent.dailyManagement as string[] | null,
            prognosis: pageContent.prognosis,
            recoveryTimeline: pageContent.recoveryTimeline,
            complications: pageContent.complications as string[] | null,
            supportResources: pageContent.supportResources as Array<{ name: string; url?: string; description?: string }> | null,
            confusedWithConditions: pageContent.confusedWithConditions as Array<{ slug: string; name: string; keyDifference: string }> | null,
            coOccurringConditions: pageContent.coOccurringConditions as Array<{ slug: string; name: string }> | null,
            relatedConditions: pageContent.relatedConditions as Array<{ slug: string; name: string; relevance?: string }> | null,
            faqs: pageContent.faqs as Array<{ question: string; answer: string; schemaEligible?: boolean }> | null,
            simpleName: pageContent.simpleName,
            regionalNames: pageContent.regionalNames as Array<{ name: string; region: string; language: string }> | null,
            searchTags: pageContent.searchTags as string[] | null,
            symptomKeywords: pageContent.symptomKeywords as string[] | null,
            metaTitle: pageContent.metaTitle,
            metaDescription: pageContent.metaDescription,
            keywords: pageContent.keywords as string[] | null,
            sources: pageContent.sources as Array<{ title: string; url?: string; accessedDate?: string }> | null,
            lastReviewed: pageContent.lastReviewed,
            schemaMedicalCondition: pageContent.schemaMedicalCondition,
            schemaFaqPage: pageContent.schemaFaqPage,
            qualityScore: pageContent.qualityScore ? Number(pageContent.qualityScore) : null,
            wordCount: pageContent.wordCount,
        };
    }

    // ─── Build treatment cost ────────────────────────────────
    let treatmentCost: PageData['treatmentCost'] = null;
    if (costRaw) {
        treatmentCost = {
            min: Number(costRaw.minCost),
            max: Number(costRaw.maxCost),
            avg: Number(costRaw.avgCost),
            currency: costRaw.currency,
            treatmentName: costRaw.treatmentName,
        };
    }

    const availableLanguages = deepestGeo?.supportedLanguages || ['en'];

    // ─── Fall through to canonical's images if variant has none ────
    let effectiveMediaAssets = mediaAssets || [];
    if (isVariantFallback && canonicalSlug && effectiveMediaAssets.length === 0) {
        effectiveMediaAssets = await prisma.mediaAsset.findMany({
            where: { conditionSlug: canonicalSlug, entityType: 'condition', isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 12,
        });
    }

    // Build images[] with parsed metadata. Prefer cdnUrl, fall back to sourceUrl.
    const images: PageData['images'] = effectiveMediaAssets
        .map(asset => {
            const url = asset.cdnUrl || asset.sourceUrl;
            if (!url) return null;
            let meta: { section?: string | null; caption?: string | null; license?: string | null; credit?: string | null } = {};
            try {
                if (asset.promptUsed) meta = JSON.parse(asset.promptUsed);
            } catch { /* ignore malformed legacy rows */ }
            return {
                assetType: asset.assetType,
                section: meta.section ?? null,
                url,
                thumbnailUrl: asset.thumbnailUrl,
                altText: asset.altText || '',
                caption: meta.caption ?? null,
                license: meta.license ?? null,
                credit: meta.credit ?? null,
                width: asset.width,
                height: asset.height,
            };
        })
        .filter((img): img is NonNullable<typeof img> => img !== null);

    // Legacy single featureImage — prefer 'feature' assetType or 'hero' section
    const heroImg = images.find(i => i.assetType === 'feature' || i.section === 'hero') || images[0];
    const featureImage = heroImg ? heroImg.url : null;

    // ─── Local data density / indexation gate ────────────────
    const doctorCount = doctors.premium.length + doctors.free.length;
    const localData = computeLocalDataDensity({
        countryCode,
        geoChain,
        doctorCount,
        costCitySlug: costRaw?.citySlug ?? null,
        hasAnyCost: !!costRaw,
        hasLocalContent: !!localContent && !localContentIsFallback,
        hasPageContent: !!pageContent,
    });

    const result: PageData = {
        condition: {
            ...condition,
            symptoms: (condition.symptoms as string[]) || [],
            treatments: (condition.treatments as string[]) || [],
            faqs: (condition.faqs as Array<{ q: string; a: string }>) || [],
        },
        localContent,
        automatedContent,
        treatmentCost,
        featureImage,
        images,
        geoChain,
        language: lang,
        availableLanguages,
        isFallbackContent: !pageContent,
        needsTranslation: lang !== 'en' && (!pageContent || pageContent.languageCode === 'en'),
        conditionId: condition.id,
        doctors,
        reviewer,
        localData,
        isVariantFallback,
        canonicalSlug,
        canonicalCommonName,
    };

    // ─── Store in cache ──────────────────────────────────────
    // Fire-and-forget Redis write — don't block response on cache fill.
    redis.setex(redisKey, CACHE_TTL_SECONDS, JSON.stringify(result)).catch(() => {
        // Cache write failures are non-fatal
    });
    MICRO_CACHE.set(cacheKey, { data: result, expires: Date.now() + MICRO_TTL_MS });

    // Evict expired microcache entries to keep the per-worker map small.
    if (MICRO_CACHE.size > 200) {
        const now = Date.now();
        for (const [key, val] of MICRO_CACHE) {
            if (val.expires < now) MICRO_CACHE.delete(key);
        }
    }

    return result;
}

/**
 * Resolve page content with language fallback.
 * Single query with OR conditions instead of 4 sequential queries.
 */
async function resolvePageContent(conditionId: number, lang: string) {
    // Fetch all candidates in one query (both languages, both statuses)
    const candidates = await prisma.conditionPageContent.findMany({
        where: {
            conditionId,
            languageCode: { in: lang === 'en' ? ['en'] : [lang, 'en'] },
        },
        orderBy: { updatedAt: 'desc' },
    });

    // Priority: requested lang + published > en + published > requested lang + any > en + any
    return (
        candidates.find(c => c.languageCode === lang && c.status === 'published') ||
        (lang !== 'en' ? candidates.find(c => c.languageCode === 'en' && c.status === 'published') : null) ||
        candidates.find(c => c.languageCode === lang) ||
        (lang !== 'en' ? candidates.find(c => c.languageCode === 'en') : null) ||
        null
    );
}

/**
 * Resolve treatment cost with city → country → any fallback.
 * Single query with OR conditions instead of 3 sequential queries.
 */
async function resolveTreatmentCost(condSlug: string, countryCode: string, citySlug: string | null) {
    const candidates = await prisma.treatmentCost.findMany({
        where: {
            conditionSlug: condSlug,
            countryCode,
        },
        take: 10,
    });

    // Priority: exact city > country-level (null city) > any
    return (
        (citySlug ? candidates.find(c => c.citySlug === citySlug) : null) ||
        candidates.find(c => c.citySlug === null) ||
        candidates[0] ||
        null
    );
}

/**
 * Resolve localized content with a fallback chain.
 * Uses IN query + in-memory filtering instead of N sequential queries.
 */
async function resolveLocalContent(
    conditionId: number,
    lang: string,
    geoId: number | null,
    geoChain: GeoChain
): Promise<{ localContent: PageData['localContent']; isFallbackContent: boolean }> {
    const select = {
        title: true, description: true, localizedAdvice: true,
        localFactors: true, consultationTips: true, metaTitle: true,
        metaDescription: true, status: true, languageCode: true,
        geographyId: true,
    };

    // Build all possible geo IDs for fallback
    const geoFallbackIds: (number | null)[] = [];
    if (geoId) {
        const ancestors = await getAncestorIds(geoId);
        geoFallbackIds.push(...ancestors);
    }
    geoFallbackIds.push(null); // global fallback

    // Fetch ALL candidates for this condition in both languages at once
    const langCodes = lang === 'en' ? ['en'] : [lang, 'en'];
    const nonNullGeoIds = geoFallbackIds.filter((id): id is number => id !== null);
    const candidates = await prisma.localizedContent.findMany({
        where: {
            conditionId,
            languageCode: { in: langCodes },
            OR: [
                ...(nonNullGeoIds.length > 0 ? [{ geographyId: { in: nonNullGeoIds } }] : []),
                { geographyId: null },
            ],
            status: 'published',
        },
        select,
        orderBy: { updatedAt: 'desc' },
    });

    // Priority: requested lang at deepest geo → ... → requested lang at null → en at deepest → ... → en at null
    for (const targetLang of [lang, ...(lang !== 'en' ? ['en'] : [])]) {
        for (const fallbackGeoId of geoFallbackIds) {
            const match = candidates.find(c => c.languageCode === targetLang && c.geographyId === fallbackGeoId);
            if (match) {
                return {
                    localContent: match,
                    isFallbackContent: targetLang !== lang || fallbackGeoId !== geoId,
                };
            }
        }
    }

    return { localContent: null, isFallbackContent: true };
}

/**
 * Resolve the set of city-level geography IDs a doctor query should match
 * for a given geo chain. Doctors are pinned to cities, so:
 *   - deepest = city      → that city
 *   - deepest = locality  → its parent city
 *   - deepest = state     → every city under that state
 *   - deepest = country   → every city under that country
 *   - deepest = none      → null (no geo filter)
 */
async function getDoctorGeoIds(geoChain: GeoChain): Promise<number[] | null> {
    const deepest =
        geoChain.locality || geoChain.city || geoChain.state || geoChain.country;
    if (!deepest) return null;

    // City/locality: a single city is enough — no recursion needed.
    if (deepest.level === 'city') return [deepest.id];
    if (deepest.level === 'locality') {
        return [deepest.parentId ?? deepest.id];
    }

    // State/country: walk the hierarchy down to every descendant city.
    const rows = await prisma.$queryRaw<{ id: number }[]>`
        WITH RECURSIVE descendants AS (
            SELECT id, level, parent_id FROM geographies WHERE id = ${deepest.id}
            UNION ALL
            SELECT g.id, g.level, g.parent_id
            FROM geographies g
            JOIN descendants d ON g.parent_id = d.id
        )
        SELECT id FROM descendants WHERE level = 'city'
    `;
    return rows.map(r => r.id);
}

/**
 * Fetch doctors for a condition page.
 * Matches doctors by specialty (every condition in a specialty surfaces that
 * specialty's doctors) and by geography (region-scoped via getDoctorGeoIds).
 */
async function fetchDoctorsForPage(
    specialistType: string | null,
    geoChain: GeoChain
): Promise<PageData['doctors']> {
    if (!specialistType) return { premium: [], free: [] };

    const geoIds = await getDoctorGeoIds(geoChain);

    const allDoctors = await prisma.doctorProvider.findMany({
        where: {
            specialty: specialistType,
            geographyId: geoIds && geoIds.length > 0 ? { in: geoIds } : undefined,
            isVerified: true,
        },
        select: {
            id: true, slug: true, name: true, bio: true, qualifications: true,
            experienceYears: true, rating: true, reviewCount: true,
            consultationFee: true, feeCurrency: true, profileImage: true,
            subscriptionTier: true, isVerified: true,
        },
        orderBy: [
            { subscriptionTier: 'desc' },
            { rating: 'desc' },
            { reviewCount: 'desc' },
        ],
        take: 20,
    });

    const premium: DoctorCard[] = [];
    const free: DoctorCard[] = [];

    for (const doc of allDoctors) {
        const card: DoctorCard = {
            id: doc.id,
            slug: doc.slug,
            name: doc.name,
            bio: doc.bio,
            qualifications: doc.qualifications,
            experienceYears: doc.experienceYears,
            rating: doc.rating ? Number(doc.rating) : null,
            reviewCount: doc.reviewCount,
            consultationFee: doc.consultationFee ? Number(doc.consultationFee) : null,
            feeCurrency: doc.feeCurrency,
            profileImage: doc.profileImage,
            subscriptionTier: doc.subscriptionTier,
            isVerified: doc.isVerified,
            // Doctor is matched on specialty, so they are a specialist for
            // every condition in that specialty by definition.
            isPrimarySpecialist: true,
        };

        if (doc.subscriptionTier === 'premium' || doc.subscriptionTier === 'enterprise') {
            if (premium.length < 13) premium.push(card);
        } else {
            if (free.length < 2) free.push(card);
        }
    }

    return { premium, free };
}

/**
 * Fetch the E-E-A-T reviewer for a condition page.
 * Single query with IN clause instead of N sequential queries.
 */
async function fetchReviewer(
    conditionId: number,
    geoId: number | null,
    geoChain: GeoChain
): Promise<PageData['reviewer']> {
    const geoFallbackIds: (number | null)[] = [];
    if (geoId) geoFallbackIds.push(geoId);
    if (geoChain.city) geoFallbackIds.push(geoChain.city.id);
    if (geoChain.state) geoFallbackIds.push(geoChain.state.id);
    if (geoChain.country) geoFallbackIds.push(geoChain.country.id);
    geoFallbackIds.push(null);

    // Single query: fetch all candidate reviewers
    const nonNullReviewerGeoIds = geoFallbackIds.filter((id): id is number => id !== null);
    const candidates = await prisma.conditionReviewer.findMany({
        where: {
            conditionId,
            OR: [
                ...(nonNullReviewerGeoIds.length > 0 ? [{ geographyId: { in: nonNullReviewerGeoIds } }] : []),
                { geographyId: null },
            ],
            isPrimary: true,
        },
        include: {
            doctor: {
                select: {
                    name: true, slug: true, licenseNumber: true,
                    licensingBody: true, qualifications: true,
                },
            },
        },
        orderBy: { reviewDate: 'desc' },
    });

    // Find closest geo match
    for (const fallbackGeoId of geoFallbackIds) {
        const match = candidates.find(c => c.geographyId === fallbackGeoId);
        if (match) {
            return {
                name: match.doctor.name,
                slug: match.doctor.slug,
                licenseNumber: match.doctor.licenseNumber,
                licensingBody: match.doctor.licensingBody,
                qualifications: match.doctor.qualifications,
                reviewDate: match.reviewDate,
            };
        }
    }

    return null;
}

// ─── Local Data Density / Indexation Gate ──────────────────
//
// Rollout allowlist: only these country codes are eligible for
// indexable location pages today. Expanding to a new market is a
// one-line change here once that market has doctor + cost data
// seeded. Scoped to India + USA for the initial rollout.
const ROLLOUT_COUNTRY_CODES = new Set(['in', 'us']);

/**
 * Quantify how much genuinely location-specific data backs a page and
 * decide whether it should be indexed.
 *
 * Country-level pages are the canonical hubs — indexable whenever the
 * condition has real content AND the country is in the rollout
 * allowlist. Sub-country pages (state / city / locality) must add
 * something the country page does not — city-level cost data, a
 * meaningful local doctor pool, or geo-specific localized content —
 * otherwise they are near-duplicates of the country page and get
 * noindex + a canonical pointing up to the hub.
 *
 * The weighted `score` is not used for the gate itself; it exists so
 * the coverage audit script can rank pages by data richness.
 */
function computeLocalDataDensity(args: {
    countryCode: string;
    geoChain: GeoChain;
    doctorCount: number;
    costCitySlug: string | null;
    hasAnyCost: boolean;
    hasLocalContent: boolean;
    hasPageContent: boolean;
}): PageData['localData'] {
    const deepest = getDeepestGeo(args.geoChain);
    const geoLevel = deepest?.level ?? 'country';
    const hasCityCost = args.costCitySlug !== null;

    let score = 0;
    if (args.hasPageContent) score += 2;
    if (args.hasAnyCost) score += 1;
    if (hasCityCost) score += 2;
    if (args.hasLocalContent) score += 3;
    score += Math.min(args.doctorCount, 6) * 0.5;

    const countryAllowed = ROLLOUT_COUNTRY_CODES.has(args.countryCode.toLowerCase());
    const isIndexable =
        countryAllowed &&
        args.hasPageContent &&
        (geoLevel === 'country' ||
            hasCityCost ||
            args.hasLocalContent ||
            args.doctorCount >= 3);

    return {
        geoLevel,
        doctorCount: args.doctorCount,
        hasAnyCost: args.hasAnyCost,
        hasCityCost,
        hasLocalContent: args.hasLocalContent,
        score: Math.round(score * 10) / 10,
        isIndexable,
    };
}
