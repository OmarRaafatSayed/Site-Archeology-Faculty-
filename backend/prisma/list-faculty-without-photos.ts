import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get faculty without photos
  const facultyWithoutPhotos = await prisma.facultyMember.findMany({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: '' }
      ]
    },
    orderBy: { nameAr: 'asc' }
  });
  
  // Get faculty with photos
  const facultyWithPhotos = await prisma.facultyMember.findMany({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    },
    orderBy: { nameAr: 'asc' }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FACULTY PHOTOS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Faculty: ${facultyWithoutPhotos.length + facultyWithPhotos.length}`);
  console.log(`With Photos: ${facultyWithPhotos.length}`);
  console.log(`Without Photos: ${facultyWithoutPhotos.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (facultyWithoutPhotos.length > 0) {
    console.log('❌ Faculty members WITHOUT photos:\n');
    
    for (const member of facultyWithoutPhotos) {
      console.log(`   ${member.nameAr} (${member.department})`);
    }
  }
  
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
