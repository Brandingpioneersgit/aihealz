/**
 * Remove duplicate doctors - keep 1 per city+specialty, delete the rest
 */

import prisma from '../src/lib/db';

async function main() {
  console.log('Finding and removing duplicate doctors...\n');

  // Find duplicates (same name + geography_id)
  const dupes = await prisma.$queryRaw`
    SELECT name, geography_id, COUNT(*) as cnt, ARRAY_AGG(id ORDER BY id) as ids
    FROM doctors_providers
    GROUP BY name, geography_id
    HAVING COUNT(*) > 1
  `;

  let totalDeleted = 0;
  for (const dupe of dupes as any[]) {
    const ids = dupe.ids;
    // Keep the first one (lowest ID), delete the rest
    const toDelete = ids.slice(1);
    console.log(`Deleting ${toDelete.length} duplicates of "${dupe.name}" (city ${dupe.geography_id}) - keeping ID ${ids[0]}`);

    await prisma.doctorSpecialty.deleteMany({
      where: { doctorId: { in: toDelete } }
    });

    await prisma.doctorProvider.deleteMany({
      where: { id: { in: toDelete } }
    });

    totalDeleted += toDelete.length;
  }

  console.log(`\n✅ Deleted ${totalDeleted} duplicate doctors`);

  const remaining = await prisma.doctorProvider.count();
  console.log(`Remaining doctors: ${remaining}`);
}

main().finally(() => prisma.$disconnect());