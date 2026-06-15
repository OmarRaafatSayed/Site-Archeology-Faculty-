import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // =====================
  // 1. الأقسام الأربعة
  // =====================
  console.log('📚 Seeding departments...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { slug: 'egyptology' },
      update: {},
      create: {
        slug: 'egyptology',
        nameAr: 'قسم الآثار المصرية',
        nameEn: 'Department of Egyptology',
        descriptionAr:
          'يُعنى القسم بدراسة الحضارة المصرية القديمة من عصر ما قبل التاريخ حتى نهاية العصر الفرعوني، ويشمل الدراسة اللغوية والأثرية والتاريخية.',
        descriptionEn:
          'The department studies ancient Egyptian civilization from prehistoric times to the end of the Pharaonic era, covering linguistic, archaeological, and historical aspects.',
        accentColor: '#C9A84C',
        coverImageUrl: '/images/depts/egyptology.jpg',
        orderIndex: 1,
      },
    }),

    prisma.department.upsert({
      where: { slug: 'islamic' },
      update: {},
      create: {
        slug: 'islamic',
        nameAr: 'قسم الآثار الإسلامية',
        nameEn: 'Department of Islamic Archaeology',
        descriptionAr:
          'يتخصص القسم في دراسة الآثار والفنون الإسلامية منذ صدر الإسلام حتى العصر الحديث، ويشمل العمارة والفنون الزخرفية والمسكوكات.',
        descriptionEn:
          'The department specializes in the study of Islamic antiquities and arts from the dawn of Islam to the modern era, including architecture, decorative arts, and numismatics.',
        accentColor: '#4A7C59',
        coverImageUrl: '/images/depts/islamic.jpg',
        orderIndex: 2,
      },
    }),

    prisma.department.upsert({
      where: { slug: 'conservation' },
      update: {},
      create: {
        slug: 'conservation',
        nameAr: 'قسم ترميم الآثار',
        nameEn: 'Department of Conservation',
        descriptionAr:
          'يُقدّم القسم تعليماً متخصصاً في علوم ترميم وصون الآثار والتراث الثقافي، مع التركيز على الأساليب العلمية الحديثة في الحفاظ على الموروث الحضاري.',
        descriptionEn:
          'The department provides specialized education in the conservation and preservation of antiquities and cultural heritage, focusing on modern scientific methods.',
        accentColor: '#8B6914',
        coverImageUrl: '/images/depts/conservation.jpg',
        orderIndex: 3,
      },
    }),

    prisma.department.upsert({
      where: { slug: 'greco-roman' },
      update: {},
      create: {
        slug: 'greco-roman',
        nameAr: 'قسم الآثار اليونانية الرومانية',
        nameEn: 'Department of Greco-Roman Archaeology',
        descriptionAr:
          'يتناول القسم دراسة الحضارتين اليونانية والرومانية في مصر وحوض البحر المتوسط، ويشمل الفنون والعمارة والكتابات واللقى الأثرية.',
        descriptionEn:
          'The department covers the study of Greek and Roman civilizations in Egypt and the Mediterranean basin, including arts, architecture, inscriptions, and archaeological finds.',
        accentColor: '#2C5282',
        coverImageUrl: '/images/depts/greco-roman.jpg',
        orderIndex: 4,
      },
    }),
  ]);

  console.log(`✅ Seeded ${departments.length} departments`);

  // =====================
  // 2. مستخدم Admin افتراضي
  // =====================
  console.log('👤 Seeding default admin user...');

  const adminPassword = await bcrypt.hash('Admin@123456', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fa-arch.cu.edu.eg' },
    update: {},
    create: {
      email: 'admin@fa-arch.cu.edu.eg',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });

  console.log(`✅ Admin user: ${adminUser.email}`);
  console.log(`   ⚠️  Default password: Admin@123456 — يجب تغييره فور الدخول!`);

  // =====================
  // 3. الصفحات الثابتة الأساسية
  // =====================
  console.log('📄 Seeding static pages...');

  const staticPages = [
    {
      slug: 'about-history',
      titleAr: 'تاريخ الكلية',
      titleEn: 'Faculty History',
      contentAr: 'محتوى تاريخ الكلية — يُحدَّث من لوحة التحكم',
      contentEn: 'Faculty history content — to be updated from CMS',
    },
    {
      slug: 'about-mission',
      titleAr: 'رسالة الكلية',
      titleEn: 'Mission Statement',
      contentAr: 'محتوى رسالة الكلية — يُحدَّث من لوحة التحكم',
      contentEn: 'Mission statement content — to be updated from CMS',
    },
    {
      slug: 'about-vision',
      titleAr: 'رؤية الكلية',
      titleEn: 'Vision',
      contentAr: 'محتوى رؤية الكلية — يُحدَّث من لوحة التحكم',
      contentEn: 'Vision content — to be updated from CMS',
    },
    {
      slug: 'about-leadership',
      titleAr: 'قيادة الكلية',
      titleEn: 'Faculty Leadership',
      contentAr: 'قائمة قيادات الكلية — يُحدَّث من لوحة التحكم',
      contentEn: 'Faculty leadership — to be updated from CMS',
    },
    {
      slug: 'contact',
      titleAr: 'اتصل بنا',
      titleEn: 'Contact Us',
      contentAr: 'كلية الآثار — جامعة القاهرة\nالجيزة، مصر',
      contentEn: 'Faculty of Archaeology — Cairo University\nGiza, Egypt',
    },
  ];

  for (const page of staticPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log(`✅ Seeded ${staticPages.length} static pages`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Departments: 4 (egyptology, islamic, conservation, greco-roman)');
  console.log('Admin user:  admin@fa-arch.cu.edu.eg / Admin@123456');
  console.log('Pages:       5 static pages');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
