/**
 * audit-data.ts — Full Data Accuracy Audit
 * Compares legacy HTML source data vs. DB and reports every gap/error.
 * Run: npx ts-node scripts/audit-data.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient, FacultyDegree } from '@prisma/client';
const prisma = new PrismaClient();

let issues = 0;
function FAIL(msg: string) { issues++; console.log(`  ❌ MISSING/WRONG : ${msg}`); }
function OK(msg: string)   { console.log(`  ✅ OK             : ${msg}`); }
function WARN(msg: string) { console.log(`  ⚠️  WARN           : ${msg}`); }
function SECTION(title: string) { console.log(`\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`); }

async function main() {
  console.log('\n🔍 FULL DATA ACCURACY AUDIT\n');

  // ── SECTION 1: STATIC PAGES ─────────────────────────────────────────────
  SECTION('1. STATIC PAGES');
  const requiredPages = [
    { slug: 'about-history',      keyAr: 'تأسست', keyEn: '1970' },
    { slug: 'about-mission',      keyAr: 'التميز', keyEn: 'excellence' },
    { slug: 'about-vision',       keyAr: 'رؤية', keyEn: 'leading' },
    { slug: 'about-faculty',      keyAr: '1970', keyEn: 'Archaeology' },
    { slug: 'contact-info',       keyAr: 'fa_archo@cu.edu.eg', keyEn: 'fa_archo' },
    { slug: 'museum-info',        keyAr: '3500', keyEn: '3,500' },
    { slug: 'conservation-center',keyAr: '1996', keyEn: '1996' },
    { slug: 'excavations',        keyAr: 'سقارة', keyEn: 'Saqqara' },
    // MISSING pages that exist in legacy but not migrated yet:
    { slug: 'dean-statement',     keyAr: 'عميد', keyEn: 'Dean' },
    { slug: 'formal-deans',       keyAr: 'العمداء السابقون', keyEn: 'Former Deans' },
    { slug: 'top-management',     keyAr: 'القيادة', keyEn: 'Management' },
    { slug: 'postgraduate-programs', keyAr: 'دبلوما', keyEn: 'diploma' },
  ];

  for (const p of requiredPages) {
    const page = await prisma.page.findUnique({ where: { slug: p.slug } });
    if (!page) {
      FAIL(`Page slug="${p.slug}" NOT IN DATABASE`);
    } else {
      const hasAr = page.contentAr?.includes(p.keyAr) ?? false;
      if (!hasAr) FAIL(`Page "${p.slug}" contentAr missing key: "${p.keyAr}"`);
      else OK(`Page "${p.slug}" content verified`);
    }
  }

  // ── SECTION 2: DEPARTMENTS ──────────────────────────────────────────────
  SECTION('2. DEPARTMENTS');
  const requiredDepts = [
    { slug: 'egyptology',    nameAr: 'قسم الآثار المصرية',            nameEn: 'Department of Egyptology' },
    { slug: 'islamic',       nameAr: 'قسم الآثار الإسلامية',          nameEn: 'Department of Islamic Archaeology' },
    { slug: 'conservation',  nameAr: 'قسم ترميم الآثار',              nameEn: 'Department of Conservation' },
    { slug: 'greco-roman',   nameAr: 'قسم الآثار اليونانية الرومانية', nameEn: 'Department of Greco-Roman Archaeology' },
  ];
  const depts = await prisma.department.findMany();
  const deptMap: Record<string, string> = {};
  for (const d of depts) deptMap[d.slug] = d.id;

  for (const req of requiredDepts) {
    const d = depts.find(x => x.slug === req.slug);
    if (!d) { FAIL(`Department "${req.slug}" NOT IN DATABASE`); continue; }
    if (!d.nameAr.includes(req.nameAr.slice(0, 10))) FAIL(`Dept "${req.slug}" nameAr wrong: "${d.nameAr}"`);
    else OK(`Dept "${req.slug}" — ${d.nameAr}`);
    if (!d.descriptionAr || d.descriptionAr.length < 50) FAIL(`Dept "${req.slug}" descriptionAr too short or missing`);
    if (!d.descriptionEn || d.descriptionEn.length < 50) FAIL(`Dept "${req.slug}" descriptionEn too short or missing`);
    if (!d.accentColor) FAIL(`Dept "${req.slug}" accentColor missing`);
  }

  // ── SECTION 3: FACULTY MEMBERS ──────────────────────────────────────────
  SECTION('3. FACULTY MEMBERS');
  // From legacy HTML — exact names that MUST be in DB
  const requiredFaculty = [
    // Egyptology — from staffEgy.html + staffEgy2.html
    { nameAr: 'علا محمد عبد العزيز العجيزي',         dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'علاء الدين عبد المحسن شاهين',          dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'أحمد محمود عيسى عبد الرحيم',           dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'سعاد سيد عبد العال',                   dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'زينب علي محمد محروس',                  dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'مصطفى عطا الله محمد خليفة',             dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'أحمد محمد سعيد',                       dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'هبة مصطفى كمال نوح',                   dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'عزة فاروق سيد حسانين',                 dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'محمد شريف عبده حسن',                   dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'ناصر محمد مكاوي عودة',                 dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'تحفة أحمد حندوسة',                     dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'سعيد جابر الجوهري',                    dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'محمد صلاح بن محمد أحمد الخولي',         dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'تحية محمود محمود شهاب',                 dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'علي محمد موسى رضوان',                   dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'محمد عبد الحليم نور الدين',             dept: 'egyptology',   degree: 'professor' },
    { nameAr: 'أحمد عبد القادر جلال',                  dept: 'egyptology',   degree: 'professor' },
    // Islamic
    { nameAr: 'أمال أحمد حسن العمري',                 dept: 'islamic',      degree: 'professor' },
    { nameAr: 'حسني محمد حسن نويصر',                  dept: 'islamic',      degree: 'professor' },
    { nameAr: 'محمود إبراهيم حسنين',                   dept: 'islamic',      degree: 'professor' },
    { nameAr: 'رأفت محمد محمد النبراوي',               dept: 'islamic',      degree: 'professor' },
    { nameAr: 'محمد محمد مرسي الكحلاوي',               dept: 'islamic',      degree: 'professor' },
    { nameAr: 'محمد حمزة إسماعيل الحداد',              dept: 'islamic',      degree: 'professor' },
    { nameAr: 'أبو الحمد محمود محمد فرغلي',            dept: 'islamic',      degree: 'professor' },
    { nameAr: 'حسين مصطفى حسين رمضان',                dept: 'islamic',      degree: 'professor' },
    { nameAr: 'جمال عبد الرحيم ابراهيم',               dept: 'islamic',      degree: 'professor' },
    { nameAr: 'فايزة محمود عبد الخالق الوكيل',         dept: 'islamic',      degree: 'professor' },
    { nameAr: 'علي أحمد ابراهيم الطايش',               dept: 'islamic',      degree: 'professor' },
    { nameAr: 'شادية الدسوقي عبد العزيز كشك',          dept: 'islamic',      degree: 'professor' },
    { nameAr: 'أحمد رجب محمد علي رزق',                 dept: 'islamic',      degree: 'professor' },
    { nameAr: 'عبد العزيز صلاح',                       dept: 'islamic',      degree: 'professor' },
    // Conservation
    { nameAr: 'فاطمة محمد حلمي متبولي',                dept: 'conservation', degree: 'professor' },
    { nameAr: 'سلوى جاد الكريم ضوي',                  dept: 'conservation', degree: 'professor' },
    { nameAr: 'مني فؤاد علي عبد الغني',               dept: 'conservation', degree: 'professor' },
    { nameAr: 'وفيقة نصحي وهبه سوس',                  dept: 'conservation', degree: 'professor' },
    { nameAr: 'محمد محمد مصطفى إبراهيم',               dept: 'conservation', degree: 'professor' },
    { nameAr: 'عمر محمد أحمد عبد الكريم',              dept: 'conservation', degree: 'professor' },
    { nameAr: 'مصطفى عطية محي عبد الجواد',             dept: 'conservation', degree: 'professor' },
    { nameAr: 'وفاء أنور محمد سليمان',                 dept: 'conservation', degree: 'professor' },
    { nameAr: 'جمعة محمد عبد المقصود',                 dept: 'conservation', degree: 'professor' },
    { nameAr: 'عاطف عبد اللطيف عبد السميع',            dept: 'conservation', degree: 'professor' },
    { nameAr: 'هالة عفيفي محمود محمد',                 dept: 'conservation', degree: 'professor' },
    { nameAr: 'رمضان عوض رمضان عبد الله',              dept: 'conservation', degree: 'professor' },
    // Greco-Roman
    { nameAr: 'حسان إبراهيم عامر',                    dept: 'greco-roman',  degree: 'professor' },
    { nameAr: 'خالد غريب علي أحمد شاهين',              dept: 'greco-roman',  degree: 'professor' },
    { nameAr: 'عبد الرحمن علي محمد عبد الرحمن',        dept: 'greco-roman',  degree: 'professor' },
    { nameAr: 'مني جبر عبد النبي حسنين',               dept: 'greco-roman',  degree: 'assistant_professor' },
  ];

  const allFaculty = await prisma.facultyMember.findMany({
    include: { department: { select: { slug: true } } },
  });

  let facFound = 0, facMissing = 0, emailMissing = 0, specMissing = 0;
  for (const req of requiredFaculty) {
    // Fuzzy match — check if a fragment of the name exists
    const fragment = req.nameAr.split(' ').slice(1, 3).join(' '); // middle two words
    const found = allFaculty.find(f =>
      f.nameAr.includes(fragment) && f.department.slug === req.dept
    );
    if (!found) {
      facMissing++;
      FAIL(`Faculty "${req.nameAr}" (${req.dept}) NOT IN DATABASE`);
    } else {
      facFound++;
      if (!found.email) emailMissing++;
      if (!found.specializationAr) specMissing++;
    }
  }
  OK(`Faculty found: ${facFound}/${requiredFaculty.length}`);
  if (facMissing > 0) FAIL(`${facMissing} required faculty members MISSING`);
  WARN(`Faculty without email: ${emailMissing}`);
  WARN(`Faculty without specialization: ${specMissing}`);

  // Check extra faculty from staffEgy2.html NOT yet migrated
  const extraEgy2 = [
    'تحفة أحمد حندوسة',
    'سعيد جابر الجوهري',
    'محمد صلاح بن محمد أحمد الخولي',
    'تحية محمود محمود شهاب',
    'علي محمد موسى رضوان',
    'محمد عبد الحليم نور الدين',
    'أحمد عبد القادر جلال',
  ];
  let missing2 = 0;
  for (const name of extraEgy2) {
    const frag = name.split(' ').slice(1, 3).join(' ');
    const found = allFaculty.find(f => f.nameAr.includes(frag) && f.department.slug === 'egyptology');
    if (!found) { missing2++; FAIL(`staffEgy2 member "${name}" NOT MIGRATED`); }
  }
  if (missing2 === 0) OK('All staffEgy2.html members present');

  // ── SECTION 4: CONFERENCES ──────────────────────────────────────────────
  SECTION('4. CONFERENCES');
  const requiredConfs = [
    { slug: 'silk-road-1990',                  titleFragment: 'الحرير',     year: 1990 },
    { slug: 'giza-through-ages-2008',           titleFragment: 'الجيزة',     year: 2008 },
    { slug: 'civilizational-contributions-2010',titleFragment: 'الإسهامات',  year: 2010 },
    { slug: 'egyptian-sciences-2012',           titleFragment: 'العلوم',     year: 2012 },
    { slug: 'iciae-2013',                       titleFragment: 'الإسلامية',  year: 2013 },
    { slug: 'egypt-mediterranean-2014',         titleFragment: 'المتوسط',    year: 2014 },
    { slug: 'archaeological-sites-2015',        titleFragment: 'المواقع',    year: 2015 },
    { slug: 'pottery-ceramics-2016',            titleFragment: 'الفخار',     year: 2016 },
    { slug: 'ahcw-2017',                        titleFragment: 'متغير',      year: 2017 },
    { slug: 'aharc-2018',                       titleFragment: 'الأصالة',    year: 2018 },
  ];

  const confs = await prisma.conference.findMany();
  for (const req of requiredConfs) {
    const c = confs.find(x => x.slug === req.slug);
    if (!c) { FAIL(`Conference "${req.slug}" NOT IN DATABASE`); continue; }
    if (!c.titleAr.includes(req.titleFragment)) FAIL(`Conf "${req.slug}" titleAr missing "${req.titleFragment}"`);
    if (!c.startDate) FAIL(`Conf "${req.slug}" missing startDate`);
    else {
      const yr = new Date(c.startDate).getFullYear();
      if (yr !== req.year) FAIL(`Conf "${req.slug}" wrong year: ${yr} (expected ${req.year})`);
      else OK(`Conf "${req.slug}" — ${c.titleAr.slice(0,30)}... (${yr})`);
    }
    if (c.status !== 'completed') FAIL(`Conf "${req.slug}" status="${c.status}" should be "completed"`);
  }
  const total = confs.length;
  if (total < 10) FAIL(`Only ${total} conferences — need at least 10`);
  else OK(`Total conferences: ${total}`);

  // ── SECTION 5: NEWS ─────────────────────────────────────────────────────
  SECTION('5. NEWS ITEMS');
  // From news.html (4 items) + news2.html (many more)
  const requiredNews = [
    { titleFragment: 'الالتماسات',   date: '2024' },
    { titleFragment: 'نتائج الدراسات العليا', date: '2024' },
    { titleFragment: 'الدورات التدريبية', date: '2024' },
    { titleFragment: 'امتحانات الفصل', date: '2024' },
    // From news2.html
    { titleFragment: 'برنامج تدريب صيفي', date: '2019' },
    { titleFragment: 'محاضرة للتوعية بمخاطر الحريق', date: '2019' },
    { titleFragment: 'الضوابط الخاصة بتدريس مقرر التفكير', date: '2019' },
    { titleFragment: 'منح لدراسة اللغة اليابانية', date: '2019' },
  ];

  const news = await prisma.news.findMany();
  let newsFound = 0, newsMissing = 0;
  for (const req of requiredNews) {
    const found = news.find(n => n.titleAr.includes(req.titleFragment) || n.bodyAr.includes(req.titleFragment));
    if (!found) { newsMissing++; FAIL(`News "${req.titleFragment}" (${req.date}) NOT IN DATABASE`); }
    else newsFound++;
  }
  OK(`News found: ${newsFound}/${requiredNews.length}`);
  if (newsMissing > 0) FAIL(`${newsMissing} news items MISSING`);

  // ── SECTION 6: KEY PAGES CONTENT ACCURACY ───────────────────────────────
  SECTION('6. CONTENT ACCURACY CHECKS');

  // Dean statement — must have actual dean name and speech
  const deanStmt = await prisma.page.findUnique({ where: { slug: 'dean-statement' } });
  if (!deanStmt) FAIL('dean-statement page MISSING');
  else {
    if (!deanStmt.contentAr?.includes('أحمد رجب')) FAIL('dean-statement: dean name "أحمد رجب" missing');
    else OK('dean-statement: correct dean name');
    if (!deanStmt.contentAr?.includes('أبنائي')) FAIL('dean-statement: opening speech text missing');
    else OK('dean-statement: speech content present');
  }

  // Former deans — must have all 14 deans with dates
  const formalDeans = await prisma.page.findUnique({ where: { slug: 'formal-deans' } });
  if (!formalDeans) FAIL('formal-deans page MISSING');
  else {
    const deanNames = ['مصطفى محمد الأمير', 'سعاد ماهر', 'عبد العزيز صالح', 'رأفت النبراوي', 'أحمد رجب'];
    for (const name of deanNames) {
      if (!formalDeans.contentAr?.includes(name.split(' ')[0]))
        FAIL(`formal-deans: "${name}" missing`);
    }
    if (formalDeans.contentAr?.includes('1973')) OK('formal-deans: dates present (1973)');
    else FAIL('formal-deans: dates missing');
  }

  // Top management — must have current leadership
  const topMgmt = await prisma.page.findUnique({ where: { slug: 'top-management' } });
  if (!topMgmt) FAIL('top-management page MISSING');
  else {
    if (!topMgmt.contentAr?.includes('عميد الكلية')) FAIL('top-management: dean role missing');
    else OK('top-management: dean role present');
    if (!topMgmt.contentAr?.includes('وكيل')) FAIL('top-management: vice-dean roles missing');
    else OK('top-management: vice-dean roles present');
  }

  // Postgraduate — must have all diploma programs (4 general + 10 specialized + 4 professional)
  const pgPage = await prisma.page.findUnique({ where: { slug: 'postgraduate-programs' } });
  if (!pgPage) FAIL('postgraduate-programs page MISSING');
  else {
    if (!pgPage.contentAr?.includes('دبلوما')) FAIL('postgraduate-programs: diploma programs missing');
    else OK('postgraduate-programs: diploma content present');
    if (!pgPage.contentAr?.includes('72')) FAIL('postgraduate-programs: 72 credit hours missing');
    else OK('postgraduate-programs: 72 credit hours verified');
    if (!pgPage.contentAr?.includes('ماجستير')) FAIL('postgraduate-programs: masters programs missing');
    else OK('postgraduate-programs: masters content present');
  }

  // museum-info — exact numbers must be correct
  const museum = await prisma.page.findUnique({ where: { slug: 'museum-info' } });
  if (!museum) FAIL('museum-info page MISSING');
  else {
    if (!museum.contentAr?.includes('3500')) FAIL('museum-info: 3500 artifacts count WRONG or missing');
    else OK('museum-info: 3500 artifacts ✓');
    if (!museum.contentAr?.includes('1195')) FAIL('museum-info: 1195 Egyptian artifacts WRONG or missing');
    else OK('museum-info: 1195 Egyptian artifacts ✓');
  }

  // contact-info — verify exact data from contactus.html
  const contact = await prisma.page.findUnique({ where: { slug: 'contact-info' } });
  if (!contact) FAIL('contact-info page MISSING');
  else {
    const checks = [
      ['fa_archo@cu.edu.eg',        'faculty email'],
      ['35728108',                   'fax number'],
      ['CUArchaeology',              'Facebook page'],
      ['FaArcho',                    'Twitter page'],
      ['محسن نجم',                   'vice-dean name'],
      ['هالة عفيفي',                 'vice-dean community'],
      ['35675602',                   'dean secretary phone'],
      ['quality_arch@cu.edu.eg',     'quality unit email'],
    ];
    for (const [val, label] of checks) {
      if (!contact.contentAr?.includes(val)) FAIL(`contact-info: ${label} "${val}" MISSING`);
      else OK(`contact-info: ${label} ✓`);
    }
  }

  // ── SECTION 7: PROGRAMS ─────────────────────────────────────────────────
  SECTION('7. ACADEMIC PROGRAMS');
  const programs = await prisma.program.findMany({ include: { department: true } });
  const progsByDept: Record<string, number> = {};
  for (const p of programs) {
    progsByDept[p.department.slug] = (progsByDept[p.department.slug] || 0) + 1;
  }
  for (const dept of ['egyptology', 'islamic', 'conservation', 'greco-roman']) {
    const count = progsByDept[dept] || 0;
    if (count === 0) FAIL(`No programs for dept "${dept}"`);
    else OK(`Dept "${dept}": ${count} programs`);
  }
  // Must have masters + doctorate for all depts
  const mastersCount = programs.filter(p => p.level === 'masters').length;
  const docCount     = programs.filter(p => p.level === 'doctorate').length;
  if (mastersCount < 4) FAIL(`Only ${mastersCount} masters programs (need ≥4)`);
  else OK(`Masters programs: ${mastersCount}`);
  if (docCount < 4) FAIL(`Only ${docCount} doctorate programs (need ≥4)`);
  else OK(`Doctorate programs: ${docCount}`);

  // ── FINAL SUMMARY ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  if (issues === 0) {
    console.log('  🎉 AUDIT PASSED — No issues found');
  } else {
    console.log(`  ❌ AUDIT FOUND ${issues} ISSUE(S) — Must be fixed`);
  }
  console.log('═'.repeat(60) + '\n');
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
