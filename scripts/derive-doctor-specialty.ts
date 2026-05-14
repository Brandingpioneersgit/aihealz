/**
 * derive-doctor-specialty.ts
 *
 * Populates doctors_providers.specialty (canonical condition specialist_type)
 * for every doctor, so condition pages can match doctors by specialty.
 *
 * Signal priority per doctor:
 *   1. contact_info->>'taxonomyDesc'  (US / NPI doctors — NUCC taxonomy)
 *   2. specialty keyword in the slug   (descriptive Indian doctors)
 *   3. specialty keyword in qualifications[]
 *
 * Run:  npx tsx scripts/derive-doctor-specialty.ts          (report only)
 *       npx tsx scripts/derive-doctor-specialty.ts --apply  (writes updates)
 *
 * Honors DATABASE_URL from the environment, so it works against local or prod.
 */
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const APPLY = process.argv.includes('--apply');

/**
 * Map any raw specialty string (taxonomy desc, slug token, qualification)
 * to a canonical medical_conditions.specialist_type value, or null to skip.
 * Order matters — more specific checks first.
 */
function toSpecialistType(raw: string): string | null {
    const s = raw.toLowerCase().trim();
    if (!s) return null;

    // — surgical / sub-specialty disambiguation first —
    if (s.includes('neurosurg')) return 'Neurosurgery';
    if (s.includes('cardiothoracic') || s.includes('thoracic surgery')) return 'Cardiothoracic & Vascular Surgery';
    if (s.includes('vascular surg')) return 'Cardiothoracic & Vascular Surgery';
    if (s.includes('plastic') || s.includes('reconstructive')) return 'Plastic & Reconstructive Surgery';
    if (s.includes('maxillofacial') || s.includes('oral surgery') || s === 'dentist' || s.includes('dental')) return 'Maxillofacial & Oral Surgery';

    // — "Psychiatry & Neurology, X" NUCC strings —
    if (s.includes('psychiatry') && s.includes('neurology')) {
        if (s.includes(', psychiatry') || s.includes('child & adolescent psych') ||
            s.includes('addiction psych') || s.includes('behavioral neuro')) return 'Psychiatry';
        return 'Neurology'; // neurology + all neuro sub-specialties
    }
    if (s.includes('psychiatr')) return 'Psychiatry';
    if (s.includes('neurolog')) return 'Neurology';

    // — ENT —
    if (s.includes('otolaryngol') || s.includes('otology') || s.startsWith('ent') || s.includes('ent-specialist') || s.includes('ent specialist')) return 'ENT';

    // — ortho —
    if (s.includes('orthop') || s.includes('orthopaedic')) return 'Orthopedics';

    // — cardio —
    if (s.includes('cardio')) return 'Cardiology';

    // — derm —
    if (s.includes('dermat')) return 'Dermatology';

    // — eye —
    if (s.includes('ophthalm')) return 'Ophthalmology';

    // — uro / nephro —
    if (s.includes('urolog')) return 'Urology';
    if (s.includes('nephrol')) return 'Nephrology';

    // — GI —
    if (s.includes('gastro') || s.includes('colon & rectal') || s.includes('colon and rectal') || s.includes('hepatolog')) return 'Gastroenterology';

    // — endo —
    if (s.includes('endocrin')) return 'Endocrinology';

    // — pulm —
    if (s.includes('pulmon')) return 'Pulmonology';

    // — onc / heme —
    if (s.includes('hematolog') && s.includes('oncolog')) return 'Oncology';
    if (s.includes('hematolog')) return 'Hematology';
    if (s.includes('oncolog')) return 'Oncology';

    // — rheum —
    if (s.includes('rheumat')) return 'Rheumatology';

    // — infectious —
    if (s.includes('infectious')) return 'Infectious Disease';

    // — OB/GYN —
    if (s.includes('obstetric') || s.includes('gynecolog') || s.includes('gynaecolog') ||
        s.includes('maternal') || s.includes('reproductive endocrin') || s.includes('urogynecolog')) return 'Obstetrics';

    // — emergency —
    if (s.includes('emergency')) return 'Emergency Medicine';

    // — peds / neonatal —
    if (s.includes('neonat')) return 'Neonatology';
    if (s.includes('pediatr') || s.includes('paediatr')) return 'General Medicine'; // general peds → broad bucket

    // — imaging / labs —
    if (s.includes('radiolog')) return 'Radiology';
    if (s.includes('patholog')) return 'Pathology';
    if (s.includes('nuclear')) return 'Nuclear Medicine';

    // — pain / anesthesia / palliative —
    if (s.includes('pain medicine') || s.includes('palliative') || s.includes('hospice') ||
        s.includes('anesthesi') || s.includes('anaesthesi')) return 'Pain Medicine & Palliative Care';

    // — sports / rehab / podiatry / geriatrics / allergy / genetics —
    if (s.includes('sports medicine')) return 'Sports Medicine';
    if (s.includes('physical medicine') || s.includes('physiotherap') || s.includes('rehabilitation') || s === 'physio') return 'Physical Medicine & Rehabilitation';
    if (s.includes('podiat')) return 'Podiatry';
    if (s.includes('geriatr')) return 'Geriatrics';
    if (s.includes('allerg') || s.includes('immunolog')) return 'Allergy & Immunology';
    if (s.includes('genetic')) return 'Genetics';
    if (s.includes('tropical')) return 'Tropical Medicine';
    if (s.includes('occupational') || s.includes('preventive') || s.includes('public health')) return 'Preventive & Public Health';

    // — generalist buckets —
    if (s.includes('family medicine') || s.includes('family physician')) return 'Family Medicine';
    if (s.includes('general practice') || s.includes('general physician') || s === 'general' ||
        s.includes('internal medicine') || s.includes('hospitalist') || s === 'physician') return 'General Medicine';

    // — generic surgery / critical care → broad bucket —
    if (s === 'surgery' || s.startsWith('surgery,') || s.includes('trauma surgery') || s.includes('critical care')) return 'General Medicine';

    // physician assistant, unknown → skip
    return null;
}

