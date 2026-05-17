import prisma from '../src/lib/db';

async function main() {
  const total = await prisma.doctorProvider.count();
  const withImg = await prisma.doctorProvider.count({ where: { profileImage: { not: null } } });
  const noBio = await prisma.doctorProvider.count({ where: { bio: null } });
  const noQuals = await prisma.doctorProvider.count({ where: { qualifications: { isEmpty: true } } });
  const noFee = await prisma.doctorProvider.count({ where: { consultationFee: null } });
  const noRating = await prisma.doctorProvider.count({ where: { rating: null } });
  const verified = await prisma.doctorProvider.count({ where: { isVerified: true } });
  const premium = await prisma.doctorProvider.count({ where: { subscriptionTier: { in: ['premium', 'enterprise'] } } });

  console.log('=== Doctor Profile Completeness ===');
  console.log('Total doctors:', total);
  console.log('With profile image:', withImg, `(${(withImg/total*100).toFixed(1)}%)`);
  console.log('No bio:', noBio, `(${(noBio/total*100).toFixed(1)}%)`);
  console.log('No qualifications:', noQuals, `(${(noQuals/total*100).toFixed(1)}%)`);
  console.log('No consultation fee:', noFee, `(${(noFee/total*100).toFixed(1)}%)`);
  console.log('No rating:', noRating, `(${(noRating/total*100).toFixed(1)}%)`);
  console.log('Verified:', verified, `(${(verified/total*100).toFixed(1)}%)`);
  console.log('Premium/Enterprise:', premium, `(${(premium/total*100).toFixed(1)}%)`);

  // Sample some entries
  const samples = await prisma.doctorProvider.findMany({
    select: { name: true, bio: true, qualifications: true, profileImage: true },
    where: { bio: { not: null } },
    take: 3
  });
  console.log('\n=== Sample doctors ===');
  samples.forEach(d => {
    console.log(`- ${d.name}`);
    console.log(`  Bio: ${d.bio?.substring(0, 100)}...`);
    console.log(`  Quals: ${d.qualifications?.join(', ')}`);
    console.log(`  Img: ${d.profileImage ? 'Yes' : 'No'}`);
  });
}

main().finally(() => prisma.$disconnect());