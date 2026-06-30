import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚨 تصليح مشاكل عدم مطابقة الجنس مع الصور\n');
  console.log('═'.repeat(70) + '\n');
  
  // مشكلة 1: جمال عبد الرحيم (رجل) - الصورة drGamal.gif (فيها زكية زكي جمال الدين - ست)
  // الحل: نشيل الصورة من جمال عبد الرحيم
  console.log('1️⃣  أ.د/ جمال عبد الرحيم ابراهيم (رجل)');
  console.log('    المشكلة: drGamal.gif (فيها ست)');
  const gamal = await prisma.facultyMember.findFirst({
    where: { nameAr: 'أ.د/ جمال عبد الرحيم ابراهيم' }
  });
  
  if (gamal && gamal.photoUrl?.includes('drGamal.gif')) {
    // Check if Zakiya uses this photo
    const zakiya = await prisma.facultyMember.findFirst({
      where: { nameAr: 'د. زكية زكي جمال الدين' }
    });
    
    if (zakiya && zakiya.photoUrl?.includes('drGamal.gif')) {
      console.log('    ✅ drGamal.gif مستخدمة مع د. زكية (ست) - صح');
      console.log('    🔧 نشيل الصورة من أ.د/ جمال (رجل)\n');
      
      await prisma.facultyMember.update({
        where: { id: gamal.id },
        data: { photoUrl: null }
      });
    }
  }
  
  // مشكلة 2: د. نيفين يحيي محمد أحمد (ست) - الصورة Dr Ahmed.jpg (فيها راجل)
  console.log('2️⃣  د. نيفين يحيي محمد أحمد (ست)');
  console.log('    المشكلة: Dr Ahmed.jpg (فيها راجل)');
  const nivin = await prisma.facultyMember.findFirst({
    where: { nameAr: 'د. نيفين يحيي محمد أحمد' }
  });
  
  if (nivin && nivin.photoUrl?.includes('Dr Ahmed.jpg')) {
    console.log('    🔧 نشيل الصورة من د. نيفين (ست)\n');
    
    await prisma.facultyMember.update({
      where: { id: nivin.id },
      data: { photoUrl: null }
    });
  }
  
  // مشكلة 3: أ. مرفت حمدي مصطفى محمد على (ست) - الصورة mostafaFarag.gif (فيها راجل)
  console.log('3️⃣  أ. مرفت حمدي مصطفى محمد على (ست)');
  console.log('    المشكلة: mostafaFarag.gif (فيها راجل)');
  const marfat = await prisma.facultyMember.findFirst({
    where: { nameAr: 'أ. مرفت حمدي مصطفى محمد على' }
  });
  
  if (marfat && marfat.photoUrl?.includes('mostafaFarag.gif')) {
    console.log('    🔧 نشيل الصورة من أ. مرفت (ست)\n');
    
    await prisma.facultyMember.update({
      where: { id: marfat.id },
      data: { photoUrl: null }
    });
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ تم تصليح المشاكل!\n');
  
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
