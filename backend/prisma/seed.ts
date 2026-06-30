import { PrismaClient, UserRole, FacultyDegree, ProgramLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── 1. Admin User ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@12345', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fa-arch.cu.edu.eg' },
    update: {},
    create: {
      email: 'admin@fa-arch.cu.edu.eg',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.admin,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── 2. الأقسام الأربعة (من FRD + SRS) ──────────────────────────────────
  const departmentsData = [
    {
      slug: 'egyptology',
      nameAr: 'قسم الآثار المصرية',
      nameEn: 'Department of Egyptology',
      descriptionAr:
        'يُعدّ قسم الآثار المصرية من أعرق الأقسام في كلية الآثار، ويهتم بدراسة الحضارة المصرية القديمة من عصور ما قبل التاريخ حتى نهاية الحقبة الفرعونية، شاملاً اللغة الهيروغليفية والآثار والفنون والعمارة.',
      descriptionEn:
        'The Department of Egyptology is one of the most prestigious departments in the Faculty, dedicated to the study of ancient Egyptian civilization from prehistoric times through the Pharaonic era, encompassing hieroglyphics, artifacts, arts, and architecture.',
      accentColor: '#C9A84C',
      coverImageUrl: '/images/depts/egyptology.jpg',
      orderIndex: 1,
    },
    {
      slug: 'islamic',
      nameAr: 'قسم الآثار الإسلامية',
      nameEn: 'Department of Islamic Archaeology',
      descriptionAr:
        'يختص قسم الآثار الإسلامية بدراسة الحضارة الإسلامية من خلال آثارها المادية، من الفتح الإسلامي لمصر حتى العصر الحديث، ويشمل العمارة والفنون والنقوش والزخارف الإسلامية.',
      descriptionEn:
        'The Department of Islamic Archaeology specializes in studying Islamic civilization through its material remains, from the Islamic conquest of Egypt to the modern era, encompassing architecture, arts, inscriptions, and Islamic decorations.',
      accentColor: '#4A7C59',
      coverImageUrl: '/images/depts/islamic.jpg',
      orderIndex: 2,
    },
    {
      slug: 'conservation',
      nameAr: 'قسم ترميم الآثار',
      nameEn: 'Department of Conservation',
      descriptionAr:
        'يُركز قسم ترميم الآثار على العلوم التطبيقية لصون التراث الثقافي المادي وترميمه، من خلال دراسة طبيعة المواد الأثرية وأساليب الحفاظ عليها وعلاجها من التدهور والتلف.',
      descriptionEn:
        'The Department of Conservation focuses on applied sciences for preserving and restoring cultural heritage, through studying the nature of archaeological materials and methods for their preservation and treatment against deterioration.',
      accentColor: '#8B6914',
      coverImageUrl: '/images/depts/conservation.jpg',
      orderIndex: 3,
    },
    {
      slug: 'greco-roman',
      nameAr: 'قسم الآثار اليونانية الرومانية',
      nameEn: 'Department of Greco-Roman Archaeology',
      descriptionAr:
        'يُعنى قسم الآثار اليونانية الرومانية بدراسة الحضارتين اليونانية والرومانية في مصر، من فتح الإسكندر الأكبر حتى الفتح الإسلامي، شاملاً الفنون والعمارة واللغة اليونانية والآثار البطلمية والرومانية.',
      descriptionEn:
        'The Department of Greco-Roman Archaeology studies the Greek and Roman civilizations in Egypt, from Alexander the Great\'s conquest until the Islamic conquest, encompassing arts, architecture, Greek language, and Ptolemaic and Roman artifacts.',
      accentColor: '#2C5282',
      coverImageUrl: '/images/depts/greco-roman.jpg',
      orderIndex: 4,
    },
  ];

  const departments: Record<string, string> = {};

  for (const deptData of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { slug: deptData.slug },
      update: {
        accentColor: deptData.accentColor,
        coverImageUrl: deptData.coverImageUrl,
        descriptionAr: deptData.descriptionAr,
        descriptionEn: deptData.descriptionEn,
      },
      create: deptData,
    });
    departments[deptData.slug] = dept.id;
    console.log(`✅ Department: ${dept.nameAr}`);
  }

  // ─── 3. برامج دراسية تجريبية لكل قسم ────────────────────────────────────
  const programsData = [
    // آثار مصرية
    {
      departmentId: departments['egyptology'],
      nameAr: 'بكالوريوس الآثار المصرية',
      nameEn: 'Bachelor of Egyptology',
      level: ProgramLevel.undergraduate,
      creditHours: 144,
      durationYears: 4,
    },
    {
      departmentId: departments['egyptology'],
      nameAr: 'ماجستير الآثار المصرية',
      nameEn: 'Master of Egyptology',
      level: ProgramLevel.masters,
      creditHours: 36,
      durationYears: 2,
    },
    // آثار إسلامية
    {
      departmentId: departments['islamic'],
      nameAr: 'بكالوريوس الآثار الإسلامية',
      nameEn: 'Bachelor of Islamic Archaeology',
      level: ProgramLevel.undergraduate,
      creditHours: 144,
      durationYears: 4,
    },
    // ترميم
    {
      departmentId: departments['conservation'],
      nameAr: 'بكالوريوس ترميم الآثار',
      nameEn: 'Bachelor of Conservation',
      level: ProgramLevel.undergraduate,
      creditHours: 144,
      durationYears: 4,
    },
    // يونانية رومانية
    {
      departmentId: departments['greco-roman'],
      nameAr: 'بكالوريوس الآثار اليونانية الرومانية',
      nameEn: 'Bachelor of Greco-Roman Archaeology',
      level: ProgramLevel.undergraduate,
      creditHours: 144,
      durationYears: 4,
    },
  ];

  for (const prog of programsData) {
    const existing = await prisma.program.findFirst({
      where: { departmentId: prog.departmentId, nameAr: prog.nameAr },
    });

    if (!existing) {
      await prisma.program.create({ data: prog });
      console.log(`✅ Program: ${prog.nameAr}`);
    }
  }

  // ─── 4. عضو تدريس تجريبي (عميد الكلية) ──────────────────────────────────
  const deanUser = await prisma.user.upsert({
    where: { email: 'dean@fa-arch.cu.edu.eg' },
    update: {},
    create: {
      email: 'dean@fa-arch.cu.edu.eg',
      passwordHash: await bcrypt.hash('Dean@12345', 12),
      role: UserRole.faculty,
    },
  });

  await prisma.facultyMember.upsert({
    where: { userId: deanUser.id },
    update: {},
    create: {
      userId: deanUser.id,
      departmentId: departments['egyptology'],
      nameAr: 'أ.د. عميد الكلية',
      nameEn: 'Prof. Dr. Faculty Dean',
      degree: FacultyDegree.professor,
      specializationAr: 'الآثار المصرية القديمة',
      specializationEn: 'Ancient Egyptian Archaeology',
      email: 'dean@fa-arch.cu.edu.eg',
      adminRole: 'عميد الكلية',
      orderIndex: 0,
    },
  });
  console.log('✅ Dean faculty member created');

  // ─── 5. صفحات ثابتة أساسية ───────────────────────────────────────────────
  const staticPages = [
    {
      slug: 'about-history',
      titleAr: 'تاريخ الكلية',
      titleEn: 'Faculty History',
      contentAr: 'تأسست كلية الآثار بجامعة القاهرة بشكلها الحالي ككلية مستقلة في عام 1970، لتكون أول كلية متخصصة في دراسة الآثار في العالم العربي.',
      contentEn: 'The Faculty of Archaeology at Cairo University was established in its current form as an independent faculty in 1970, becoming the first specialized faculty in archaeology in the Arab world.',
    },
    {
      slug: 'about-mission',
      titleAr: 'رسالة الكلية',
      titleEn: "Faculty Mission",
      contentAr: 'إعداد كوادر علمية وأكاديمية متخصصة في مجالات الآثار وترميمها والحفاظ على التراث الحضاري.',
      contentEn: 'Preparing specialized scientific and academic cadres in the fields of archaeology, conservation, and cultural heritage preservation.',
    },
    {
      slug: 'about-vision',
      titleAr: 'رؤية الكلية',
      titleEn: "Faculty Vision",
      contentAr: 'أن تكون كلية الآثار مرجعاً أكاديمياً رائداً إقليمياً ودولياً في مجالات الدراسات الأثرية.',
      contentEn: 'To be a leading regional and international academic reference in the fields of archaeological studies.',
    },
  ];

  for (const page of staticPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { contentAr: page.contentAr, contentEn: page.contentEn },
      create: page,
    });
    console.log(`✅ Page: ${page.slug}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin: admin@fa-arch.cu.edu.eg / Admin@12345');
  console.log('📧 Dean:  dean@fa-arch.cu.edu.eg  / Dean@12345');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
