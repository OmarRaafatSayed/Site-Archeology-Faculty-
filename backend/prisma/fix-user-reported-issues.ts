import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 تصليح المشاكل اللي المستخدم حددها\n');
  console.log('═'.repeat(70) + '\n');
  
  // مشكلة 1: د. حنان علي محرم - الصورة غلط
  console.log('1️⃣  د. حنان علي محرم');
  const hanan = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'حنان علي محرم' } }
  });
  
  if (hanan) {
    console.log(`   الاسم الحالي: ${hanan.nameAr}`);
    console.log(`   الصورة الحالية: ${hanan.photoUrl}`);
    console.log(`   🔧 نشيل الصورة الغلط\n`);
    
    await prisma.facultyMember.update({
      where: { id: hanan.id },
      data: { photoUrl: null }
    });
  } else {
    console.log('   ❌ مش موجود\n');
  }
  
  // مشكلة 2: د. داليا محمد السيد محمد - الصورة غلط
  console.log('2️⃣  د. داليا محمد السيد محمد');
  const dalia = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'داليا محمد' } }
  });
  
  if (dalia) {
    console.log(`   الاسم الحالي: ${dalia.nameAr}`);
    console.log(`   الصورة الحالية: ${dalia.photoUrl}`);
    console.log(`   🔧 نشيل الصورة الغلط\n`);
    
    await prisma.facultyMember.update({
      where: { id: dalia.id },
      data: { photoUrl: null }
    });
  } else {
    console.log('   ❌ مش موجود\n');
  }
  
  // مشكلة 3: د. عادل محمد نصر الدين مهدي - الاسم غلط (المفروض محمد عطية)
  console.log('3️⃣  د. عادل محمد نصر الدين مهدي (الاسم غلط)');
  const adel = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'عادل محمد نصر الدين' } }
  });
  
  if (adel) {
    console.log(`   الاسم الحالي: ${adel.nameAr}`);
    console.log(`   الصورة الحالية: ${adel.photoUrl}`);
    console.log(`   ⚠️  ملحوظة: المستخدم قال الاسم غلط - المفروض "محمد عطية"`);
    console.log(`   لكن محتاجين نتأكد من الاسم الصح من السكربتات القديمة\n`);
    
    // نشيل الصورة لحد ما نتأكد من الاسم الصح
    await prisma.facultyMember.update({
      where: { id: adel.id },
      data: { photoUrl: null }
    });
  } else {
    console.log('   ❌ مش موجود\n');
  }
  
  // مشكلة 4: د. دعاء إبراهيم عبد المنعم الجعار - الصورة مش بتاعتها
  console.log('4️⃣  د. دعاء إبراهيم عبد المنعم الجعار');
  const doaa = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'دعاء إبراهيم' } }
  });
  
  if (doaa) {
    console.log(`   الاسم الحالي: ${doaa.nameAr}`);
    console.log(`   الصورة الحالية: ${doaa.photoUrl}`);
    console.log(`   🔧 نشيل الصورة الغلط\n`);
    
    await prisma.facultyMember.update({
      where: { id: doaa.id },
      data: { photoUrl: null }
    });
  } else {
    console.log('   ❌ مش موجود\n');
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
