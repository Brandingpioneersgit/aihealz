import { NextRequest, NextResponse } from 'next/server';
import { aiChat, aiChatStream, aiKey, AI_BUSY_REPLY } from '@/lib/ai/openrouter';
import { requireChatLead, recordChatMessage } from '@/lib/chat-gate';

const SYSTEM_PROMPT = (condition?: string, country = 'india', lang = 'en') => `You are the AI Care Bot for aihealz. You give friendly, practical guidance for minor symptoms — OVER-THE-COUNTER medications, home remedies, and clear escalation triggers. ${
    condition ? `The user is asking about: '${condition}'. ` : ''
}Always:
- Open with a one-line "I'm AI, see a doctor if it's severe / persistent" disclaimer.
- Format with proper Markdown — headings ('## Home Remedies', '## OTC Options'), short bullet or numbered lists, and Markdown tables when comparing options. Avoid wall-of-text paragraphs.
- Give 3 actionable home remedies with concrete how-to detail (quantity, duration, frequency).
- Give 2 safe OTC options with adult dose, max daily dose, and a short caveat (e.g. liver, ulcer, kidney, pregnancy).
- End with one line on when to escalate to a doctor.
Keep the whole reply tight — under ~250 words.

URL conventions for any markdown links you emit on aihealz.com (use these EXACT patterns — do not invent other URL shapes):
- Condition pages: /${country}/${lang}/<condition-slug>   (e.g. /${country}/${lang}/acne, /${country}/${lang}/back-pain)
- Treatment pages: /treatments/<treatment-slug>            (e.g. /treatments/physical-therapy)
- Doctor list in a city: /doctors/<city-slug>              (e.g. /doctors/mumbai)
- Condition browse index: /conditions
- Treatment browse index: /treatments
Do NOT emit /conditions/<slug> for individual conditions — that path is for specialties and will not resolve. If you are not sure a condition or treatment exists on aihealz, omit the link rather than guessing.`;

export async function POST(req: NextRequest) {
    try {
        const gate = await requireChatLead(req);
        if (!gate.ok) {
            return NextResponse.json(
                { error: gate.reason, resetAt: gate.resetAt },
                { status: gate.status }
            );
        }

        const body = await req.json();
        const { messages, condition, stream, country, lang } = body as {
            messages: Array<{ role: 'user' | 'assistant'; content: string }>;
            condition?: string;
            stream?: boolean;
            country?: string;
            lang?: string;
        };

        // Resolve locale: explicit request > geo cookie > sensible default.
        const cookieCountry = req.cookies.get('aihealz-geo')?.value;
        const cookieLang = req.cookies.get('aihealz-lang')?.value;
        const resolvedCountry = (country || cookieCountry || 'india').toLowerCase();
        const resolvedLang = (lang || cookieLang || 'en').toLowerCase();

        if (!aiKey()) {
            // Even auth gaps shouldn't surface as a scary error to the user.
            return NextResponse.json({ reply: AI_BUSY_REPLY, role: 'assistant', model: 'fallback' });
        }

        const systemMessage = { role: 'system' as const, content: SYSTEM_PROMPT(condition, resolvedCountry, resolvedLang) };

        if (stream) {
            if (!gate.bypass) {
                await recordChatMessage(req, gate.leadId, gate.ipHash);
            }
            return aiChatStream([systemMessage, ...messages], {
                mode: 'chat',
                temperature: 0.3,
                maxTokens: 1000,
            });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60_000);

        const result = await aiChat([systemMessage, ...messages], {
            mode: 'chat',
            temperature: 0.3,
            maxTokens: 1000,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!result.ok) {
            // Log the technical detail server-side; never return it to the user.
            console.warn('[bot] aiChat failed:', result.status, result.error);
            return NextResponse.json({
                reply: AI_BUSY_REPLY,
                role: 'assistant',
                model: 'fallback',
            });
        }

        if (!gate.bypass) {
            await recordChatMessage(req, gate.leadId, gate.ipHash);
        }

        return NextResponse.json({
            reply: result.text,
            role: 'assistant',
            model: result.model,
        });
    } catch (error) {
        console.error('Bot API error:', error);
        return NextResponse.json({
            reply: AI_BUSY_REPLY,
            role: 'assistant',
            model: 'fallback',
        });
    }
}
