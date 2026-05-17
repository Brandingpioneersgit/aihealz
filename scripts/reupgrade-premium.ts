import prisma from '../src/lib/db';

async function main() {
  // Re-upgrade experienced doctors to premium
  const top = await prisma.doctorProvider.findMany({
    where: { experienceYears: { gte: 25 }, subscriptionTier: 'free' },
    select: { id: true, name: true, experienceYears: true },
    take: 50,
    orderBy: { experienceYears: 'desc' }
  });
  console.log('Top experienced free doctors:', top.length);

  for (const doc of top) {
    await prisma.doctorProvider.update({
      where: { id: doc.id },
      data: { subscriptionTier: 'premium' }
    });
  }
  console.log('Upgraded 50 to premium');

  const premiumCount = await prisma.doctorProvider.count({
    where: { subscriptionTier: { in: ['premium', 'enterprise'] } }
  });
  console.log(`Total premium/enterprise: ${premiumCount}`);
}

main().finally(() => prisma.$disconnect());