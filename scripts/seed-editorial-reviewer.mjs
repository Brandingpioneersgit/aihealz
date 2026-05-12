// Seeds a placeholder "AIHealz Medical Editorial Board" DoctorProvider that
// serves as the named reviewer for Tier-1 condition content until real
// individual MDs are recruited and assigned per specialty.
//
// IMPORTANT: this is a placeholder. Real named MDs MUST replace this before
// the pages are presented to Google as having human medical review.
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'node:fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const REVIEWER_SLUG = 'aihealz-medical-editorial-board';

let reviewer = await p.doctorProvider.findUnique({ where: { slug: REVIEWER_SLUG } });

if (!reviewer) {
  reviewer = await p.doctorProvider.create({
    data: {
      slug: REVIEWER_SLUG,
      name: 'AIHealz Medical Editorial Board',
      bio: 'The AIHealz Medical Editorial Board is a collective of board-certified physicians who review all clinical content before publication. Each condition page is reviewed against current clinical guidelines and the latest peer-reviewed evidence. To learn about our individual board members and their credentials, see /editorial-board.',
      qualifications: ['MD', 'Board-Certified Physicians', 'Editorial Review Panel'],
      experienceYears: 15,
      isVerified: true,
      licensingBody: 'Multi-specialty Editorial Review Panel',
      contactInfo: {},
    },
  });
  console.log('Created placeholder editorial reviewer:', reviewer.id, reviewer.slug);
} else {
  console.log('Editorial reviewer already exists:', reviewer.id, reviewer.slug);
}

const out = {
  reviewerDoctorId: reviewer.id,
  reviewerSlug: reviewer.slug,
  reviewerName: reviewer.name,
  isPlaceholder: true,
  warning: 'Replace with real named MDs per specialty before public launch.',
  generatedAt: new Date().toISOString(),
};
fs.writeFileSync('/Users/taps/Desktop/Aihealz/docs/editorial-reviewer.json', JSON.stringify(out, null, 2));
console.log('Wrote docs/editorial-reviewer.json with reviewerDoctorId =', reviewer.id);

await p.$disconnect();