function deriveForDoctor(d: {
    slug: string;
    qualifications: string[] | null;
    contact_info: Record<string, unknown> | null;
}): string | null {
    // 1. NPI taxonomy
    const tax = d.contact_info && typeof d.contact_info.taxonomyDesc === 'string'
        ? d.contact_info.taxonomyDesc : '';
    if (tax) {
        const m = toSpecialistType(tax);
        if (m) return m;
    }
    // 2. slug — strip the trailing -city and leading dr-name-, scan whole slug for keywords
    const slugMatch = toSpecialistType(d.slug.replace(/-/g, ' '));
    if (slugMatch) return slugMatch;
    // 3. qualifications
    if (d.qualifications && d.qualifications.length) {
        const q = d.qualifications.join(' ');
        const m = toSpecialistType(q);
        if (m) return m;
    }
    return null;
}

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
    const { rows } = await pool.query<{
        id: number; slug: string; qualifications: string[] | null; contact_info: Record<string, unknown> | null;
    }>(`SELECT id, slug, qualifications, contact_info FROM doctors_providers`);

    console.log(`Loaded ${rows.length} doctors`);

    const dist: Record<string, number> = {};
    let unmapped = 0;
    const updates: { id: number; specialty: string }[] = [];

    for (const d of rows) {
        const spec = deriveForDoctor(d);
        if (spec) {
            dist[spec] = (dist[spec] || 0) + 1;
            updates.push({ id: d.id, specialty: spec });
        } else {
            unmapped++;
        }
    }

    console.log('\n=== Derived specialty distribution ===');
    for (const [k, v] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${k.padEnd(38)} ${v}`);
    }
    console.log(`  ${'(unmapped — left NULL)'.padEnd(38)} ${unmapped}`);
    console.log(`\nTotal mapped: ${updates.length} / ${rows.length}`);

    if (!APPLY) {
        console.log('\n[report only] Re-run with --apply to write updates.');
        await pool.end();
        return;
    }

    console.log('\nApplying updates...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // batch updates via a VALUES list
        const BATCH = 500;
        for (let i = 0; i < updates.length; i += BATCH) {
            const slice = updates.slice(i, i + BATCH);
            const values = slice.map((_, j) => `($${j * 2 + 1}::int, $${j * 2 + 2}::varchar)`).join(', ');
            const params = slice.flatMap(u => [u.id, u.specialty]);
            await client.query(
                `UPDATE doctors_providers AS d SET specialty = v.specialty
                 FROM (VALUES ${values}) AS v(id, specialty)
                 WHERE d.id = v.id`,
                params,
            );
        }
        await client.query('COMMIT');
        console.log(`✅ Updated ${updates.length} doctors.`);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
