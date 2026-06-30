import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// استخدام الصور المحلية اللي المستخدم وفرها
const DEPARTMENT_LOCAL_IMAGES = {
  'egyptology': {
    url: '/uploads/departments/egyptology.jpeg',
    description: 'Ancient Egypt - مصر القديمة',
    color: '#D4AF37' // ذهبي
  },
  'islamic': {
    url: '/uploads/departments/islamic.jpeg',
    description: 'Islamic Architecture - العمارة الإسلامية',
    color: '#0C4A6E' // أزرق داكن
  },
  'conservation': {
    url: '/uploads/departments/conservation.jpeg',
    description: 'Restoration and Conservation - الترميم والصيانة',
    color: '#92400E' // بني
  },
  'greco-roman': {
    url: '/uploads/departments/greco-roman.jpeg',
    description: 'Greco-Roman Antiquities - الآثار اليونانية الرومانية',
    color: '#7C2D12' // رمادي حجري
  }
};

async function main() {
  console.log('\n🖼️  تحديث صور cover الأقسام - استخدام الصور المحلية\n');
  console.log('═'.repeat(70) + '\n');
  
  for (const [slug, data] of Object.entries(DEPARTMENT_LOCAL_IMAGES)) {
    console.log(`📸 ${slug}...`);
    
    const dept = await prisma.department.findUnique({
      where: { slug }
    });
    
    if (!dept) {
      console.log(`   ❌ القسم مش موجود!\n`);
      continue;
    }
    
    await prisma.department.update({
      where: { slug },
      data: {
        coverImageUrl: data.url,
        accentColor: data.color
      }
    });
    
    console.log(`   ✅ ${dept.nameAr}`);
    console.log(`      الصورة: ${data.description}`);
    console.log(`      المسار: ${data.url}`);
    console.log(`      اللون: ${data.color}`);
    console.log('');
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ تم تحديث صور الأقسام الأربعة بنجاح!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
