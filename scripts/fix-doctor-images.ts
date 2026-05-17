/**
 * Fix doctor profile images with proper initials-based avatars
 */

import prisma from '../src/lib/db';

async function main() {
  console.log('Fixing profile images...\n');

  const doctors = await prisma.doctorProvider.findMany({
    select: { id: true, name: true },
    where: {
      profileImage: { contains: 'randomuser.me' }
    }
  });

  console.log(`Found ${doctors.length} doctors with randomuser.me images`);

  let updated = 0;
  for (const doc of doctors) {
    // Extract initials from name
    const parts = doc.name.split(' ');
    const initials = parts
      .filter(p => p.length > 0 && !p.startsWith('Dr.'))
      .map(p => p[0].toUpperCase())
      .slice(0, 2)
      .join('');

    // Use UI Avatars for consistent, professional-looking avatars
    const name = parts.slice(1).join(' ') || doc.name;
    const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=2563eb&color=ffffff&bold=true`;

    await prisma.doctorProvider.update({
      where: { id: doc.id },
      data: { profileImage }
    });

    updated++;
    if (updated % 5000 === 0) console.log(`Updated ${updated}/${doctors.length}...`);
  }

  console.log(`\n✅ Updated ${updated} profile images to use initials avatars`);
}

main().finally(() => prisma.$disconnect());