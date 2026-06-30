/**
 * seed.migration.ts — Full Data Migration from Legacy Website
 * ============================================================
 * Migrates ALL authentic data extracted from the legacy HTML files:
 *   1. Static Pages (History, Mission, Vision, About, Contact)
 *   2. Faculty Members (all 4 departments, extracted from staffEgy/Islamic/Cons/GrecoRoman.html)
 *   3. Conferences (extracted from conferences.html)
 *   4. News Items (extracted from news.html)
 *
 * Run: npx ts-node prisma/seed.migration.ts
 */

import {
  PrismaClient,
  UserRole,
  FacultyDegree,
  ConferenceStatus,
  NewsCategory,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🏛️  Faculty of Archaeology — Legacy Data Migration\n');

  // ── Get or create admin user for authoring content ──────────────────────
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@fa-arch.cu.edu.eg' },
  });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@fa-arch.cu.edu.eg',
        username: 'admin',
        passwordHash: await bcrypt.hash('Admin@12345', 12),
        role: UserRole.admin,
      },
    });
  }
  console.log('✅ Admin user ready:', admin.email);

  // ── Fetch all 4 departments ──────────────────────────────────────────────
  const depts = await prisma.department.findMany();
  const deptMap: Record<string, string> = {};
  for (const d of depts) {
    deptMap[d.slug] = d.id;
  }
  console.log(`✅ Found ${depts.length} departments`);

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY 1: TEXT CONTENT — STATIC PAGES
  // Source: History.html, Mission.html, vision.html, about.html, contactus.html
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n📄 CATEGORY 1: Static Pages...');

  const pages = [
    {
      slug: 'about-history',
      titleAr: 'تاريخ كلية الآثار',
      titleEn: 'Faculty of Archaeology — History',
      contentAr: `كانت الدراسات الأثرية في بادئ الأمر تابعة لمدرسة المعلمين العليا. ثم أصبحت النواة الأولى لكلية الآداب بالجامعة المصرية التي أنشأتها الحكومة في أكتوبر عام 1925م وهكذا أصبح قسم الآثار بكلية الآداب دعامة من الدعامات الأولى للجامعة منذ إنشائها. وظل قسم الآثار تابعاً لكلية الآداب من عام 1925م حتى 1970م.

وقد أنشئت كلية الآثار الحالية بقرار من مجلس الجامعة للدراسات العليا وبالقرار الجمهوري رقم 1803 لسنة 1970م، وذلك استجابة للرغبة التي تقدمت بها هيئة الآثار بأنها في حاجة ماسة إلى جميع التخصصات الجامعية بعد الحصول على قدر كافٍ من الدراسات الأثرية. ومن ثم وافق مجلس الجامعة على إنشاء كلية قائمة بذاتها للدراسات الأثرية تضم طلاباً من الحاصلين على الثانوية العامة أو ما يعادلها من الشهادات الأجنبية ومدة الدراسة بها أربع سنوات, يحصل بعدها الطالب على درجة الليسانس في الآثار. كما أنها تقبل طلاباً من خريجي الكليات الجامعية الأخرى للدراسة فيها لمدة سنتين للحصول بعدها على دبلوم الدراسات العليا والبحوث الذي يؤهلهم للتحضير لدرجتي الماجستير والدكتوراه في الآثار.

وقد بدأت الكلية بقسمين فقط هما قسم الآثار المصرية القديمة وقسم الآثار الإسلامية ثم أنشأت الكلية في العام الدراسي 1977/1978م قسماً لترميم الآثار. وتُعِدّ الكلية حالياً لائحة جديدة بنظام الساعات المعتمدة لأقسام الكلية الثلاثة الحالية ولقسمين جديدين (تحت الإنشاء) وهما قسم الآثار اليونانية الرومانية وقسم الإرشاد السياحي.

ولا شك أن الآثار بفروعها المتعددة هي التاريخ الحي لكل أمة وهى الشاهد القائم على ما بدأت به حضارة أهلها. فعلم الآثار هو علم البحث عن أصول الحضارات حيث الجذور وتشكيل الذات، وميدانه هو ما أنتجته يد الإنسان في العصور السابقة وأنه كلما زاد الكشف عن آثار أمة ما كلما زادت الحصيلة التي يستنتج منها تاريخها وحضارتها. ومصر دون شك هي من أغنى الأمم بآثارها التي مثلت سلسلة متصلة الحلقات من تجارب الإنسان المصري في وادي النيل منذ عصور ما قبل التاريخ وحتى الماضي القريب.`,
      contentEn: `Archaeological studies at Cairo University were originally affiliated with the Higher Teachers School, then became a founding department of the Faculty of Arts when the Egyptian University was established in October 1925. The Department of Archaeology remained part of the Faculty of Arts from 1925 until 1970.

The current Faculty of Archaeology was established by decision of the University Council for Graduate Studies and by Presidential Decree No. 1803 of 1970, in response to the Antiquities Authority's urgent need for all university specializations after obtaining sufficient archaeological studies. The Faculty admits students who hold the General Secondary Certificate or its foreign equivalents, with a four-year study period leading to the Bachelor's degree in Archaeology.

The Faculty began with only two departments: the Department of Ancient Egyptian Archaeology and the Department of Islamic Archaeology. In the academic year 1977/1978, the Department of Conservation was established. The Faculty is currently preparing a new credit-hour system regulation for its three existing departments and two new ones under establishment: the Department of Greco-Roman Archaeology and the Department of Archaeological Guidance.`,
      metaDescriptionAr: 'تاريخ كلية الآثار بجامعة القاهرة منذ التأسيس عام 1925',
      metaDescriptionEn: 'History of the Faculty of Archaeology at Cairo University since 1925',
    },
    {
      slug: 'about-mission',
      titleAr: 'رسالة كلية الآثار',
      titleEn: 'Faculty Mission',
      contentAr: `تلتزم كلية الآثار جامعة القاهرة بالتميز في تقديم خدمات تعليمية وبحثية ومجتمعية واستشارية وتدريبية، وإعداد خريجين مهنيين وباحثين متخصصين مواكبين للتطورات العلمية والتقنية التي تفي بمتطلبات سوق العمل في مجالات دراسة الآثار وترميمها وصيانتها وكافة مجالات العمل الميداني الأثري باعتبار التراث مقوماً استراتيجياً هاماً لتعزيز روح الانتماء والمواطنة وصون الهوية الوطنية لتحقيق التنمية المستدامة في كافة المجالات في ضوء مفهوم الأمن القومي الشامل وطبقاً لمعايير الجودة والتقدم العلمي العالمي.`,
      contentEn: `The Faculty of Archaeology at Cairo University is committed to excellence in providing educational, research, community, consultancy, and training services. It prepares professional graduates and specialized researchers who keep pace with scientific and technological developments that meet the labor market requirements in the fields of archaeological study, restoration, conservation, and all areas of archaeological fieldwork, considering heritage as an important strategic asset for reinforcing the spirit of belonging and citizenship and preserving national identity to achieve sustainable development in all fields.`,
      metaDescriptionAr: 'رسالة كلية الآثار بجامعة القاهرة',
      metaDescriptionEn: 'Mission of the Faculty of Archaeology at Cairo University',
    },
    {
      slug: 'about-vision',
      titleAr: 'رؤية كلية الآثار',
      titleEn: 'Faculty Vision',
      contentAr: `أن تكون كلية الآثار ببرامجها المختلفة من بين أفضل كليات الآثار لجامعات الجيل الثالث العالمية والمشهود لها بالتميز في البحث العلمي وتأصيل المعرفة وتكوينها ونشرها وتطبيقها لتثري حياة الأفراد والمجتمع والمؤسسات والبيئة المحيطة.

الأهداف الاستراتيجية للكلية: لتحميل الغايات والاهداف الاستراتيجية للكلية اضغط هنا.`,
      contentEn: `To make the Faculty of Archaeology, with its various programs, among the best archaeology faculties of third-generation world universities, recognized for excellence in scientific research, knowledge production, dissemination, and application to enrich the lives of individuals, society, institutions, and the surrounding environment.`,
      metaDescriptionAr: 'رؤية كلية الآثار بجامعة القاهرة',
      metaDescriptionEn: 'Vision of the Faculty of Archaeology at Cairo University',
    },
    {
      slug: 'about-faculty',
      titleAr: 'عن كلية الآثار',
      titleEn: 'About the Faculty',
      contentAr: `The Faculty of Archaeology was established in 1970 by decision of the effects of the current Council for Graduate Studies and Presidential Decree No. 1803 of 1970 in response made by the Antiquities Authority as being in urgent need of all undergraduate majors after obtaining a sufficient amount of archaeological studies.

And then approved by the University Council on the establishment of a stand-alone college for archaeological studies involving students from obtaining secondary public spending projects by years, then get a bachelor's degree in archeology.`,
      contentEn: `The Faculty of Archaeology at Cairo University was established in 1970 as an independent faculty, becoming the first specialized faculty in archaeology in the Arab world. It comprises four departments: Egyptology, Islamic Archaeology, Conservation, and Greco-Roman Archaeology.`,
      metaDescriptionAr: 'كلية الآثار جامعة القاهرة',
      metaDescriptionEn: 'Faculty of Archaeology Cairo University',
    },
    {
      slug: 'contact-info',
      titleAr: 'مراسلات كلية الآثار',
      titleEn: 'Faculty Contact Information',
      contentAr: `عميد الكلية: أ. د أحمد رجب
عنوان المراسلات: كلية الآثار - جامعة القاهرة - الرقم البريدي 12613
رقم الفاكس: 002 02 35728108
البريد الإلكتروني: fa_archo@cu.edu.eg
الصفحة الرسمية على الفيسبوك: https://www.facebook.com/CUArchaeology
الصفحة الرسمية على تويتر: https://twitter.com/FaArcho
قناة يوتيوب: https://www.youtube.com/channel/UCKoD4fuWbqLe9Vey-qv33XQ

مراسلات عميد الكلية:
اسم عميد الكلية: أ. د أحمد رجب
رقم الهاتف (سكرتارية العميد): 002 02 35675602
رقم الفاكس: 002 02 35728108
البريد الإلكتروني: mfragab@hotmail.com
الرقم الداخلي (سكرتارية العميد): 35602

مراسلات وكيل الكلية لشئون التعليم والطلاب:
الاسم: أ. د محسن نجم الدين
رقم الهاتف: 002 02 35675607
رقم الهاتف (سكرتارية الوكيل): 002 02 35675608
البريد الإلكتروني: mohsennegme@yahoo.com
الرقم الداخلي: 35607

مراسلات وكيل الكلية لشئون الدراسات العليا والبحوث:
الاسم: أ. د محسن صالح
رقم الهاتف: 002 02 35675611
البريد الإلكتروني: mohsensaleh_22@yahoo.com
الرقم الداخلي: 35611

مراسلات وكيل الكلية لشئون خدمة المجتمع والبيئة:
الاسم: أ. د هالة عفيفي
رقم الهاتف: 002 02 35675609
البريد الإلكتروني: halaafifi11@hotmail.com
الرقم الداخلي: 35609

مراسلات وحدة ضمان الجودة والاعتماد:
مدير الوحدة: أ. د سوسن درويش
نائب مدير الوحدة: د. خالد حسن - د منصور حسن
رقم الهاتف: 002 02 35675675
البريد الإلكتروني: quality_arch@cu.edu.eg, quaa2014@gmail.com
الرقم الداخلي: 35675`,
      contentEn: `Dean: Prof. Dr. Ahmed Ragab
Mailing Address: Faculty of Archaeology - Cairo University - Postal Code 12613
Fax: 002 02 35728108
Email: fa_archo@cu.edu.eg
Facebook: https://www.facebook.com/CUArchaeology
Twitter: https://twitter.com/FaArcho
YouTube: https://www.youtube.com/channel/UCKoD4fuWbqLe9Vey-qv33XQ`,
      metaDescriptionAr: 'مراسلات كلية الآثار بجامعة القاهرة',
      metaDescriptionEn: 'Contact information for the Faculty of Archaeology at Cairo University',
    },
    {
      slug: 'museum-info',
      titleAr: 'متحف كلية الآثار',
      titleEn: 'Faculty of Archaeology Museum',
      contentAr: `تمتاز كلية الاثار بوجود متحفاً للآثار ينقسم الى قسمين للآثار المصرية والآثار الإسلامية ويضم ما يقرب من 3500 قطعة أثرية، هي نتاج جفائر كلية الآثار ويضم قسم الآثار المصرية بالمتحف مجموعة متنوعة من الآثار تقترب من 1195 قطعة أثرية ويضم القسم الإسلامي مجموعة قيمة ومهمة جداً من العصور الإسلامية المختلفة.`,
      contentEn: `The Faculty of Archaeology has its own museum divided into two sections: Egyptian Archaeology and Islamic Archaeology. It contains approximately 3,500 archaeological pieces, which are the product of the Faculty's excavations. The Egyptian Archaeology section holds a diverse collection of approximately 1,195 artifacts, while the Islamic section contains a valuable and very important collection from various Islamic periods.`,
      metaDescriptionAr: 'متحف كلية الآثار - جامعة القاهرة - 3500 قطعة أثرية',
      metaDescriptionEn: 'Faculty of Archaeology Museum - Cairo University - 3500 artifacts',
    },
    {
      slug: 'conservation-center',
      titleAr: 'مركز صيانة الآثار والمباني التاريخية ومقتنيات المتاحف',
      titleEn: 'Conservation Center for Antiquities, Historic Buildings and Museum Collections',
      contentAr: `يوجد بكلية الآثار – جامعة القاهرة وحدة ذات طابع خاص وهي مركز صيانة الآثار والمباني التاريخية ومقتنيات المتاحف والذي أسس عام 1996، ويقوم المركز بعمل ترميم وصيانة للآثار بالإضافة الى القيام بالبحوث المتعلقة بالترميم واقامة دورات تدريبية في مجال الترميم لمتدربين مصريين وغير مصريين.
الموقع الرسمي للمركز: http://cca-arch.cu.edu.eg`,
      contentEn: `The Faculty of Archaeology at Cairo University has a special unit: the Conservation Center for Antiquities, Historic Buildings and Museum Collections, established in 1996. The Center performs restoration and conservation of artifacts, conducts conservation research, and offers training courses in conservation for Egyptian and non-Egyptian trainees.
Official website: http://cca-arch.cu.edu.eg`,
      metaDescriptionAr: 'مركز صيانة الآثار - كلية الآثار - جامعة القاهرة - تأسس 1996',
      metaDescriptionEn: 'Conservation Center - Faculty of Archaeology - Cairo University - Est. 1996',
    },
    {
      slug: 'excavations',
      titleAr: 'حفائر كلية الآثار',
      titleEn: 'Faculty Excavations',
      contentAr: `تقوم كلية الاثار – جامعة القاهرة بالكشف عن الاثار المصرية والإسلامية في العديد من مناطق الحفائر كمناطق حفائر عنبية وحفائر منطقة الأهراماتت وحفائر تونة الجبل وحفائر سقارة وحفائر عرب الحصن وحفائر ميت رهينة وحفائر أبو صير بالإضافة الى الحفائر الخاصة بالاثار الإسلامية بمنطقتي الفسطاط والقصر العيني.`,
      contentEn: `The Faculty of Archaeology at Cairo University conducts excavations at numerous sites uncovering Egyptian and Islamic artifacts, including excavations at Anbiya, the Pyramids area, Tuna el-Gebel, Saqqara, Arab el-Hisn, Mit Rahina, Abu Sir, as well as Islamic archaeology excavations at Fustat and Al-Qasr Al-Aini.`,
      metaDescriptionAr: 'حفائر كلية الآثار بجامعة القاهرة في مواقع متعددة',
      metaDescriptionEn: 'Faculty of Archaeology excavations at multiple sites across Egypt',
    },
  ];

  let pageCount = 0;
  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        titleAr: page.titleAr,
        titleEn: page.titleEn,
        contentAr: page.contentAr,
        contentEn: page.contentEn,
        metaDescriptionAr: page.metaDescriptionAr,
        metaDescriptionEn: page.metaDescriptionEn,
        updatedBy: admin.id,
      },
      create: { ...page, updatedBy: admin.id },
    });
    pageCount++;
    console.log(`  ✅ Page: ${page.slug}`);
  }
  console.log(`\n  📄 Total pages migrated: ${pageCount}`);

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY 2: FACULTY MEMBERS
  // Source: staffEgy.html, staffIslamic.html, staffCons.html, staffgrecoRoman.html
  // Degrees: أستاذ متفرغ=professor, أستاذ=professor, أستاذ مساعد=assistant_professor,
  //          مدرس=lecturer, أستاذ مساعد متفرغ=assistant_professor, مدرس مساعد=assistant_lecturer,
  //          معيد=assistant_lecturer
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n👨‍🏫 CATEGORY 2: Faculty Members...');

  // Helper to map Arabic degree to enum
  function mapDegree(ar: string): FacultyDegree {
    if (ar.includes('أستاذ متفرغ') || ar.includes('استاذ متفرغ')) return FacultyDegree.professor;
    if (ar.includes('أستاذ مساعد متفرغ') || ar.includes('استاذ مساعد متفرغ')) return FacultyDegree.assistant_professor;
    if (ar.includes('أستاذ مساعد') || ar.includes('استاذ مساعد')) return FacultyDegree.assistant_professor;
    if (ar.includes('أستاذ') || ar.includes('استاذ')) return FacultyDegree.professor;
    if (ar.includes('مدرس مساعد')) return FacultyDegree.assistant_lecturer;
    if (ar.includes('مدرس')) return FacultyDegree.lecturer;
    if (ar.includes('معيد')) return FacultyDegree.demonstrator;
    return FacultyDegree.lecturer;
  }

  // ── Department: Egyptology (قسم الآثار المصرية) ──────────────────────
  const egyptologyFaculty = [
    { nameAr: 'أ.د/ علا محمد عبد العزيز العجيزي', nameEn: 'Prof. Dr. Ola Mohamed Abd El Aziz El Aguizy', degree: 'أستاذ متفرغ', specializationAr: 'ديموطيقي', specializationEn: 'Demotic', email: 'olaelaguizy@gmail.com', photoUrl: 'images/Deans/9.gif' },
    { nameAr: 'أ.د/ علاء الدين عبد المحسن شاهين', nameEn: 'Prof. Dr. Alaa El-Din Abd El-Mohsen Shaheen', degree: 'أستاذ متفرغ', specializationAr: 'تاريخ وحضارة مصر والشرق الأدنى القديم', specializationEn: 'History and Civilization of Ancient Egypt and the Ancient Near East', email: 'sebentus_52@yahoo.com', photoUrl: 'images/Deans/10.gif' },
    { nameAr: 'أ.د/ أحمد محمود عيسى عبد الرحيم', nameEn: 'Prof. Dr. Ahmad Mahmoud Issa Abd El-Rahim', degree: 'أستاذ متفرغ', specializationAr: 'ديانة وعمارة وفنون مصرية قديمة', specializationEn: 'Religion, Architecture and Arts of Ancient Egypt', email: 'ahmadeissa@cu.edu.eg', photoUrl: null },
    { nameAr: 'أ.د/ سعاد سيد عبد العال', nameEn: 'Prof. Dr. Soad Sayed Abd El-Aal', degree: 'أستاذ متفرغ', specializationAr: 'ديموطيقي', specializationEn: 'Demotic', email: 'soad4444@yahoo.com', photoUrl: null },
    { nameAr: 'أ.د/ زينب علي محمد محروس', nameEn: 'Prof. Dr. Zeinab Ali Mohamed Mahrous', degree: 'أستاذ متفرغ', specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language', email: 'zeinab_21_10@yahoo.com', photoUrl: 'CV/Images/drZinab.gif' },
    { nameAr: 'أ.د/ مصطفى عطا الله محمد خليفة', nameEn: 'Prof. Dr. Mostafa Ata Allah Mohamed Khalifa', degree: 'أستاذ متفرغ', specializationAr: 'آثار ما قبل التاريخ', specializationEn: 'Prehistoric Archaeology', email: 'dr.mostafaatallah@yahoo.com', photoUrl: 'CV/Images/drmostafaaAttia2.gif' },
    { nameAr: 'أ. د/ أحمد محمد سعيد', nameEn: 'Prof. Dr. Ahmed Mohamed Saeid', degree: 'أستاذ متفرغ', specializationAr: 'عصور ما قبل التاريخ', specializationEn: 'Prehistoric Ages', email: 'ahmed_m_saied@hotmail.com', photoUrl: 'CV/Images/drAhmedSaed.gif' },
    { nameAr: 'أ.د/ هبة مصطفى كمال نوح', nameEn: 'Prof. Dr. Heba Mostafa Kamal Nouh', degree: 'أستاذ متفرغ', specializationAr: 'قواعد اجروميّة', specializationEn: 'Coptic Grammar', email: 'hebanouh@gmail.com', photoUrl: 'CV/Images/drHeba2.jpg' },
    { nameAr: 'أ.د/ عزة فاروق سيد حسانين', nameEn: 'Prof. Dr. Azza Farouk Sayed Hassanin', degree: 'أستاذ متفرغ', specializationAr: 'آثار مصرية قديمة - فنون وديانة', specializationEn: 'Ancient Egyptian Archaeology - Arts and Religion', email: null, photoUrl: 'images/Deans/11.gif' },
    { nameAr: 'أ. د/محمد شريف عبده حسن', nameEn: 'Prof. Dr. Mohamed Sharif Abduh Hassan', degree: 'أستاذ متفرغ', specializationAr: 'هيراطيقي', specializationEn: 'Hieratic', email: 'mohshali@hotmail.com', photoUrl: null },
    { nameAr: 'أ.د/ ناصر محمد مكاوي عودة', nameEn: 'Prof. Dr. Naser Mohamed Mekawi Oudah', degree: 'أستاذ', specializationAr: 'تاريخ وحضارة الشرق القديم', specializationEn: 'History and Civilization of the Ancient East', email: 'oumekawi@hotmail.com', photoUrl: 'CV/Images/drNaser.jpg' },
    { nameAr: 'أ. د/حسن نصر الدين حسن دنيا', nameEn: 'Prof. Dr. Hassan Nasr El-Din Hassan Donya', degree: 'أستاذ', specializationAr: 'الآثار المصرية في العصر المتأخر', specializationEn: 'Egyptian Archaeology in the Late Period', email: 'Hassannasr@hotmail.com', photoUrl: null },
    { nameAr: 'أ. د/سلوى أحمد كامل عبد السلام عطية', nameEn: 'Prof. Dr. Salwa Ahmed Kamel Abd El-Salam Attia', degree: 'أستاذ', specializationAr: 'آثار وديانة مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology and Religion', email: 'dr_salwakamel@yahoo.com', photoUrl: null },
    { nameAr: 'أ. د/حسني عبد الحليم محمود عمار', nameEn: 'Prof. Dr. Hosny Abd El-Halim Mahmoud Ammar', degree: 'أستاذ', specializationAr: 'آثار ما قبل التاريخ', specializationEn: 'Prehistoric Archaeology', email: null, photoUrl: 'CV/Images/drHosnyAmmar.gif' },
    { nameAr: 'أ. د/حسين محمد ربيع حسين الدسوقي', nameEn: 'Prof. Dr. Hussein Mohamed Rabee Hussein El-Desouky', degree: 'أستاذ', specializationAr: 'آثار مصر في العصر المتاخر', specializationEn: 'Egyptian Archaeology in the Late Period', email: 'huseinrabie@gmail.com', photoUrl: 'CV/Images/drHusseinRabie.gif' },
    { nameAr: 'أ. د/محسن محمد نجم الدين', nameEn: 'Prof. Dr. Mohsen Mohamed Najm El-Din', degree: 'أستاذ', specializationAr: 'تاريخ واثار الشرق الادنى القديم', specializationEn: 'History and Archaeology of the Ancient Near East', email: 'mohsennegme@yahoo.com', photoUrl: 'CV/Images/DrMohsenNegm2.jpg' },
    { nameAr: 'أ. د/سليمان حامد سليمان الحويلي', nameEn: 'Prof. Dr. Soliman Hamed Soliman El-Hewaily', degree: 'أستاذ', specializationAr: 'تاريخ واثار الشرق الادنى القديم', specializationEn: 'History and Archaeology of the Ancient Near East', email: 's.elhewaily@yahoo.com', photoUrl: 'CV/Images/drSoliman.gif' },
    { nameAr: 'أ. د/أبو الحسن محمود بكري موسى', nameEn: 'Prof. Dr. Abu El-Hassan Mahmoud Bakri Moussa', degree: 'أستاذ', specializationAr: 'آثار إيران وأسيا الوسطى', specializationEn: 'Archaeology of Iran and Central Asia', email: 'masry@mail.ru', photoUrl: null },
    { nameAr: 'أ.د. فوزية عبد الله محمد عبد الغني', nameEn: 'Prof. Dr. Fawzia Abdullah Mohamed Abd El-Ghani', degree: 'أستاذ', specializationAr: 'تاريخ واثار الشرق الادنى القديم', specializationEn: 'History and Archaeology of the Ancient Near East', email: 'fawziamohamed@cu.edu.eg', photoUrl: 'CV/Images/ProfFawzia.jpg' },
    { nameAr: 'أ.د. مني زهير أحمد محمد الشايب', nameEn: 'Prof. Dr. Mona Zoheir Ahmed Mohamed El-Shayeb', degree: 'أستاذ', specializationAr: 'عمارة وفنون', specializationEn: 'Architecture and Arts', email: 'drmonazoheir@hotmail.com', photoUrl: null },
    { nameAr: 'أ. د. ماجدة السيد جاد عبد الهادي', nameEn: 'Prof. Dr. Magda El-Sayed Gad Abd El-Hady', degree: 'أستاذ', specializationAr: 'آثار مصرية قديمة وديانة', specializationEn: 'Ancient Egyptian Archaeology and Religion', email: 'magdagad2009@yahoo.com', photoUrl: null },
    { nameAr: 'د. زكية زكي جمال الدين', nameEn: 'Dr. Zakiya Zaki Gamal El-Din', degree: 'أستاذ مساعد متفرغ', specializationAr: 'منذ الدولة القديمة وحتى الدولة الحديثة', specializationEn: 'From the Old Kingdom to the New Kingdom', email: 'zzgamal@gmail.com', photoUrl: null },
    { nameAr: 'د. مها سمير عبد السلام القناوي', nameEn: 'Dr. Maha Samir Abd El-Salam El-Kinawy', degree: 'أستاذ مساعد متفرغ', specializationAr: 'فنون وديانة اثار مصرية', specializationEn: 'Arts and Religion of Ancient Egyptian Archaeology', email: 'dr_maha_kinawy@yahoo.com', photoUrl: null },
    { nameAr: 'د. طارق سيد توفيق', nameEn: 'Dr. Tarek Sayed Tawfik', degree: 'أستاذ مساعد', specializationAr: 'آثار مصرية قديمة - فنون - ديانة', specializationEn: 'Ancient Egyptian Archaeology - Arts - Religion', email: 'Tarektawfik71@yahoo.com', photoUrl: 'CV/Images/drTarek.gif' },
    { nameAr: 'د. مني أبو المعاطي النادي بيومي', nameEn: 'Dr. Mona Abu El-Maaty El-Nady Bayoumi', degree: 'أستاذ مساعد', specializationAr: 'ديانة مصرية قديمة', specializationEn: 'Ancient Egyptian Religion', email: 'Dr.monaelnadi@ymail.com', photoUrl: null },
    { nameAr: 'د. هيام حافظ رواش حافظ', nameEn: 'Dr. Hiyam Hafiz Rawash Hafiz', degree: 'أستاذ مساعد', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'hyamhafez@cu.edu.eg', photoUrl: null },
    { nameAr: 'د. أنور احمد سليم محمد شلبية', nameEn: 'Dr. Anwar Ahmed Selim Mohamed Shalabiya', degree: 'أستاذ مساعد', specializationAr: null, specializationEn: null, email: 'Anwar.selim@yahoo.com', photoUrl: null },
    { nameAr: 'د. أيمان السيد علي', nameEn: 'Dr. Ayman El-Sayed Ali', degree: 'أستاذ مساعد', specializationAr: 'فنون آثار ما قبل التاريخ', specializationEn: 'Arts of Prehistoric Archaeology', email: 'emanali@cu.edu.eg', photoUrl: null },
    { nameAr: 'د. أحمد محمد مكاوي عودة', nameEn: 'Dr. Ahmed Mohamed Mekawi Oudah', degree: 'أستاذ مساعد', specializationAr: 'اثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'ahmedmekawi@cu.edu.eg', photoUrl: 'CV/Images/drAhmedMekawi.gif' },
    { nameAr: 'د. خالد حسن عبد العزيز متولي', nameEn: 'Dr. Khaled Hassan Abd El-Aziz Metawaly', degree: 'أستاذ مساعد', specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language', email: 'Dr.khaled_hassan@yahoo.com', photoUrl: null },
    { nameAr: 'د. حنان علي محرم', nameEn: 'Dr. Hanan Ali Mehram', degree: 'مدرس', specializationAr: 'لغة مصرية قديمة في العصر البطلمي', specializationEn: 'Ancient Egyptian Language in the Ptolemaic Period', email: 'ashraf_6789@hotmail.com', photoUrl: null },
    { nameAr: 'د. ميسرة عبد الله حسنين', nameEn: 'Dr. Maisara Abdullah Hassanin', degree: 'مدرس', specializationAr: 'آثار وديانة مصر القديمة في العصر اليوناني الروماني', specializationEn: 'Archaeology and Religion of Ancient Egypt in the Greco-Roman Period', email: 'biknpt@yahoo.com', photoUrl: 'CV/Images/drMaisra.gif' },
    { nameAr: 'د. أحمد إبراهيم علي أحمد بدران', nameEn: 'Dr. Ahmed Ibrahim Ali Ahmed Badran', degree: 'مدرس', specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language', email: 'ahmedbadran@cu.edu.eg', photoUrl: 'CV/Images/drAhmedBadran.gif' },
    { nameAr: 'د. غادة مصطفى إبراهيم علام', nameEn: 'Dr. Ghada Mostafa Ibrahim Allam', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'ghada_azzam@yahoo.com', photoUrl: null },
    { nameAr: 'د. هند صلاح الدين صميدة عوض', nameEn: 'Dr. Hind Salah El-Din Samida Awad', degree: 'مدرس', specializationAr: 'لغة مصرية قديمة قبطي', specializationEn: 'Ancient Egyptian Language - Coptic', email: 'Hindsalaheldin@yahoo.com', photoUrl: null },
    { nameAr: 'د. نيللي محمد صابر برعي', nameEn: 'Dr. Nelli Mohamed Saber Boraei', degree: 'مدرس', specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language', email: 'nelli.saber@hotmail.com', photoUrl: null },
    { nameAr: 'د. علا محمد فؤاد العبودي', nameEn: 'Dr. Ola Mohamed Fouad El-Aboudi', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'olafouad@cu.edu.eg', photoUrl: null },
    { nameAr: 'د. داليا محمد السيد محمد', nameEn: 'Dr. Dalia Mohamed El-Sayed Mohamed', degree: 'مدرس', specializationAr: 'آثار الشرق الادنى القديم', specializationEn: 'Archaeology of the Ancient Near East', email: 'Ailad77@yahoo.com', photoUrl: null },
    { nameAr: 'د. عادل محمد نصر الدين مهدي', nameEn: 'Dr. Adel Mohamed Nasr El-Din Mahdy', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'adelnasr2200@cu.edu.eg', photoUrl: null },
    { nameAr: 'د. مصطفى محمد أحمد نجدي', nameEn: 'Dr. Mostafa Mohamed Ahmed Nagdy', degree: 'مدرس', specializationAr: 'لغة مصرية قديمة', specializationEn: 'Ancient Egyptian Language', email: 'mostafanagdy@cu.edu.eg', photoUrl: null },
    { nameAr: 'د. دعاء إبراهيم عبد المنعم الجعار', nameEn: 'Dr. Doaa Ibrahim Abd El-Moneim El-Gaar', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'doaagaar@cu.edu.eg', photoUrl: null },
  ];

  let facCount = 0;
  for (let i = 0; i < egyptologyFaculty.length; i++) {
    const f = egyptologyFaculty[i];
    const existing = await prisma.facultyMember.findFirst({
      where: { nameAr: f.nameAr, departmentId: deptMap['egyptology'] },
    });
    if (!existing) {
      await prisma.facultyMember.create({
        data: {
          departmentId: deptMap['egyptology'],
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          degree: mapDegree(f.degree),
          specializationAr: f.specializationAr,
          specializationEn: f.specializationEn,
          email: f.email,
          photoUrl: f.photoUrl,
          orderIndex: i + 1,
          isActive: true,
        },
      });
      facCount++;
    }
  }
  console.log(`  ✅ Egyptology faculty: ${facCount} members added`);

  // ── Department: Islamic Archaeology (قسم الآثار الإسلامية) ─────────────
  const islamicFaculty = [
    { nameAr: 'أ.د/ أمال أحمد حسن العمري', nameEn: 'Prof. Dr. Amal Ahmed Hassan El-Omary', degree: 'أستاذ متفرغ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: 'amalelemary@gmail.com', photoUrl: 'CV/Images/ProfAmal.gif' },
    { nameAr: 'أ.د/ حسني محمد حسن نويصر', nameEn: 'Prof. Dr. Hosny Mohamed Hassan Nouiser', degree: 'أستاذ متفرغ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: 'hosnynouessar@gmail.com', photoUrl: 'CV/Images/drHosniNouser.gif' },
    { nameAr: 'أ.د/ محمود إبراهيم حسنين', nameEn: 'Prof. Dr. Mahmoud Ibrahim Hassanin', degree: 'أستاذ متفرغ', specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts', email: 'dr_mahmoud1950@yahoo.com', photoUrl: 'CV/Images/drMahmoudIbrahim.gif' },
    { nameAr: 'أ.د/ رأفت محمد محمد النبراوي', nameEn: 'Prof. Dr. Rafat Mohamed Mohamed El-Nabarawi', degree: 'أستاذ متفرغ', specializationAr: 'مسكوكات إسلامية', specializationEn: 'Islamic Numismatics', email: 'rafat_elnabarawi@cu.edu.eg', photoUrl: 'CV/Images/8.gif' },
    { nameAr: 'أ.د/ محمد محمد مرسي الكحلاوي', nameEn: 'Prof. Dr. Mohamed Mohamed Morsi El-Kahlawy', degree: 'أستاذ متفرغ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: null, photoUrl: 'CV/Images/drKahlawi.gif' },
    { nameAr: 'أ.د/ محمد حمزة إسماعيل الحداد', nameEn: 'Prof. Dr. Mohamed Hamza Ismail El-Haddad', degree: 'أستاذ متفرغ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: 'dr_mhamza2000@yahoo.com', photoUrl: 'CV/Images/drHamza.gif' },
    { nameAr: 'أ.د/ أبو الحمد محمود محمد فرغلي', nameEn: 'Prof. Dr. Abu El-Hamd Mahmoud Mohamed Farghaly', degree: 'أستاذ متفرغ', specializationAr: 'تصوير اسلامي', specializationEn: 'Islamic Painting', email: 'dr.aboelhamd@cu.edu.eg', photoUrl: 'CV/Images/ProfAboelhamad.gif' },
    { nameAr: 'أ.د/ حسين مصطفى حسين رمضان', nameEn: 'Prof. Dr. Hussein Mostafa Hussein Ramadan', degree: 'أستاذ متفرغ', specializationAr: 'فنون اسلامية', specializationEn: 'Islamic Arts', email: 'Hussein_mostafa@cu.edu.eg', photoUrl: 'CV/Images/DrHusseinRmdan.gif' },
    { nameAr: 'أ.د/ جمال عبد الرحيم ابراهيم', nameEn: 'Prof. Dr. Gamal Abd El-Rahim Ibrahim', degree: 'أستاذ متفرغ', specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts', email: 'Gamalarch@hotmail.com', photoUrl: 'CV/Images/drGamal.gif' },
    { nameAr: 'أ.د/ فايزة محمود عبد الخالق الوكيل', nameEn: 'Prof. Dr. Fayza Mahmoud Abd El-Khalek El-Wakeel', degree: 'أستاذ متفرغ', specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts', email: 'Fayza_elwakeel@yahoo.com', photoUrl: 'CV/Images/DrFayza.jpg' },
    { nameAr: 'أ.د/ علي أحمد ابراهيم الطايش', nameEn: 'Prof. Dr. Ali Ahmed Ibrahim El-Tayesh', degree: 'أستاذ متفرغ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: 'alialtayesh@hotmail.com', photoUrl: 'CV/Images/drAlieltayesh.gif' },
    { nameAr: 'أ.د/ شادية الدسوقي عبد العزيز كشك', nameEn: 'Prof. Dr. Shadia El-Desouky Abd El-Aziz Keshk', degree: 'أستاذ متفرغ', specializationAr: 'فنون إسلامية', specializationEn: 'Islamic Arts', email: 'shdsoky@cu.edu.eg', photoUrl: 'CV/Images/drShadia.gif' },
    { nameAr: 'أ.د/ أحمد رجب محمد علي رزق', nameEn: 'Prof. Dr. Ahmed Ragab Mohamed Ali Rezk', degree: 'أستاذ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: 'mfragab@hotmail.com', photoUrl: 'images/demo/drAhmedragab1.jpg', adminRole: 'عميد الكلية' },
    { nameAr: 'أ.د/ أسامة طلعت محمد عبد الحفيظ', nameEn: 'Prof. Dr. Osama Talat Mohamed Abd El-Hafiz', degree: 'أستاذ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: null, photoUrl: 'CV/Images/drOsamaTalat1.gif' },
    { nameAr: 'أ.د/ عبد العزيز صلاح', nameEn: 'Prof. Dr. Abd El-Aziz Salah', degree: 'أستاذ', specializationAr: 'عمارة إسلامية', specializationEn: 'Islamic Architecture', email: null, photoUrl: 'CV/Images/drAbdelazizSalem.gif', adminRole: 'رئيس قسم الآثار الإسلامية' },
  ];

  facCount = 0;
  for (let i = 0; i < islamicFaculty.length; i++) {
    const f = islamicFaculty[i];
    const existing = await prisma.facultyMember.findFirst({
      where: { nameAr: f.nameAr, departmentId: deptMap['islamic'] },
    });
    if (!existing) {
      await prisma.facultyMember.create({
        data: {
          departmentId: deptMap['islamic'],
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          degree: mapDegree(f.degree),
          specializationAr: f.specializationAr ?? null,
          specializationEn: f.specializationEn ?? null,
          email: f.email ?? null,
          photoUrl: f.photoUrl ?? null,
          adminRole: (f as any).adminRole ?? null,
          orderIndex: i + 1,
          isActive: true,
        },
      });
      facCount++;
    }
  }
  console.log(`  ✅ Islamic Archaeology faculty: ${facCount} members added`);

  // ── Department: Conservation (قسم ترميم الآثار) ─────────────────────────
  const conservationFaculty = [
    { nameAr: 'أ. د/ فاطمة محمد حلمي متبولي', nameEn: 'Prof. Dr. Fatma Mohamed Helmy Matabouly', degree: 'أستاذ متفرغ', specializationAr: 'دراسة مواد الآثار وصيانتها', specializationEn: 'Study of Archaeological Materials and Conservation', email: 'Fatma_helmy@cu.edu.eg', photoUrl: null },
    { nameAr: 'أ. د/ سلوى جاد الكريم ضوي', nameEn: 'Prof. Dr. Salwa Gad El-Karim Dowy', degree: 'أستاذ متفرغ', specializationAr: 'علاج وصيانة الآثار الزجاجية', specializationEn: 'Treatment and Conservation of Glass Artifacts', email: 'sgawi@cu.edu.eg', photoUrl: 'CV/Images/drSalwa.gif' },
    { nameAr: 'أ. د/ مني فؤاد علي عبد الغني', nameEn: 'Prof. Dr. Mona Fouad Ali Abd El-Ghani', degree: 'أستاذ متفرغ', specializationAr: 'ترميم وصيانة الصور الجدارية والفسيفساء والمواد الملونة', specializationEn: 'Restoration and Conservation of Mural Paintings, Mosaics and Colored Materials', email: 'monalyeg@yahoo.com', photoUrl: 'CV/Images/drMona.gif' },
    { nameAr: 'أ. د/ وفيقة نصحي وهبه سوس', nameEn: 'Prof. Dr. Wafika Noshyi Wahba Sous', degree: 'أستاذ متفرغ', specializationAr: 'علاج وصيانة المخطوطات والمواد العضوية', specializationEn: 'Treatment and Conservation of Manuscripts and Organic Materials', email: null, photoUrl: null },
    { nameAr: 'أ. د/ محمد محمد مصطفى إبراهيم', nameEn: 'Prof. Dr. Mohamed Mohamed Mostafa Ibrahim', degree: 'أستاذ متفرغ', specializationAr: 'علاج وصيانة الفخار', specializationEn: 'Treatment and Conservation of Ceramics', email: 'mmmi228@yahoo.com', photoUrl: 'CV/Images/drMohamedMosataf.gif' },
    { nameAr: 'أ. د/ عمر محمد أحمد عبد الكريم', nameEn: 'Prof. Dr. Omar Mohamed Ahmed Abd El-Karim', degree: 'أستاذ', specializationAr: 'أستاذ ترميم المنسوجات والسجاد والمواد العضوية', specializationEn: 'Restoration of Textiles, Rugs and Organic Materials', email: 'Omar_abdelkareem@cu.edu.eg', photoUrl: 'CV/Images/drOmar3.jpg' },
    { nameAr: 'أ. د/ مصطفى عطية محي عبد الجواد', nameEn: 'Prof. Dr. Mostafa Attia Mohi Abd El-Gawad', degree: 'أستاذ', specializationAr: 'ترميم وصيانة الصور الزيتية والفنية وكشف تزوير الآثار', specializationEn: 'Restoration and Conservation of Oil and Artistic Paintings and Detection of Artifact Forgery', email: 'mostafaattia@yahoo.com', photoUrl: 'CV/Images/drMostafaAttia.gif' },
    { nameAr: 'أ. د/ وفاء أنور محمد سليمان', nameEn: 'Prof. Dr. Wafaa Anwar Mohamed Soliman', degree: 'أستاذ', specializationAr: 'ترميم وصيانة الآثار والمشغولات المعدنية', specializationEn: 'Restoration and Conservation of Artifacts and Metal Objects', email: 'wafaaanw@yahoo.com', photoUrl: 'CV/Images/drWafaaAnwar.gif' },
    { nameAr: 'أ. د/ جمعة محمد عبد المقصود', nameEn: 'Prof. Dr. Gomaa Mohamed Abd El-Maksoud', degree: 'أستاذ', specializationAr: 'علاج وصيانة المخطوطات والمواد العضوية', specializationEn: 'Treatment and Conservation of Manuscripts and Organic Materials', email: 'gomaaabdelmaksoud@yahoo.com', photoUrl: 'CV/Images/drGomaa.gif' },
    { nameAr: 'أ. د/ عاطف عبد اللطيف عبد السميع', nameEn: 'Prof. Dr. Atef Abd El-Latif Abd El-Samee', degree: 'أستاذ', specializationAr: 'علاج وصيانة النقوش والرسوم والصور الجدارية', specializationEn: 'Treatment and Conservation of Inscriptions, Drawings and Mural Paintings', email: 'atefbran@yahoo.com', photoUrl: 'CV/Images/drAtef.gif', adminRole: 'رئيس قسم ترميم الآثار' },
    { nameAr: 'أ. د/ هالة عفيفي محمود محمد', nameEn: 'Prof. Dr. Hala Affifi Mahmoud Mohamed', degree: 'أستاذ', specializationAr: 'تقنيات وعلاج وصيانة الآثار الجصية وأعمال النحت والاستنساخ', specializationEn: 'Techniques and Treatment and Conservation of Plaster Artifacts, Sculpture and Reproduction', email: 'halaafifi11@hotmail.com', photoUrl: 'CV/Images/drHala.jpg' },
    { nameAr: 'أ. د/ رمضان عوض رمضان عبد الله', nameEn: 'Prof. Dr. Ramadan Awad Ramadan Abdullah', degree: 'أستاذ', specializationAr: 'ترميم الآثار الزجاجية', specializationEn: 'Restoration of Glass Artifacts', email: null, photoUrl: 'CV/Images/drRamadan.jpg' },
  ];

  facCount = 0;
  for (let i = 0; i < conservationFaculty.length; i++) {
    const f = conservationFaculty[i];
    const existing = await prisma.facultyMember.findFirst({
      where: { nameAr: f.nameAr, departmentId: deptMap['conservation'] },
    });
    if (!existing) {
      await prisma.facultyMember.create({
        data: {
          departmentId: deptMap['conservation'],
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          degree: mapDegree(f.degree),
          specializationAr: f.specializationAr ?? null,
          specializationEn: f.specializationEn ?? null,
          email: f.email ?? null,
          photoUrl: f.photoUrl ?? null,
          adminRole: (f as any).adminRole ?? null,
          orderIndex: i + 1,
          isActive: true,
        },
      });
      facCount++;
    }
  }
  console.log(`  ✅ Conservation faculty: ${facCount} members added`);

  // ── Department: Greco-Roman (قسم الآثار اليونانية الرومانية) ────────────
  const grecoRomanFaculty = [
    { nameAr: 'أ.د/ حسان إبراهيم عامر', nameEn: 'Prof. Dr. Hassan Ibrahim Amer', degree: 'أستاذ متفرغ', specializationAr: 'لغة مصرية في العصر البطلمي', specializationEn: 'Egyptian Language in the Ptolemaic Period', email: 'hass_amer@yahoo.com', photoUrl: 'CV/Images/drHassan.gif' },
    { nameAr: 'أ. د/ خالد غريب علي أحمد شاهين', nameEn: 'Prof. Dr. Khaled Gharib Ali Ahmed Shaheen', degree: 'أستاذ', specializationAr: 'آثار مصر في العصرين اليوناني والروماني', specializationEn: 'Egyptian Archaeology in the Greek and Roman Periods', email: 'khaled6820@outlook.com', photoUrl: 'CV/Images/drGharib.gif', adminRole: 'رئيس قسم الآثار اليونانية الرومانية' },
    { nameAr: 'أ. د. عبد الرحمن علي محمد عبد الرحمن', nameEn: 'Prof. Dr. Abd El-Rahman Ali Mohamed Abd El-Rahman', degree: 'أستاذ', specializationAr: 'آثار مصر في العصرين البطلمي والروماني', specializationEn: 'Egyptian Archaeology in the Ptolemaic and Roman Periods', email: 'sihawary@cu.edu.eg', photoUrl: 'CV/Images/drAbdelrahman.gif' },
    { nameAr: 'د. مني جبر عبد النبي حسنين', nameEn: 'Dr. Mona Gabr Abd El-Naby Hassanin', degree: 'أستاذ مساعد', specializationAr: 'فنون مصرية خلال العصرين البطلمي والروماني', specializationEn: 'Egyptian Arts during the Ptolemaic and Roman Periods', email: 'monagabr@hotmail.com', photoUrl: 'CV/Images/drMonaGabr.gif' },
    { nameAr: 'د. نيفين يحيي محمد أحمد', nameEn: 'Dr. Nivin Yahya Mohamed Ahmed', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة', specializationEn: 'Ancient Egyptian Archaeology', email: 'Ainelhaya1@yahoo.com', photoUrl: null },
    { nameAr: 'د. فاطمة الزهراء عليوة عليوة', nameEn: 'Dr. Fatma El-Zahraa Aliwwa Aliwwa', degree: 'مدرس', specializationAr: 'آثار مصرية قديمة عصر متأخر الى العصر اليوناني', specializationEn: 'Ancient Egyptian Archaeology from Late Period to the Greek Period', email: 'Fatmaalzahraa75@yahoo.com', photoUrl: null },
    { nameAr: 'أ. أسماء ممدوح عبد الستار حنفي', nameEn: 'Asst. Asma Mamdouh Abd El-Sattar Hanafi', degree: 'مدرس مساعد', specializationAr: 'تاريخ وآثار مصر في العصر اليوناني الروماني', specializationEn: 'History and Archaeology of Egypt in the Greco-Roman Period', email: null, photoUrl: null },
    { nameAr: 'أ. احمد نبيل نجيب عبد الباقي', nameEn: 'Asst. Ahmed Nabil Nagib Abd El-Baqi', degree: 'مدرس مساعد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. اشرف عادل سعد عبد السلام', nameEn: 'Asst. Ashraf Adel Saad Abd El-Salam', degree: 'مدرس مساعد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. هدير كمال سعداوي إبراهيم', nameEn: 'Asst. Hadir Kamal Sadawy Ibrahim', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. احمد إبراهيم محمد محمود موسى', nameEn: 'Asst. Ahmed Ibrahim Mohamed Mahmoud Moussa', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. سماح عبد اللطيف محمد عبد اللطيف', nameEn: 'Asst. Samah Abd El-Latif Mohamed Abd El-Latif', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. مرفت حمدي مصطفى محمد على', nameEn: 'Asst. Marfat Hamdi Mostafa Mohamed Ali', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. أيمان جمال عبد الجواد إبراهيم', nameEn: 'Asst. Ayman Gamal Abd El-Gawad Ibrahim', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
    { nameAr: 'أ. مصطفى اشرف عبد الفتاح عبد العزيز', nameEn: 'Asst. Mostafa Ashraf Abd El-Fattah Abd El-Aziz', degree: 'معيد', specializationAr: null, specializationEn: null, email: null, photoUrl: null },
  ];

  facCount = 0;
  for (let i = 0; i < grecoRomanFaculty.length; i++) {
    const f = grecoRomanFaculty[i];
    const existing = await prisma.facultyMember.findFirst({
      where: { nameAr: f.nameAr, departmentId: deptMap['greco-roman'] },
    });
    if (!existing) {
      await prisma.facultyMember.create({
        data: {
          departmentId: deptMap['greco-roman'],
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          degree: mapDegree(f.degree),
          specializationAr: f.specializationAr ?? null,
          specializationEn: f.specializationEn ?? null,
          email: f.email ?? null,
          photoUrl: f.photoUrl ?? null,
          adminRole: (f as any).adminRole ?? null,
          orderIndex: i + 1,
          isActive: true,
        },
      });
      facCount++;
    }
  }
  console.log(`  ✅ Greco-Roman faculty: ${facCount} members added`);

  const totalFaculty = await prisma.facultyMember.count();
  console.log(`\n  👨‍🏫 Total faculty members in DB: ${totalFaculty}`);

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY 3: CONFERENCES
  // Source: conferences.html — 10 authentic conferences with real dates
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n🎓 CATEGORY 3: Conferences...');

  const conferences = [
    {
      slug: 'silk-road-1990',
      number: 1,
      titleAr: 'الدراسة الشاملة لطرق الحرير طرق الحوار (اليونسكو) - الندوة العلمية العالمية بالقاهرة - العلاقات الثقافية بين مصر وبلاد طرق الحرير',
      titleEn: 'Comprehensive Study of the Silk Roads / Roads of Dialogue (UNESCO) - Global Scientific Seminar in Cairo - Cultural Relations between Egypt and Silk Road Countries',
      themeAr: 'العلاقات الثقافية بين مصر وبلاد طرق الحرير',
      themeEn: 'Cultural Relations between Egypt and Silk Road Countries',
      startDate: new Date('1990-11-04'),
      endDate: new Date('1990-11-05'),
      status: ConferenceStatus.completed,
    },
    {
      slug: 'giza-through-ages-2008',
      number: 2,
      titleAr: 'المؤتمر الدولي الجيزة عبر العصور دراسات في الآثار والترميم والبيئة والسياحة',
      titleEn: 'International Conference: Giza Through the Ages — Studies in Archaeology, Conservation, Environment and Tourism',
      themeAr: 'دراسات في الآثار والترميم والبيئة والسياحة',
      themeEn: 'Studies in Archaeology, Conservation, Environment and Tourism',
      startDate: new Date('2008-03-04'),
      endDate: new Date('2008-03-06'),
      status: ConferenceStatus.completed,
    },
    {
      slug: 'civilizational-contributions-2010',
      number: 3,
      titleAr: 'المؤتمر الدولي الثالث لكلية الآثار الإسهامات الحضارية وأثرها في الحضارة الإنسانية على مر العصور',
      titleEn: '3rd International Conference of the Faculty of Archaeology: Civilizational Contributions and Their Impact on Human Civilization Through the Ages',
      themeAr: 'الإسهامات الحضارية وأثرها في الحضارة الإنسانية',
      themeEn: 'Civilizational Contributions and Their Impact on Human Civilization',
      startDate: new Date('2010-04-17'),
      endDate: new Date('2010-04-19'),
      status: ConferenceStatus.completed,
    },
    {
      slug: 'egyptian-sciences-2012',
      number: 4,
      titleAr: 'المؤتمر الدولي الثاني للعلوم المصرية عبر العصور',
      titleEn: '2nd International Conference of Egyptian Sciences Through the Ages',
      themeAr: 'العلوم المصرية عبر العصور',
      themeEn: 'Egyptian Sciences Through the Ages',
      startDate: new Date('2012-10-09'),
      endDate: new Date('2012-10-11'),
      status: ConferenceStatus.completed,
    },
    {
      slug: 'iciae-2013',
      number: 5,
      titleAr: 'المؤتمر الدولي الأول للآثار الإسلامية في المشرق الإسلامي',
      titleEn: '1st International Conference for Islamic Archaeology in the Islamic East (ICIAE)',
      themeAr: 'الآثار الإسلامية في المشرق الإسلامي',
      themeEn: 'Islamic Archaeology in the Islamic East',
      startDate: new Date('2013-12-08'),
      endDate: new Date('2013-12-12'),
      bannerArUrl: 'http://iciae.cu.edu.eg/',
      bannerEnUrl: 'http://iciae.cu.edu.eg/',
      status: ConferenceStatus.completed,
    },
    {
      slug: 'egypt-mediterranean-2014',
      number: 6,
      titleAr: 'المؤتمر الدولي الأول "مصر ودول حوض البحر المتوسط عبر العصور"',
      titleEn: '1st International Conference: Egypt and Mediterranean Countries Through the Ages',
      themeAr: 'مصر ودول حوض البحر المتوسط عبر العصور',
      themeEn: 'Egypt and Mediterranean Countries Through the Ages',
      startDate: new Date('2014-10-15'),
      endDate: new Date('2014-10-18'),
      bannerArUrl: 'http://emcta.fa-arch.cu.edu.eg/',
      status: ConferenceStatus.completed,
    },
    {
      slug: 'archaeological-sites-2015',
      number: 7,
      titleAr: 'المؤتمر الدولي الأول المواقع الأثرية والمجموعات المتحفية : القيم والمشاكل والحلول',
      titleEn: '1st International Conference: Archaeological Sites and Museum Collections — Values, Problems and Solutions',
      themeAr: 'المواقع الأثرية والمجموعات المتحفية: القيم والمشاكل والحلول',
      themeEn: 'Archaeological Sites and Museum Collections: Values, Problems and Solutions',
      startDate: new Date('2015-10-21'),
      endDate: new Date('2015-10-24'),
      bannerArUrl: 'http://asmc.fa-arch.cu.edu.eg/',
      status: ConferenceStatus.completed,
    },
    {
      slug: 'pottery-ceramics-2016',
      number: 8,
      titleAr: 'الندوة العلمية الرابعة "الفخار والخزف عبر العصور"',
      titleEn: '4th Scientific Seminar: Pottery and Ceramics Through the Ages',
      themeAr: 'الفخار والخزف عبر العصور',
      themeEn: 'Pottery and Ceramics Through the Ages',
      startDate: new Date('2016-05-10'),
      endDate: new Date('2016-05-10'),
      status: ConferenceStatus.completed,
    },
    {
      slug: 'ahcw-2017',
      number: 9,
      titleAr: 'المؤتمر الدولي الخامس الآثار والتراث في عالم متغير',
      titleEn: '5th International Conference: Archaeology and Heritage in a Changing World (AHCW)',
      themeAr: 'الآثار والتراث في عالم متغير',
      themeEn: 'Archaeology and Heritage in a Changing World',
      startDate: new Date('2017-10-29'),
      endDate: new Date('2017-10-31'),
      bannerArUrl: 'http://fa-arch.cu.edu.eg/AHCW',
      status: ConferenceStatus.completed,
    },
    {
      slug: 'aharc-2018',
      number: 10,
      titleAr: 'المؤتمر الدولي السادس الآثار والتراث : الأصالة والمخاطر والتحديات',
      titleEn: '6th International Conference: Archaeology and Heritage — Authenticity, Risks and Challenges (AHARC)',
      themeAr: 'الأصالة والمخاطر والتحديات',
      themeEn: 'Authenticity, Risks and Challenges',
      startDate: new Date('2018-12-02'),
      endDate: new Date('2018-12-04'),
      bannerArUrl: 'http://fa-arch.cu.edu.eg/aharc/',
      status: ConferenceStatus.completed,
    },
  ];

  let confCount = 0;
  for (const conf of conferences) {
    const existing = await prisma.conference.findUnique({ where: { slug: conf.slug } });
    if (!existing) {
      await prisma.conference.create({ data: conf });
      confCount++;
      console.log(`  ✅ Conference: ${conf.slug}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${conf.slug}`);
    }
  }
  console.log(`\n  🎓 Total conferences migrated: ${confCount}`);

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY 4: NEWS ITEMS
  // Source: news.html — authentic news articles from the faculty
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n📰 CATEGORY 4: News Items...');

  const newsItems = [
    {
      titleAr: 'فتح باب الالتماسات لنتائج الدراسات العليا',
      titleEn: 'Postgraduate Results Appeals Portal Opens',
      bodyAr: 'سيتم فتح باب الالتماسات لمرحلة الدراسات العليا بداية من يوم الثلاثاء المقبل 6/2/2024 وحتى يوم الأحد الموافق 11/2/2024',
      bodyEn: 'The appeals portal for postgraduate results will be open starting Tuesday 6/2/2024 until Sunday 11/2/2024.',
      category: NewsCategory.academic,
      isPublished: true,
      publishedAt: new Date('2024-02-02'),
    },
    {
      titleAr: 'الإعلان عن نتائج الدراسات العليا',
      titleEn: 'Postgraduate Results Announced',
      bodyAr: 'تم الإعلان عن نتائج جميع برامج الدراسات العليا على موقع الكلية - لمعرفة النتيجة اضغط هنا: http://fa-arch.cu.edu.eg/ExamResultsPost.html',
      bodyEn: 'Results for all postgraduate programs have been announced on the Faculty website.',
      category: NewsCategory.academic,
      isPublished: true,
      publishedAt: new Date('2024-01-30'),
    },
    {
      titleAr: 'الدورات التدريبية لمركز صيانة الآثار',
      titleEn: 'Training Courses at the Conservation Center',
      bodyAr: `السادة الزملاء الكرام المسجلين في الدورات التدريبية التي سوف يعقدها مركز صيانة الآثار والمباني التاريخية ومقتنيات المتاحف الأسبوع القادم وهي:
- مفردات اللغة المصرية القديمة
- الأشعة السينية في مجال لآثار
- الفلك في مصر القديمة
- تطبيقات النانو في مجال الآثار

رجاء التكرم بإرسال البيانات الاتية في ملف ورد على رقم الواتس التالي: 01000624695
الاسم بالكامل – رقم الهاتف – الرقم القومي – الاميل الشخصي – الوظيفة

وسوف يتم إرسال كود الدفع في رسالة على الهاتف.

مع خالص تحياتي
أ.د. مايسة علي
مدير مركز صيانة الآثار والمباني التاريخية ومقتنيات المتاحف`,
      bodyEn: `Training courses to be held by the Conservation Center for Antiquities, Historic Buildings and Museum Collections next week:
- Ancient Egyptian Language Vocabulary
- X-rays in the Field of Archaeology
- Astronomy in Ancient Egypt
- Nano Applications in the Field of Archaeology

With best regards,
Prof. Dr. Maysaa Ali
Director, Conservation Center for Antiquities, Historic Buildings and Museum Collections`,
      category: NewsCategory.academic,
      isPublished: true,
      publishedAt: new Date('2024-01-29'),
    },
    {
      titleAr: 'الانتهاء من امتحانات الفصل الدراسي الأول 2023/2024',
      titleEn: 'Completion of First Semester Exams 2023/2024',
      bodyAr: `لحمد لله، انتهت اليوم الأربعاء الموافق 24/1/2024 أعمال الامتحانات لمرحلتي البكالوريوس والدراسات العليا بصورة مميزة ومشرفة لكلية الآثار وجامعة القاهرة حيث أدى الطلاب امتحاناتهم في أجواء من الهدوء والتركيز والانضباط ونظام. لذلك يسعدني أن أتقدم بجزيل التقدير والشكر لمعالي رئيس الجامعة أ.د/ محمد عثمان الخشت الموقر على متابعته المستمرة لمنظومة الامتحانات بكلية الآثار لحظة بلحظة، وسعادة أ.د/ أحمد رجب نائب رئيس جامعة القاهرة لشئون التعليم والطلاب وسعادة أ.د.محمود السعيد نائب رئيس الجامعة لشئون الدراسات العليا والبحوث على دعمهما الكامل والمستمر لكليتنا الحبيبة.`,
      bodyEn: `Praise be to Allah, the first semester exams for both undergraduate and postgraduate levels have successfully concluded on Wednesday 24/1/2024 in a distinguished and honorable manner for the Faculty of Archaeology and Cairo University. Students conducted their examinations in an atmosphere of calm, focus, discipline and order.`,
      category: NewsCategory.academic,
      isPublished: true,
      publishedAt: new Date('2024-01-24'),
    },
  ];

  let newsCount = 0;
  for (const item of newsItems) {
    const existing = await prisma.news.findFirst({
      where: { titleAr: item.titleAr },
    });
    if (!existing) {
      await prisma.news.create({
        data: {
          ...item,
          authorId: admin.id,
        },
      });
      newsCount++;
      console.log(`  ✅ News: ${item.titleAr.slice(0, 50)}...`);
    }
  }
  console.log(`\n  📰 Total news items migrated: ${newsCount}`);

  // ═══════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  const finalPages = await prisma.page.count();
  const finalFaculty = await prisma.facultyMember.count();
  const finalConferences = await prisma.conference.count();
  const finalNews = await prisma.news.count();

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  ✅  DATA MIGRATION COMPLETE — Faculty of Archaeology');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Static Pages      : ${finalPages}`);
  console.log(`  Faculty Members   : ${finalFaculty}`);
  console.log(`  Conferences       : ${finalConferences}`);
  console.log(`  News Items        : ${finalNews}`);
  console.log('══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
