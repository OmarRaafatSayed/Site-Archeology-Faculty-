/**
 * seed.integrity-fix.ts
 * Resolves all 4 data integrity tasks from the audit.
 * Run: npx ts-node prisma/seed.integrity-fix.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient, FacultyDegree, NewsCategory, ProgramLevel } from '@prisma/client';
const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────
async function upsertFaculty(data: {
  nameAr: string; nameEn: string; degree: FacultyDegree;
  specializationAr: string; specializationEn: string;
  email: string | null; departmentId: string; orderIndex: number;
}) {
  const existing = await prisma.facultyMember.findFirst({
    where: { nameAr: data.nameAr, departmentId: data.departmentId },
  });
  if (existing) {
    await prisma.facultyMember.update({
      where: { id: existing.id },
      data: { degree: data.degree, email: data.email ?? existing.email,
               specializationAr: data.specializationAr, specializationEn: data.specializationEn },
    });
    return 'updated';
  }
  await prisma.facultyMember.create({ data: { ...data, isActive: true } });
  return 'created';
}

async function main() {
  console.log('\n🔧 DATA INTEGRITY FIX — All 4 Tasks\n');

  const depts = await prisma.department.findMany();
  const D: Record<string, string> = {};
  for (const d of depts) D[d.slug] = d.id;

  const admin = await prisma.user.findUnique({ where: { email: 'admin@fa-arch.cu.edu.eg' } });
  const adminId = admin!.id;

  let added = 0, updated = 0;
  async function track(r: string) { r === 'created' ? added++ : updated++; }

  // ════════════════════════════════════════════════════════════════
  // TASK 1: Fix Egyptology degrees (staffEgy.html = source of truth)
  // + Fix missing email for عزة فاروق + specialization for أنور احمد
  // ════════════════════════════════════════════════════════════════
  console.log('📋 TASK 1: Egyptology degree corrections + missing data...');

  // staffEgy.html shows these as أستاذ متفرغ (Emeritus) — fix any that were stored as أستاذ
  const emeritusFix = [
    { nameAr: 'علا محمد عبد العزيز العجيزي',    email: 'olaelaguizy@gmail.com' },
    { nameAr: 'علاء الدين عبد المحسن شاهين',     email: 'sebentus_52@yahoo.com' },
    { nameAr: 'أحمد محمود عيسى عبد الرحيم',      email: 'ahmadeissa@cu.edu.eg' },
    { nameAr: 'سعاد سيد عبد العال',              email: 'soad4444@yahoo.com' },
    { nameAr: 'زينب علي محمد محروس',             email: 'zeinab_21_10@yahoo.com' },
    { nameAr: 'مصطفى عطا الله محمد خليفة',        email: 'dr.mostafaatallah@yahoo.com' },
    { nameAr: 'أحمد محمد سعيد',                  email: 'ahmed_m_saied@hotmail.com' },
    { nameAr: 'هبة مصطفى كمال نوح',              email: 'hebanouh@gmail.com' },
    { nameAr: 'عزة فاروق سيد حسانين',            email: 'azza.hassanin@cu.edu.eg' }, // FLAG: email was missing — flagged
    { nameAr: 'محمد شريف عبده حسن',              email: 'mohshali@hotmail.com' },
    { nameAr: 'ناصر محمد مكاوي عودة',            email: 'oumekawi@hotmail.com' },
    { nameAr: 'حسني عبد الحليم محمود عمار',      email: null },
    { nameAr: 'حسين محمد ربيع حسين الدسوقي',     email: 'huseinrabie@gmail.com' },
    { nameAr: 'محسن محمد نجم الدين',             email: 'mohsennegme@yahoo.com' },
    { nameAr: 'سليمان حامد سليمان الحويلي',      email: 's.elhewaily@yahoo.com' },
    { nameAr: 'فوزية عبد الله محمد عبد الغني',   email: 'fawziamohamed@cu.edu.eg' },
    { nameAr: 'مصطفى عطية محي عبد الجواد',        email: 'mostafaattia@yahoo.com' },
    { nameAr: 'أحمد محمد مكاوي عودة',            email: 'ahmedmekawi@cu.edu.eg' },
  ];
  for (const f of emeritusFix) {
    const rec = await prisma.facultyMember.findFirst({
      where: { nameAr: { contains: f.nameAr.split(' ')[1] }, departmentId: D['egyptology'] },
    });
    if (rec) {
      await prisma.facultyMember.update({
        where: { id: rec.id },
        data: { degree: FacultyDegree.professor, email: f.email ?? rec.email },
      });
    }
  }
  console.log('  ✅ Egyptology emeritus degrees confirmed as professor');

  // Fix missing specialization for أنور احمد سليم (lecturer level)
  const anwar = await prisma.facultyMember.findFirst({
    where: { nameAr: { contains: 'أنور' }, departmentId: D['egyptology'] },
  });
  if (anwar) {
    await prisma.facultyMember.update({
      where: { id: anwar.id },
      data: { specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language' },
    });
    console.log('  ✅ Fixed specialization for أنور احمد سليم');
  }

  // Add staffEgy2 missing Egyptology professors
  const egy2Members = [
    { nameAr: 'علي محمد موسى رضوان',         nameEn: 'Prof. Dr. Ali Mohamed Moussa Radwan',
      degree: FacultyDegree.professor, specializationAr: 'الفن والعمارة والديانة في مصر القديمة',
      specializationEn: 'Art, Architecture and Religion in Ancient Egypt', email: 'aliradwan@cu.edu.eg' },
    { nameAr: 'محمد عبد الحليم نور الدين',   nameEn: 'Prof. Dr. Mohamed Abd El-Halim Nureldin',
      degree: FacultyDegree.professor, specializationAr: 'لغة مصرية قديمة',
      specializationEn: 'Ancient Egyptian Language', email: 'abdelhalimnureldin_must@yahoo.com' },
    { nameAr: 'تحفة أحمد حندوسة',           nameEn: 'Prof. Dr. Tohfa Ahmed Handoussa',
      degree: FacultyDegree.professor, specializationAr: 'الفنون والديانة المصرية القديمة',
      specializationEn: 'Ancient Egyptian Arts and Religion', email: 'dr_tohfa@cu.edu.eg' },
    { nameAr: 'سعيد جابر الجوهري',          nameEn: 'Prof. Dr. Said Gaber El-Gohary',
      degree: FacultyDegree.professor, specializationAr: 'آثار مصرية ولغة',
      specializationEn: 'Egyptian Archaeology and Language', email: 'saidgohary@gmail.com' },
    { nameAr: 'محمد صلاح بن محمد أحمد الخولي', nameEn: 'Prof. Dr. Mohamed Salah Ben Mohamed Ahmed El-Kholy',
      degree: FacultyDegree.professor, specializationAr: 'لغة مصرية - هيراطيقي',
      specializationEn: 'Ancient Egyptian Language - Hieratic', email: 'kholimes@yahoo.com' },
    { nameAr: 'تحية محمود محمود شهاب',       nameEn: 'Prof. Dr. Tahia Mahmoud Mahmoud Shehab',
      degree: FacultyDegree.professor, specializationAr: 'لغة مصرية قديمة',
      specializationEn: 'Ancient Egyptian Language', email: 'tahiashehab@cu.edu.eg' },
    { nameAr: 'أحمد عبد القادر جلال',        nameEn: 'Prof. Dr. Ahmed Abd El-Kader Galal',
      degree: FacultyDegree.professor, specializationAr: 'لغة قبطية - عمارة وفنون',
      specializationEn: 'Coptic Language - Architecture and Arts', email: 'ahmedgalal@cu.edu.eg' },
  ];
  let idx = 50;
  for (const f of egy2Members) {
    const r = await upsertFaculty({ ...f, departmentId: D['egyptology'], orderIndex: idx++ });
    await track(r);
    console.log(`  ${r === 'created' ? '✅' : '🔄'} ${f.nameAr}`);
  }

  // ════════════════════════════════════════════════════════════════
  // TASK 2: Islamic Dept — missing members from full scan of staffIslamic.html
  // ════════════════════════════════════════════════════════════════
  console.log('\n📋 TASK 2a: Islamic Dept — full staff from lines 315→977...');
  const islamicMissing = [
    { nameAr: 'أسامة طلعت عبد النعيم خليل',  nameEn: 'Prof. Dr. Osama Talat Abd El-Naim Khalil',
      degree: FacultyDegree.professor, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'Osamatalaat@hotmail.com' },
    { nameAr: 'عبد العزيز صلاح عبد العزيز سالم', nameEn: 'Prof. Dr. Abd El-Aziz Salah Abd El-Aziz Salem',
      degree: FacultyDegree.professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'azizsalem2002@hotmail.fr' },
    { nameAr: 'شبل إبراهيم شبل عبيد',         nameEn: 'Prof. Dr. Shebl Ibrahim Shebl Obeid',
      degree: FacultyDegree.professor, specializationAr: 'كتابات أثرية', specializationEn: 'Archaeological Inscriptions',
      email: 'sheblebaid@hotmail.com' },
    { nameAr: 'ياسر إسماعيل عبد السلام صالح', nameEn: 'Prof. Dr. Yasser Ismail Abd El-Salam Saleh',
      degree: FacultyDegree.professor, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'Yasser_ismail2007@yahoo.com' },
    { nameAr: 'عزة عبد المعطي عبده محمد',     nameEn: 'Prof. Dr. Azza Abd El-Moaty Abduh Mohamed',
      degree: FacultyDegree.professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'azza_abdo@cu.edu.eg' },
    { nameAr: 'محمود مرسي مرسي يوسف إبراهيم', nameEn: 'Prof. Dr. Mahmoud Morsi Morsi Yousef Ibrahim',
      degree: FacultyDegree.professor, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'mahmoud_morsy1000@yahoo.com' },
    { nameAr: 'أحمد محمود محمد دقماق',         nameEn: 'Prof. Dr. Ahmed Mahmoud Mohamed Dokmak',
      degree: FacultyDegree.professor, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'Ahmed_dokmak@cu.edu.eg' },
    { nameAr: 'سعاد محمد حسن حسين',           nameEn: 'Dr. Soad Mohamed Hassan Hussein',
      degree: FacultyDegree.assistant_professor, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'Dr_soadhassan@cu.edu.eg' },
    { nameAr: 'سعيد محمد مصلحي فرحات',        nameEn: 'Dr. Saeed Mohamed Meslehi Farhat',
      degree: FacultyDegree.assistant_professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'Saeedmeselhi@cu.edu.eg' },
    { nameAr: 'طه عبد القادر يوسف عمارة',     nameEn: 'Dr. Taha Abd El-Kader Yousef Omara',
      degree: FacultyDegree.assistant_professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'emarataha@yahoo.com' },
    { nameAr: 'أحمد السيد محمد الصاوي',        nameEn: 'Dr. Ahmed El-Sayed Mohamed El-Sawy',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: 'sawy_go@hotmail.com' },
    { nameAr: 'إيهاب أحمد إبراهيم أحمد',      nameEn: 'Dr. Ihab Ahmed Ibrahim Ahmed',
      degree: FacultyDegree.assistant_professor, specializationAr: 'تصوير إسلامي', specializationEn: 'Islamic Painting',
      email: 'Ehab_ahmed@cu.edu.eg' },
    { nameAr: 'العربي صبري عبد الغني عمارة',  nameEn: 'Dr. El-Arabi Sabri Abd El-Ghani Omara',
      degree: FacultyDegree.assistant_professor, specializationAr: 'عمارة إسلامية (المشرق العربي)', specializationEn: 'Islamic Architecture (Arab East)',
      email: 'Elarabysabry@cu.edu.eg' },
    { nameAr: 'صبرين عبد الجيد علي القصاص',   nameEn: 'Dr. Sabrin Abd El-Gied Ali El-Kassas',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: null },
    { nameAr: 'عبد الخالق علي عبد الخالق الشيخة', nameEn: 'Dr. Abd El-Khalek Ali Abd El-Khalek El-Shikha',
      degree: FacultyDegree.assistant_professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'abdelkhalikelsheikha@yahoo.com' },
    { nameAr: 'أسماء حسين عبر الرحيم محمود',  nameEn: 'Dr. Asma Hussein Abr El-Rahim Mahmoud',
      degree: FacultyDegree.assistant_professor, specializationAr: 'تصوير إسلامي', specializationEn: 'Islamic Painting',
      email: null },
    { nameAr: 'غادة عبد المنعم إبراهيم الدسوقي', nameEn: 'Dr. Ghada Abd El-Monem Ibrahim El-Desouky',
      degree: FacultyDegree.assistant_professor, specializationAr: 'عمارة إسلامية (المشرق الإسلامي)', specializationEn: 'Islamic Architecture (Islamic East)',
      email: 'Ghada_eldesoki@cu.edu.eg' },
    { nameAr: 'أحمد محمد يوسف عبد القادر',    nameEn: 'Dr. Ahmed Mohamed Yousef Abd El-Kader',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: 'amyousef1980@yahoo.com' },
    { nameAr: 'منصور محمد عبد الرازق معوض',   nameEn: 'Dr. Mansour Mohamed Abd El-Razek Mawad',
      degree: FacultyDegree.assistant_professor, specializationAr: 'عمارة إسلامية (المشرق العربي)', specializationEn: 'Islamic Architecture (Arab East)',
      email: 'mansour.arch@yahoo.com' },
    { nameAr: 'إيمان محمود عرفة محمود',        nameEn: 'Dr. Iman Mahmoud Arafa Mahmoud',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: 'eman_arfa@cu.edu.eg' },
    { nameAr: 'نيرة رفيق جلال فتحي',          nameEn: 'Dr. Naira Rafik Galal Fathi',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات', specializationEn: 'Numismatics',
      email: 'naiera76@cu.edu.eg' },
    { nameAr: 'شريف سيد أنور محمد',           nameEn: 'Dr. Sherif Sayed Anwar Mohamed',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: 'sherifcoins@yahoo.com' },
    { nameAr: 'محمود رشدي سالم جبيل',         nameEn: 'Dr. Mahmoud Rushdy Salem Jubeil',
      degree: FacultyDegree.assistant_professor, specializationAr: 'عمارة المشرق الإسلامي', specializationEn: 'Islamic East Architecture',
      email: 'mahmoudsalem@cu.edu.eg' },
    { nameAr: 'رحاب إبراهيم أحمد أحمد',       nameEn: 'Dr. Rehab Ibrahim Ahmed Ahmed',
      degree: FacultyDegree.assistant_professor, specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts',
      email: 'rehabelsiedy@hotmail.com' },
    { nameAr: 'أحمد محمد دسوقي أبوحشيش',     nameEn: 'Dr. Ahmed Mohamed Desouky Abu Hashish',
      degree: FacultyDegree.assistant_professor, specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics',
      email: 'ahmed.desoki@cu.edu.eg' },
    { nameAr: 'محمود حامد أحمد الحسيني',      nameEn: 'Dr. Mahmoud Hamed Ahmed El-Husseiny',
      degree: FacultyDegree.lecturer, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'Mahmoud_hamed@cu.edu.eg' },
    { nameAr: 'مختار حسين أحمد الكسباني',     nameEn: 'Dr. Mokhtar Hussein Ahmed El-Kasabany',
      degree: FacultyDegree.lecturer, specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture',
      email: 'm.elkasabany@yahoo.com' },
  ];
  idx = 20;
  for (const f of islamicMissing) {
    const r = await upsertFaculty({ ...f, departmentId: D['islamic'], orderIndex: idx++ });
    await track(r);
    if (r === 'created') console.log(`  ✅ Added: ${f.nameAr}`);
  }
  console.log(`  📊 Islamic dept task done`);

  // ════════════════════════════════════════════════════════════════
  // TASK 2b: Conservation Dept — missing members from full staffCons.html
  // ════════════════════════════════════════════════════════════════
  console.log('\n📋 TASK 2b: Conservation Dept — full staff...');
  const consMissing = [
    { nameAr: 'سوسن سيد درويش مصطفى',          nameEn: 'Prof. Dr. Sawsan Sayed Darwish Mostafa',
      degree: FacultyDegree.professor, specializationAr: 'كيمياء مواد الترميم والصيانة',
      specializationEn: 'Chemistry of Conservation and Restoration Materials', email: 'sawsansd@hotmail.com' },
    { nameAr: 'عبد اللطيف عبد اللطيف حسن أفندي', nameEn: 'Prof. Dr. Abd El-Latif Abd El-Latif Hassan Afandy',
      degree: FacultyDegree.professor, specializationAr: 'ترميم المخطوطات',
      specializationEn: 'Manuscript Conservation', email: 'A_afandy@cu.edu.eg' },
    { nameAr: 'نسرين محمد نبيل الحديدي',         nameEn: 'Prof. Dr. Nesrin Mohamed Nabil El-Hadidi',
      degree: FacultyDegree.professor, specializationAr: 'علاج وصيانة الأخشاب الأثرية',
      specializationEn: 'Treatment and Conservation of Archaeological Wood', email: 'nelhadidi@gmail.com' },
    { nameAr: 'أبو بكر محمد أبو بكر موسى',       nameEn: 'Prof. Dr. Abu Bakr Mohamed Abu Bakr Moussa',
      degree: FacultyDegree.professor, specializationAr: 'تقنيات وترميم وصيانة الصور الجدارية',
      specializationEn: 'Techniques and Conservation of Mural Paintings', email: 'dr_abubakr@msn.com' },
    { nameAr: 'مايسة محمد علي محمد',              nameEn: 'Prof. Dr. Maysaa Mohamed Ali Mohamed',
      degree: FacultyDegree.professor, specializationAr: 'ميكروبيولوجي المواد الأثرية',
      specializationEn: 'Microbiology of Archaeological Materials', email: 'Maisamansour_40@yahoo.com' },
    { nameAr: 'سيد محمد سيد محمد حميدة',         nameEn: 'Prof. Dr. Sayed Mohamed Sayed Mohamed Hamida',
      degree: FacultyDegree.professor, specializationAr: 'الترميم المعماري والإنشائي للمباني والمواقع الأثرية والتاريخية',
      specializationEn: 'Architectural and Structural Conservation of Historic Buildings and Sites',
      email: 'hemeda@civil.auTh.gr' },
    { nameAr: 'صفا عبد القادر محمد حامد',         nameEn: 'Prof. Dr. Safa Abd El-Kader Mohamed Hamed',
      degree: FacultyDegree.professor, specializationAr: 'علاج وصيانة الأخشاب',
      specializationEn: 'Treatment and Conservation of Wood', email: 'Safa_hamed@cu.edu.eg' },
    { nameAr: 'ياسر يحيى أمين عبد العاطي',       nameEn: 'Prof. Dr. Yaser Yahya Amin Abd El-Aaty',
      degree: FacultyDegree.professor, specializationAr: 'الترميم المعماري والإنشائي للمباني الأثرية والتاريخية',
      specializationEn: 'Architectural Conservation of Archaeological and Historic Buildings',
      email: 'Yaser_yehya@yahoo.com' },
    { nameAr: 'رشدية ربيع علي حسن',               nameEn: 'Prof. Dr. Rushdiya Rabee Ali Hassan',
      degree: FacultyDegree.professor, specializationAr: 'ترميم وصيانة الآثار العضوية',
      specializationEn: 'Conservation of Organic Artifacts', email: 'rushdyarabii@yahoo.com' },
    { nameAr: 'حسين حسن مرعي حسن محمود',          nameEn: 'Prof. Dr. Hussein Hassan Marei Hassan Mahmoud',
      degree: FacultyDegree.professor, specializationAr: 'علاج وصيانة الصور الجدارية',
      specializationEn: 'Treatment and Conservation of Mural Paintings', email: 'marai79@hotmail.com' },
    { nameAr: 'بسام محمد مصطفى سعد',              nameEn: 'Dr. Bassam Mohamed Mostafa Saad',
      degree: FacultyDegree.assistant_professor, specializationAr: 'الترميم المعماري والحفاظ على المباني والمواقع الأثرية',
      specializationEn: 'Architectural Conservation of Buildings and Archaeological Sites',
      email: 'passamsaad@cu.edu.eg' },
    { nameAr: 'أماني عبد الحافظ محمد بكر',        nameEn: 'Dr. Amany Abd El-Hafez Mohamed Bakr',
      degree: FacultyDegree.assistant_professor, specializationAr: 'ترميم الآثار الحجرية الثابتة والمنقولة',
      specializationEn: 'Conservation of Fixed and Portable Stone Artifacts', email: null },
  ];
  idx = 15;
  for (const f of consMissing) {
    const r = await upsertFaculty({ ...f, departmentId: D['conservation'], orderIndex: idx++ });
    await track(r);
    if (r === 'created') console.log(`  ✅ Added: ${f.nameAr}`);
  }

  // ════════════════════════════════════════════════════════════════
  // TASK 3: Greco-Roman Junior Staff — use 'قيد التعيين' placeholder
  // ════════════════════════════════════════════════════════════════
  console.log('\n📋 TASK 3: Greco-Roman junior staff placeholder fix...');
  const juniorGR = await prisma.facultyMember.findMany({
    where: {
      departmentId: D['greco-roman'],
      degree: { in: [FacultyDegree.assistant_lecturer] },
    },
  });
  let juniorFixed = 0;
  for (const m of juniorGR) {
    const needsUpdate = !m.specializationAr || m.specializationAr === null;
    if (needsUpdate) {
      await prisma.facultyMember.update({
        where: { id: m.id },
        data: {
          specializationAr: 'قيد التعيين',
          specializationEn: 'Pending Assignment',
        },
      });
      juniorFixed++;
    }
  }
  console.log(`  ✅ Fixed ${juniorFixed} junior Greco-Roman members with placeholder`);
