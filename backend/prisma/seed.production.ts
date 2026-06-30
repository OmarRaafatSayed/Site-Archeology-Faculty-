/**
 * seed.production.ts — Phase 10: Production First-Run Seed
 * =========================================================
 * يُشغَّل مرة واحدة فقط على السيرفر الإنتاجي بعد migrate deploy.
 * يُنشئ:
 *   - حساب Admin أول بكلمة مرور مؤقتة (يجب تغييرها فوراً)
 *   - الأقسام الأربعة (إذا لم تكن موجودة)
 *   - الصفحات الثابتة الأساسية
 *
 * الاستخدام:
 *   docker compose -f docker-compose.prod.yml run --rm backend \
 *     npx ts-node prisma/seed.production.ts
 *
 * ⚠️  يجب تغيير كلمة مرور Admin فور انتهاء الـ seed!
 */

import { PrismaClient, UserRole, ProgramLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── توليد كلمة مرور مؤقتة آمنة ──────────────────────────
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let pwd = '';
  for (let i = 0; i < 16; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  // ضمان تلبية متطلبات الـ password policy
  return 'Arch@' + pwd + '1';
}

async function main() {
  console.log('\n🌱  Production Seed — Faculty of Archaeology\n');

  // ─── 1. Admin Account ─────────────────────────────────────────────────────
  const TEMP_PASSWORD = generateTempPassword();
  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 14); // أقوى من dev (14 rounds)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fa-arch.cu.edu.eg' },
    update: {},  // لا تعدّل إذا كان موجوداً
    create: {
      email: 'admin@fa-arch.cu.edu.eg',
      username: 'sysadmin',
      passwordHash,
      role: UserRole.admin,
      isActive: true,
    },
  });

  const isNew = admin.createdAt.getTime() > Date.now() - 5000;
  if (isNew) {
    console.log('✅  Admin account created:');
    console.log('    Email    :', admin.email);
    console.log('    Password :', TEMP_PASSWORD);
    console.log('\n    ⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!\n');
  } else {
    console.log('ℹ️   Admin account already exists — skipped');
  }

  // ─── 2. Content Manager Account ───────────────────────────────────────────
  const CM_TEMP = generateTempPassword();
  const cmHash = await bcrypt.hash(CM_TEMP, 14);

  const cm = await prisma.user.upsert({
    where: { email: 'content@fa-arch.cu.edu.eg' },
    update: {},
    create: {
      email: 'content@fa-arch.cu.edu.eg',
      username: 'content_manager',
      passwordHash: cmHash,
      role: UserRole.content_manager,
      isActive: true,
    },
  });

  const cmIsNew = cm.createdAt.getTime() > Date.now() - 5000;
  if (cmIsNew) {
    console.log('✅  Content Manager account created:');
    console.log('    Email    :', cm.email);
    console.log('    Password :', CM_TEMP);
    console.log('\n    ⚠️  Change this password immediately!\n');
  }

  // ─── 3. الأقسام الأربعة ───────────────────────────────────────────────────
  const departments = [
    {
      slug: 'egyptology',
      nameAr: 'قسم الآثار المصرية',
      nameEn: 'Department of Egyptology',
      descriptionAr: 'يُعدّ قسم الآثار المصرية من أعرق الأقسام في كلية الآثار، ويهتم بدراسة الحضارة المصرية القديمة من عصور ما قبل التاريخ حتى نهاية الحقبة الفرعونية.',
      descriptionEn: 'The Department of Egyptology is dedicated to the study of ancient Egyptian civilization from prehistoric times through the Pharaonic era.',
      accentColor: '#C9A84C',
      orderIndex: 1,
    },
    {
      slug: 'islamic',
      nameAr: 'قسم الآثار الإسلامية',
      nameEn: 'Department of Islamic Archaeology',
      descriptionAr: 'يختص قسم الآثار الإسلامية بدراسة الحضارة الإسلامية من خلال آثارها المادية، من الفتح الإسلامي لمصر حتى العصر الحديث.',
      descriptionEn: 'The Department of Islamic Archaeology specializes in studying Islamic civilization through its material remains.',
      accentColor: '#4A7C59',
      orderIndex: 2,
    },
    {
      slug: 'conservation',
      nameAr: 'قسم الترميم',
      nameEn: 'Department of Conservation',
      descriptionAr: 'يهتم قسم الترميم بصون وحماية التراث الأثري المصري، ويدرس أساليب الترميم والحفظ العلمية الحديثة.',
      descriptionEn: 'The Department of Conservation focuses on preserving Egyptian archaeological heritage using modern scientific conservation methods.',
      accentColor: '#8B5E3C',
      orderIndex: 3,
    },
    {
      slug: 'greco-roman',
      nameAr: 'قسم الآثار اليونانية والرومانية',
      nameEn: 'Department of Greco-Roman Archaeology',
      descriptionAr: 'يُعنى قسم الآثار اليونانية والرومانية بدراسة الحضارتين اليونانية والرومانية في مصر وأثرهما على الحضارة المصرية.',
      descriptionEn: 'The Department of Greco-Roman Archaeology studies Greek and Roman civilizations in Egypt and their influence on Egyptian culture.',
      accentColor: '#5B7FA6',
      orderIndex: 4,
    },
  ];

  let deptCount = 0;
  for (const dept of departments) {
    const result = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {},
      create: dept,
    });
    deptCount++;
    console.log(`✅  Department: ${result.nameAr} (${result.slug})`);
  }

  // ─── 4. البرامج الدراسية الأساسية ─────────────────────────────────────────
  const egyptologyDept = await prisma.department.findUnique({ where: { slug: 'egyptology' } });

  if (egyptologyDept) {
    await prisma.program.upsert({
      where: { id: 'prog-egyptology-undergrad-001' },
      update: {},
      create: {
        id: 'prog-egyptology-undergrad-001',
        departmentId: egyptologyDept.id,
        nameAr: 'بكالوريوس الآثار المصرية',
        nameEn: 'B.Sc. in Egyptology',
        level: ProgramLevel.undergraduate,
        creditHours: 140,
        durationYears: 4,
        isActive: true,
      },
    }).catch(() => null); // تجاهل لو ID موجود
  }

  // ─── 5. الصفحات الثابتة ───────────────────────────────────────────────────
  const pages = [
    {
      slug: 'about-history',
      titleAr: 'تاريخ الكلية',
      titleEn: 'Faculty History',
      contentAr: 'تأسست كلية الآثار بجامعة القاهرة عام 1952 لتكون أول كلية متخصصة في دراسة الآثار في العالم العربي. خرّجت الكلية على مدار عقود طويلة أجيالاً من علماء الآثار الذين أسهموا في الكشف عن كنوز الحضارة المصرية وصونها.',
      contentEn: 'The Faculty of Archaeology at Cairo University was established in 1952 to become the first specialized faculty in archaeology in the Arab world.',
      metaDescriptionAr: 'تاريخ كلية الآثار بجامعة القاهرة منذ التأسيس عام ١٩٥٢',
      metaDescriptionEn: 'History of the Faculty of Archaeology at Cairo University since 1952',
    },
    {
      slug: 'about-mission',
      titleAr: 'رسالة الكلية',
      titleEn: 'Faculty Mission',
      contentAr: 'تسعى كلية الآثار إلى إعداد كوادر علمية متخصصة في دراسة الآثار والحضارات، قادرة على المساهمة في خدمة المجتمع وحفظ التراث الإنساني، من خلال تقديم برامج تعليمية وبحثية متميزة.',
      contentEn: 'The Faculty of Archaeology strives to prepare specialized scientific cadres in the study of antiquities and civilizations.',
      metaDescriptionAr: 'رسالة كلية الآثار بجامعة القاهرة',
      metaDescriptionEn: 'Mission of the Faculty of Archaeology at Cairo University',
    },
    {
      slug: 'about-vision',
      titleAr: 'رؤية الكلية',
      titleEn: 'Faculty Vision',
      contentAr: 'أن تكون كلية الآثار مركزاً علمياً رائداً على المستوى الإقليمي والدولي في مجال الدراسات الأثرية والحضارية، ومرجعاً موثوقاً في صون الموروث الثقافي الإنساني.',
      contentEn: 'To be a leading scientific center at the regional and international level in the field of archaeological and civilizational studies.',
      metaDescriptionAr: 'رؤية كلية الآثار بجامعة القاهرة',
      metaDescriptionEn: 'Vision of the Faculty of Archaeology at Cairo University',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
    console.log(`✅  Page: ${page.slug}`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('  Production Seed Complete');
  console.log('══════════════════════════════════════════');
  console.log(`  Departments : ${deptCount}`);
  console.log(`  Pages       : ${pages.length}`);
  console.log('\n  🔐 IMPORTANT:');
  console.log('  1. Change admin password immediately');
  console.log('  2. Change content manager password');
  console.log('  3. Configure SMTP for email notifications');
  console.log('  4. Run performance indexes:');
  console.log('     psql -U $POSTGRES_USER -d $POSTGRES_DB \\');
  console.log('       -f prisma/migrations/full_text_search_indexes.sql');
  console.log('     psql -U $POSTGRES_USER -d $POSTGRES_DB \\');
  console.log('       -f prisma/migrations/performance_indexes.sql');
  console.log('══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
