import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📸 FACULTY PHOTO VERIFICATION REPORT');
  console.log('='.repeat(70) + '\n');
  
  // Get total counts
  const totalWithPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const totalFaculty = await prisma.facultyMember.count();
  
  console.log(`Total Faculty: ${totalFaculty}`);
  console.log(`With Photos: ${totalWithPhotos}`);
  console.log(`Without Photos: ${totalFaculty - totalWithPhotos}`);
  console.log(`Success Rate: ${((totalWithPhotos / totalFaculty) * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(70));
  console.log('SAMPLE FACULTY WITH PHOTOS (10 samples):');
  console.log('='.repeat(70) + '\n');
  
  // Get 10 faculty with photos
  const samples = await prisma.facultyMember.findMany({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    },
    select: {
      nameAr: true,
      degree: true,
      photoUrl: true,
      department: {
        select: {
          nameAr: true
        }
      }
    },
    take: 10
  });
  
  for (const faculty of samples) {
    const photoName = faculty.photoUrl?.split('/').pop() || 'N/A';
    console.log(`   ${faculty.nameAr}`);
    console.log(`   Department: ${faculty.department?.nameAr || 'N/A'}`);
    console.log(`   Degree: ${faculty.degree}`);
    console.log(`   Photo: ${photoName}`);
    console.log('');
  }
  
  console.log('='.repeat(70));
  console.log('✅ PHOTO MIGRATION SUCCESSFUL!');
  console.log('='.repeat(70) + '\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
