import prisma from '../src/lib/db';

async function main() {
  // Check for duplicate names in same city
  const dupes = await prisma.$queryRaw`
    SELECT name, geography_id, COUNT(*) as cnt
    FROM doctors_providers
    GROUP BY name, geography_id
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 20
  `;
  console.log('=== Duplicate doctors (same name + city) ===');
  dupes.forEach((d: any) => console.log(`${d.name} (geo ${d.geography_id}): ${d.cnt}x`));

  const total = await prisma.doctorProvider.count();
  console.log(`\nTotal: ${total}`);

  // Sample unique vs dupes
  const samples = await prisma.doctorProvider.findMany({
    select: { id: true, name: true, specialty: true, slug: true },
    where: { bio: { not: null } },
    take: 10
  });
  console.log('\n=== Sample doctors ===');
  samples.forEach(d => console.log(`${d.id}: ${d.name} (${d.specialty}) - ${d.slug}`));
}

main().finally(() => prisma.$disconnect());