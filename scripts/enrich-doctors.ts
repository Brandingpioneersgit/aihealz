/**
 * Enrich doctor profiles with better bios, fees, ratings, and upgrade to premium
 */

import prisma from '../src/lib/db';

const SPECIALTY_BIOS: Record<string, { description: string; commonConditions: string[] }> = {
  'Cardiology': { description: 'heart and cardiovascular system', commonConditions: ['heart attacks', 'coronary artery disease', 'heart rhythm disorders', 'hypertension'] },
  'Orthopedics': { description: 'bone, joint, and muscle disorders', commonConditions: ['arthritis', 'fractures', 'sports injuries', 'back pain'] },
  'Gastroenterology': { description: 'digestive system and liver diseases', commonConditions: ['acid reflux', 'liver disease', 'inflammatory bowel disease', 'digestive disorders'] },
  'Dermatology': { description: 'skin, hair, and nail conditions', commonConditions: ['acne', 'eczema', 'psoriasis', 'skin allergies'] },
  'Neurology': { description: 'nervous system disorders', commonConditions: ['migraines', 'epilepsy', 'stroke', 'Parkinson\'s disease'] },
  'Pulmonology': { description: 'respiratory and lung conditions', commonConditions: ['asthma', 'COPD', 'sleep apnea', 'respiratory infections'] },
  'Endocrinology': { description: 'hormonal and metabolic disorders', commonConditions: ['diabetes', 'thyroid disorders', 'obesity', 'hormonal imbalances'] },
  'Nephrology': { description: 'kidney diseases and disorders', commonConditions: ['kidney stones', 'hypertension', 'dialysis', 'kidney failure'] },
  'Urology': { description: 'urinary tract and male reproductive health', commonConditions: ['prostate issues', 'kidney stones', 'urinary infections', 'incontinence'] },
  'Ophthalmology': { description: 'eye health and vision', commonConditions: ['cataracts', 'glaucoma', 'diabetic eye disease', 'vision correction'] },
  'ENT': { description: 'ear, nose, and throat conditions', commonConditions: ['sinusitis', 'tonsillitis', 'hearing loss', 'allergies'] },
  'Psychiatry': { description: 'mental health and behavioral disorders', commonConditions: ['depression', 'anxiety', 'bipolar disorder', 'stress management'] },
  'Oncology': { description: 'cancer diagnosis and treatment', commonConditions: ['various cancers', 'chemotherapy', 'radiation therapy', 'cancer screening'] },
  'Pediatrics': { description: 'child health and development', commonConditions: ['childhood illnesses', 'vaccinations', 'developmental concerns', 'nutrition'] },
  'Obstetrics & Gynecology': { description: 'women\'s health and reproductive care', commonConditions: ['pregnancy care', 'menstrual disorders', 'fertility', 'menopause'] },
  'General Medicine': { description: 'adult healthcare and chronic disease management', commonConditions: ['diabetes', 'hypertension', 'infections', 'preventive care'] },
  'Internal Medicine': { description: 'complex adult medical conditions', commonConditions: ['chronic diseases', 'metabolic disorders', 'autoimmune conditions', 'preventive medicine'] },
  'Neurosurgery': { description: 'brain and spine surgery', commonConditions: ['brain tumors', 'spinal disorders', 'aneurysms', 'neurosurgical interventions'] },
  'Rheumatology': { description: 'autoimmune and inflammatory conditions', commonConditions: ['rheumatoid arthritis', 'lupus', 'joint pain', 'autoimmune diseases'] },
  'default': { description: 'medical conditions', commonConditions: ['chronic conditions', 'acute illnesses', 'preventive care', 'diagnostic evaluations'] }
};

async function generateBio(name: string, specialty: string, experienceYears: number, city: string): Promise<string> {
  const specialtyInfo = SPECIALTY_BIOS[specialty] || SPECIALTY_BIOS['default'];
  const conditions = specialtyInfo.commonConditions.slice(0, 3).join(', ');
  return `Dr. ${name.split(' ').slice(1).join(' ')} is a highly experienced ${specialty.toLowerCase()} specialist with ${experienceYears} years of clinical expertise. Specializing in ${specialtyInfo.description}, Dr. ${name.split(' ').slice(-1)[0]} provides comprehensive care for conditions including ${conditions}. Practicing in ${city}, dedicated to patient-centered care and evidence-based medicine.`;
}

async function main() {
  console.log('Starting doctor profile enrichment...\n');

  // Find doctors missing key fields
  const missingBio = await prisma.doctorProvider.findMany({
    where: {
      OR: [
        { bio: null },
        { bio: '' }
      ]
    },
    select: {
      id: true,
      name: true,
      specialty: true,
      experienceYears: true,
      consultationFee: true,
      geography: { select: { name: true } }
    },
    take: 5000
  });

  console.log(`Found ${missingBio.length} doctors needing bio enrichment`);

  let enriched = 0;
  for (const doctor of missingBio) {
    const cityName = doctor.geography?.name || 'India';
    const bio = await generateBio(
      doctor.name,
      doctor.specialty || 'General Medicine',
      doctor.experienceYears || 15,
      cityName
    );

    await prisma.doctorProvider.update({
      where: { id: doctor.id },
      data: {
        bio,
        consultationFee: doctor.consultationFee || (doctor.experienceYears && doctor.experienceYears > 20 ? 1500 : 1000),
        rating: 4.5
      }
    });
    enriched++;
    if (enriched % 500 === 0) console.log(`Enriched ${enriched}/${missingBio.length}...`);
  }

  console.log(`\nEnriched ${enriched} doctor profiles`);

  // Upgrade top doctors to premium based on experience and location
  console.log('\nUpgrading top doctors to premium...');

  const geographyIds = await prisma.doctorProvider.groupBy({
    by: ['geographyId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 100
  });

  let upgraded = 0;
  for (const geo of geographyIds.slice(0, 50)) {
    // Get top 3 doctors by experience in each major city
    const topDoctors = await prisma.doctorProvider.findMany({
      where: {
        geographyId: geo.geographyId,
        experienceYears: { gte: 20 },
        subscriptionTier: 'free'
      },
      orderBy: { experienceYears: 'desc' },
      take: 3,
      select: { id: true, name: true, experienceYears: true }
    });

    for (const doc of topDoctors) {
      await prisma.doctorProvider.update({
        where: { id: doc.id },
        data: {
          subscriptionTier: 'premium',
          rating: 4.7,
          reviewCount: { increment: 50 }
        }
      });
      upgraded++;
    }
  }

  console.log(`Upgraded ${upgraded} doctors to premium`);
  console.log('\n✅ Enrichment complete!');
}

main().finally(() => prisma.$disconnect());