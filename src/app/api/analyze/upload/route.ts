import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline, generateSessionHash } from '@/lib/ai-pipeline/pipeline';
import { aiChat, aiKey } from '@/lib/ai/openrouter';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ACCEPTED_MIME = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
]);

type ReportType = 'blood_work' | 'imaging' | 'pathology' | 'prescription' | 'other';

function reportTypeFromFile(fileName: string, mimeType: string): ReportType {
    const name = fileName.toLowerCase();
    if (mimeType.startsWith('image/')) return 'imaging';
    if (name.includes('blood') || name.includes('cbc') || name.includes('lipid')) return 'blood_work';
    if (name.includes('biopsy') || name.includes('pathology')) return 'pathology';
    if (name.includes('rx') || name.includes('prescription')) return 'prescription';
    if (name.includes('mri') || name.includes('ct') || name.includes('xray') || name.includes('scan')) return 'imaging';
    return 'other';
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
        const result = await parser.getText();
        return result.text || '';
    } finally {
        await parser.destroy().catch(() => {});
    }
}

async function extractFromImage(buffer: Buffer, mimeType: string): Promise<string> {
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const result = await aiChat(
        [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text:
                            'You are an OCR + clinical extraction step in a medical report analysis pipeline. ' +
                            'Read every readable character in the attached medical document image and output the FULL TEXT exactly as it appears, preserving numbers, units, reference ranges, dates, and section headers. ' +
                            'Do NOT summarize, interpret, or omit anything. If the image is not a medical report, say so on a single line: NOT_A_MEDICAL_REPORT.',
                    },
                    { type: 'image_url', image_url: { url: dataUrl } },
                ],
            },
        ],
        { mode: 'vision', temperature: 0.1, maxTokens: 4000 },
    );
    if (!result.ok || !result.text) {
        throw new Error(result.error || 'Vision extraction failed');
    }
    return result.text.trim();
}

export async function POST(request: NextRequest) {
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(`analyze:${clientId}`, RATE_LIMITS.analyze);
    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before analyzing another report.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) },
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }
        if (file.size === 0) {
            return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Max 10 MB.' }, { status: 413 });
        }
        if (!ACCEPTED_MIME.has(file.type)) {
            return NextResponse.json(
                { error: 'Unsupported file type. Upload a PDF, PNG, JPG, or WebP.' },
                { status: 415 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            try {
                text = await extractFromPdf(buffer);
            } catch (err) {
                console.error('[analyze/upload] pdf-parse failed:', err);
                return NextResponse.json(
                    { error: 'Could not read this PDF. Try uploading a screenshot of the report instead.' },
                    { status: 422 },
                );
            }
            if (text.trim().length < 50) {
                return NextResponse.json(
                    {
                        error:
                            'This PDF appears to be a scanned image — no extractable text. Take a screenshot or photo of the report and upload that instead.',
                    },
                    { status: 422 },
                );
            }
        } else {
            if (!aiKey()) {
                return NextResponse.json(
                    { error: 'Image OCR is temporarily unavailable. Try a PDF or paste the report text.' },
                    { status: 503 },
                );
            }
            try {
                text = await extractFromImage(buffer, file.type);
            } catch (err) {
                console.error('[analyze/upload] image OCR failed:', err);
                return NextResponse.json(
                    { error: 'Could not read this image. Try a clearer screenshot or paste the text.' },
                    { status: 422 },
                );
            }
            if (text.includes('NOT_A_MEDICAL_REPORT')) {
                return NextResponse.json(
                    { error: 'This does not look like a medical report. Upload a clinical report, lab result, or imaging summary.' },
                    { status: 422 },
                );
            }
            if (text.length < 50) {
                return NextResponse.json(
                    { error: 'Could not extract enough text from the image. Try a clearer screenshot or paste the report text.' },
                    { status: 422 },
                );
            }
        }

        const reportType = reportTypeFromFile(file.name, file.type);

        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const sessionHash = generateSessionHash(ip, userAgent);

        const countrySlug = request.headers.get('x-aihealz-country') || 'india';
        const citySlug = request.headers.get('x-aihealz-city') || null;
        const lang = request.headers.get('x-aihealz-lang') || 'en';

        const result = await runAnalysisPipeline({
            text: text.trim(),
            reportType,
            sessionHash,
            countrySlug,
            citySlug,
            lang,
        });

        return NextResponse.json({
            success: true,
            analysisId: result.analysisId,
            dossier: result.dossier,
            doctors: result.matchedDoctors,
            meta: {
                confidenceScore: result.meta.confidenceScore,
                urgencyLevel: result.extraction.urgencyLevel,
                processingTimeMs: result.meta.processingTimeMs,
                piiRedacted: result.meta.sanitizedPiiCount,
                extractedFrom: file.type,
                extractedChars: text.length,
                sourceFileName: file.name,
            },
        });
    } catch (error) {
        console.error('[analyze/upload] pipeline error:', error);
        return NextResponse.json(
            { error: 'Failed to process your file. Please try again.' },
            { status: 500 },
        );
    }
}
