import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const candidates = process.argv.slice(2);
if (candidates.length === 0) {
  console.error('Usage: node scripts/check-slugs.mjs <slug1> [slug2...]');
  console.error('  or with partials:  node scripts/check-slugs.mjs --search pseudogout');
  process.exit(1);
}

if (candidates[0] === '--search') {
  const term = candidates[1];
  const rows = await p.medicalCondition.findMany({
    where: { OR: [{ slug: { contains: term } }, { commonName: { contains: term, mode: 'insensitive' } }] },
    select: { slug: true, commonName: true, specialistType: true },
    take: 30,
  });
  for (const r of rows) console.log(`${r.slug.padEnd(50)} ${r.commonName.padEnd(50)} ${r.specialistType || ''}`);
} else {
  for (const slug of candidates) {
    const row = await p.medicalCondition.findUnique({
      where: { slug },
      select: { slug: true, commonName: true, isActive: true, specialistType: true },
    });
    if (row) console.log(`✓ ${slug.padEnd(50)} ${row.commonName} [${row.isActive ? 'active' : 'INACTIVE'}]`);
    else console.log(`✗ ${slug.padEnd(50)} NOT FOUND`);
  }
}

await p.$disconnect();
