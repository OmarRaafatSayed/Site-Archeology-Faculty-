import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 تصليح صورة محمد عطية\n');
  console.log('═'.repeat(70) + '\n');
  
  // البحث عن محمد عطية في قسم الترميم
  console.log('🔍 البحث عن محمد عطية في قسم الترميم...\n');
  
  const mohamedAttia = await prisma.facultyMember.findFirst({
    where: {
      OR: [
        { nameAr: { contains: 'محمد عطية' } },
        { nameEn: { contains: 'Mohamed Attia' } },
        { nameEn: { contains: 'Hawash' } }
      ],
      department: {
        slug: 'conservation'
      }
    },
    include: {
      department: true
    }
  });
  
  if (mohamedAttia) {
    console.log(`✅ لقيته!`);
    console.log(`   الاسم: ${mohamedAttia.nameAr}`);
    console.log(`   English: ${mohamedAttia.nameEn}`);
    console.log(`   القسم: ${mohamedAttia.department?.nameAr}`);
    console.log(`   الصورة الحالية: ${mohamedAttia.photoUrl || 'مفيش'}`);
    console.log(`   🔧 هنحط صورته الصحيحة: MohamedHawash.gif\n`);
    
    await prisma.facultyMember.update({
      where: { id: mohamedAttia.id },
      data: { photoUrl: '/uploads/faculty/photos/MohamedHawash.gif' }
    });
  } else {
    console.log('❌ مش لاقيه في قسم الترميم!\n');
    
    // نبحث في كل الأقسام
    console.log('🔍 نبحث في كل الأقسام...\n');
    const allMatches = await prisma.facultyMember.findMany({
      where: {
        OR: [
          { nameAr: { contains: 'محمد عطية' } },
          { nameAr: { contains: 'حواش' } },
          { nameEn: { contains: 'Mohamed Attia' } },
          { nameEn: { contains: 'Hawash' } }
        ]
      },
      include: {
        department: true
      }
    });
    
    console.log(`Found ${allMatches.length} matches:\n`);
    for (const match of allMatches) {
      console.log(`   - ${match.nameAr}`);
      console.log(`     English: ${match.nameEn}`);
      console.log(`     Department: ${match.department?.nameAr}`);
      console.log(`     Photo: ${match.photoUrl || 'مفيش'}`);
      console.log('');
    }
  }
  
  // التحقق من د. عادل (اللي كان معاه الصورة غلط)
  console.log('─'.repeat(70) + '\n');
  console.log('✅ د. عادل محمد نصر الدين مهدي - تم شيل الصورة الغلط منه\n');
  
  const adel = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'عادل محمد نصر الدين' } }
  });
  
  if (adel) {
    console.log(`   الاسم: ${adel.nameAr}`);
    console.log(`   الصورة الحالية: ${adel.photoUrl || 'مفيش صورة'}`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n✅ تمام!\n');
  
  // Final count
  const withPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const total = await prisma.facultyMember.count();
  
  console.log(`📊 الوضع الحالي:`);
  console.log(`   Total Faculty: ${total}`);
  console.log(`   With Photos: ${withPhotos} (${((withPhotos/total)*100).toFixed(1)}%)`);
  console.log(`   Without Photos: ${total - withPhotos}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
