import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// صور عالية الجودة من Unsplash (مجانية ١٠٠٪)
const DEPARTMENT_IMAGES = {
  'egyptology': {
    url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1920&h=500&fit=crop',
    description: 'Great Sphinx and Pyramids of Giza - أهرامات الجيزة وأبو الهول',
    color: '#D4AF37' // ذهبي
  },
  'islamic': {
    url: 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=1920&h=500&fit=crop',
    description: 'Islamic Architecture - العمارة الإسلامية',
    color: '#0C4A6E' // أزرق داكن
  },
  'conservation': {
    url: 'https://images.unsplash.com/photo-1578926078151-6c4838e20b43?w=1920&h=500&fit=crop',
    description: 'Art Restoration Work - عمل الترميم',
    color: '#92400E' // بني
  },
  'greco-roman': {
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=500&fit=crop',
    description: 'Roman Columns - الأعمدة الرومانية',
    color: '#7C2D12' // رمادي حجري
  }
};

async function main() {
  console.log('\n🎨 إضافة صور cover للأقسام\n');
  console.log('═'.repeat(70) + '\n');
  
  for (const [slug, data] of Object.entries(DEPARTMENT_IMAGES)) {
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
    console.log(`      اللون: ${data.color}`);
    console.log(`      URL: ${data.url.substring(0, 60)}...`);
    console.log('');
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ تم إضافة الصور بنجاح!\n');
  
  console.log('📝 ملحوظة:');
  console.log('   الصور دي من Unsplash - عالية الجودة ومجانية');
  console.log('   لو عايز تغير الصورة، روح على:');
  console.log('   https://unsplash.com وابحث عن الصورة اللي تعجبك\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
