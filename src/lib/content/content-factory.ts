import { generateConditionRender } from '@/lib/cms/media-engine';
import { getIntentKeyword } from './intent-analyzer';
import { getTreatmentCost } from './cost-estimator';
import { getSpecialistsForCondition } from './specialist-matcher';
import prisma from '@/lib/db';
import { aiChat } from '@/lib/ai/openrouter';

/**
 * Content Factory — Frugal LLM Pipeline
 *
 * Orchestrates the generation of a condition page through a single
 * free-only OpenRouter helper:
 *   1. Visual: ensure media exists
 *   2. Intent: pick primary SEO keyword
 *   3. Content: free OSS reasoning model via aiChat()
 *   4. Data: cost + specialist hydration
 *   5. Save to `condition_content`
 */

type ConditionContentPayload = {
    h1_title: string;
    meta_summary: string;
    llm_summary: string;
    ai_opinion: string;
    local_insights: string;
    treatment_guide: string;
    recovery_tips: string;
    faqs: Array<{ question: string; answer: string }>;
};

function buildPrompt(opts: {
    conditionName: string;
    locationName: string;
    keyword: string;
    language: string;
}): string {
    return `You are an elite SEO Medical Copywriter. Generate content for a medical condition page.
Condition: "${opts.conditionName}"
Location: "${opts.locationName}"
Primary SEO Keyword: "${opts.keyword}"
Language: "${opts.language}"

Output strictly this JSON shape, no markdown fences:
{
  "h1_title": "Semantic H1 optimized for the primary keyword.",
  "meta_summary": "Concise 150-160 character meta description that maximizes CTR.",
  "llm_summary": "Hidden 60-word summary for AI search engines.",
  "ai_opinion": "Authoritative, empathetic, medically accurate overview.",
  "local_insights": "How the local climate or environment in ${opts.locationName} affects ${opts.conditionName}.",
  "treatment_guide": "Markdown with H2/H3 sections. Standard protocols and what to expect at a visit.",
  "recovery_tips": "Practical recovery advice as bullet points.",
  "faqs": [ {"question": "Phrased exactly how patients Google it", "answer": "Direct featured-snippet answer."} ]
}`;
}

async function callContentModel(prompt: string): Promise<ConditionContentPayload> {
    let lastErr: string | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
        const result = await aiChat(
            [{ role: 'user', content: prompt }],
            {
                mode: 'reasoning',
                temperature: 0.15,
                maxTokens: 3500,
                responseFormat: { type: 'json_object' },
            },
        );
        if (result.ok && result.text) {
            return JSON.parse(result.text) as ConditionContentPayload;
        }
        lastErr = result.error;
        await new Promise(r => setTimeout(r, 2_000));
    }
    throw new Error(`Content generation failed: ${lastErr || 'unknown'}`);
}

async function persistConditionContent(
    conditionSlug: string,
    countryCode: string,
    citySlug: string | undefined,
    language: string,
    contentData: ConditionContentPayload,
) {
    return prisma.conditionContent.upsert({
        where: {
            conditionSlug_countryCode_citySlug_language: {
                conditionSlug,
                countryCode,
                citySlug: citySlug || '',
                language,
            },
        },
        update: {
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
            needsRefresh: false,
            lastGenerated: new Date(),
        },
        create: {
            conditionSlug,
            countryCode,
            citySlug: citySlug || '',
            language,
            h1Title: contentData.h1_title,
            metaSummary: contentData.meta_summary,
            llmSummary: contentData.llm_summary,
            aiOpinion: contentData.ai_opinion,
            localInsights: contentData.local_insights,
            treatmentGuide: contentData.treatment_guide,
            recoveryTips: contentData.recovery_tips,
            faqSchema: contentData.faqs,
        },
    });
}

export async function generatePage(
    conditionSlug: string,
    countryCode: string,
    citySlug?: string,
    language: string = 'en',
) {
    const condition = await prisma.medicalCondition.findUnique({
        where: { slug: conditionSlug },
    });
    if (!condition) throw new Error(`Condition ${conditionSlug} not found`);

    const keyword = await getIntentKeyword(
        conditionSlug,
        condition.commonName,
        citySlug,
        countryCode,
    );
    const locationName = citySlug ? citySlug : countryCode;
    const prompt = buildPrompt({
        conditionName: condition.commonName,
        locationName,
        keyword,
        language,
    });

    const contentData = await callContentModel(prompt);

    await generateConditionRender(conditionSlug, condition.commonName);
    if (citySlug) {
        await getTreatmentCost(conditionSlug, condition.commonName, citySlug, countryCode);
    }

    return persistConditionContent(conditionSlug, countryCode, citySlug, language, contentData);
}

/**
 * Backwards-compat alias. Previously routed straight to DeepSeek's
 * proprietary endpoint with a hardcoded API key — now delegates to the
 * free-only OpenRouter pipeline.
 */
export async function generatePageDeepSeek(
    conditionSlug: string,
    countryCode: string,
    citySlug?: string,
    language: string = 'en',
) {
    return generatePage(conditionSlug, countryCode, citySlug, language);
}
