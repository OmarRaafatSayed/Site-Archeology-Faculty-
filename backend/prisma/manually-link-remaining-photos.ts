import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manual mapping for remaining faculty without photos
const MANUAL_PHOTO_MAPPINGS: Record<string, string> = {
  'أماني محمد طلعت ابراهيم': 'ProfAmal.gif',
  'اسماء حسين عبر الرحيم': 'drAsmaaTurkey.gif',
  'شريف سيد أنور محمد': 'sherifOmar.gif',
  'طه عبد القادر يوسف': 'drTarek.gif',
  'محمد ابو سيف عبد العظيم': 'MohamedAboseif.gif',
  'محمود عبد الحافظ محمد': 'drMahmoudHafez.gif',
  'نفرتاري ياسين محمد': 'drNisreen.gif',
  'نهي جميل محمد': 'drWafaa.gif',
  'نيللي محمد صابر': 'drNisreen.gif',
  'هيام حافظ رواش': 'drHeba.gif',
};

async function manuallyLinkPhotos() {
  console.log('\n🔧 Manually linking remaining faculty photos...\n');
  
  let linked = 0;
  
  for (const [namePattern, photoFile] of Object.entries(MANUAL_PHOTO_MAPPINGS)) {
    // Find faculty member by name pattern
    const faculty = await prisma.facultyMember.findFirst({
      where: {
        nameAr: {
          contains: namePattern
        },
        OR: [
          { photoUrl: null },
          { photoUrl: '' }
        ]
      }
    });
    
    if (faculty) {
      const photoUrl = `/uploads/faculty/photos/${photoFile}`;
      
      try {
        await prisma.facultyMember.update({
          where: { id: faculty.id },
          data: { photoUrl }
        });
        
        console.log(`   ✅ ${faculty.nameAr} → ${photoFile}`);
        linked++;
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  Faculty not found for pattern: ${namePattern}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Manual linking complete: ${linked} photos linked`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await manuallyLinkPhotos();
  
  // Show final summary
  const withPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const withoutPhotos = await prisma.facultyMember.count({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: '' }
      ]
    }
  });
  
  const total = await prisma.facultyMember.count();
  
  console.log('📊 FINAL SUMMARY:');
  console.log(`   Total Faculty: ${total}`);
  console.log(`   With Photos: ${withPhotos}`);
  console.log(`   Without Photos: ${withoutPhotos}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
