/**
 * Generate profile images for doctors missing them
 */

import prisma from '../src/lib/db';

async function main() {
  console.log('Generating profile images for doctors...\n');

  const doctorsWithoutImage = await prisma.doctorProvider.findMany({
    where: {
      OR: [
        { profileImage: null },
        { profileImage: '' }
      ]
    },
    select: {
      id: true,
      name: true
    },
    take: 5000
  });

  console.log(`Found ${doctorsWithoutImage.length} doctors without profile images`);

  // Indian name gender detection (basic heuristic)
  const femaleNames = ['Priya', 'Neha', 'Sunita', 'Kavita', 'Meera', 'Asha', 'Anita', 'Pooja', 'Sapna', 'Sneha', 'Aishwarya', 'Rani', 'Mira', 'Lata', 'Kamla', 'Sunila', 'Usha', 'Geeta', 'Rani', 'Sadhana', 'Nirmala', 'Shobha', 'Rani', 'Anu', 'Barsha', 'Archita', 'Elina', 'Sivani', 'Nilakshi', 'Tarali', 'Barsha', 'Nishita', 'Patricia', 'Deborah', 'Sonia', 'Angela', 'Mercy', 'Priyanka', 'Sonia', 'Tombi', 'Memcha', 'Sangeeta', 'Ananya', 'Mousumi', 'Susmita', 'Ruma', 'Jayanti', 'Vanlalruati', 'Malsawmtluangi', 'Nuzhat', 'Asiya', 'Rukhsana', 'Padma', 'Angmo', 'Diskit', 'Yangchen', 'Himani', 'Manju', 'Kamla', 'Anita', 'Saraswati', 'Pratibha', 'Asha', 'Mamta', 'Sunita', 'Zoramthanga', 'Lalduhoma'];

  let updated = 0;
  for (const doctor of doctorsWithoutImage) {
    // Detect gender from name
    const firstName = doctor.name.split(' ')[1] || '';
    const isFemale = femaleNames.some(n => firstName.startsWith(n));
    const genderPath = isFemale ? 'women' : 'men';

    // Generate consistent image based on doctor ID
    const imgIndex = (doctor.id % 99) + 1;
    const profileImage = `https://randomuser.me/api/portraits/${genderPath}/${imgIndex}.jpg`;

    await prisma.doctorProvider.update({
      where: { id: doctor.id },
      data: { profileImage }
    });

    updated++;
    if (updated % 1000 === 0) console.log(`Updated ${updated}/${doctorsWithoutImage.length}...`);
  }

  console.log(`\n✅ Generated ${updated} profile images`);
}

main().finally(() => prisma.$disconnect());