import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n➕ إضافة د. محمد عطية هواش\n');
  console.log('═'.repeat(70) + '\n');
  
  // Get conservation department
  const conservationDept = await prisma.department.findFirst({
    where: { slug: 'conservation' }
  });
  
  if (!conservationDept) {
    console.log('❌ قسم الترميم مش موجود!');
    return;
  }
  
  // Check if already exists
  const existing = await prisma.facultyMember.findFirst({
    where: {
      OR: [
        { nameAr: { contains: 'محمد عطية' }, nameAr: { contains: 'هواش' } },
        { email: 'm_hawash@cu.edu.eg' }
      ]
    }
  });
  
  if (existing) {
    console.log('⚠️  موجود بالفعل!');
    console.log(`   الاسم: ${existing.nameAr}`);
    console.log(`   الصورة: ${existing.photoUrl}`);
    
    // Update photo if missing
    if (!existing.photoUrl) {
      console.log('   🔧 نضيف الصورة...\n');
      await prisma.facultyMember.update({
        where: { id: existing.id },
        data: { photoUrl: '/uploads/faculty/photos/MohamedHawash.gif' }
      });
      console.log('   ✅ تم إضافة الصورة!');
    }
    
    return;
  }
  
  console.log('📝 إضافة د. محمد عطية محمد عطية هواش...\n');
  
  const newMember = await prisma.facultyMember.create({
    data: {
      departmentId: conservationDept.id,
      nameAr: 'د. محمد عطية محمد عطية هواش',
      nameEn: 'Dr. Mohamed Attia Mohamed Attia Hawash',
      degree: 'lecturer',
      specializationAr: 'علاج وصيانة الآثار الجصية',
      specializationEn: 'Treatment and Conservation of Plaster Artifacts',
      email: 'm_hawash@cu.edu.eg',
      photoUrl: '/uploads/faculty/photos/MohamedHawash.gif',
      orderIndex: 100,
      isActive: true,
    }
  });
  
  console.log('✅ تمت الإضافة بنجاح!');
  console.log(`   ID: ${newMember.id}`);
  console.log(`   الاسم: ${newMember.nameAr}`);
  console.log(`   القسم: قسم ترميم الآثار`);
  console.log(`   الصورة: ${newMember.photoUrl}\n`);
  
  console.log('═'.repeat(70));
  
  // Final count
  const conservationCount = await prisma.facultyMember.count({
    where: { departmentId: conservationDept.id }
  });
  
  const withPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const total = await prisma.facultyMember.count();
  
  console.log(`\n📊 الوضع الحالي:`);
  console.log(`   Total Faculty: ${total}`);
  console.log(`   Conservation Department: ${conservationCount} members`);
  console.log(`   With Photos: ${withPhotos} (${((withPhotos/total)*100).toFixed(1)}%)`);
  console.log(`   Without Photos: ${total - withPhotos}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
