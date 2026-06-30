import { PrismaClient, UserRole, FacultyDegree, ProgramLevel, NewsCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DEMO seed with full data...');

  // Get existing departments
  const egyptology = await prisma.department.findFirst({ where: { slug: 'egyptology' } });
  const islamic = await prisma.department.findFirst({ where: { slug: 'islamic' } });
  const conservation = await prisma.department.findFirst({ where: { slug: 'conservation' } });
  const grecoRoman = await prisma.department.findFirst({ where: { slug: 'greco-roman' } });

  if (!egyptology || !islamic || !conservation || !grecoRoman) {
    console.log('❌ Please run basic seed first: npm run db:seed');
    process.exit(1);
  }

  // ─── 1. Faculty Members ───────────────────────────────────────────────────
  const facultyData = [
    {
      email: 'ahmed.hassan@fa-arch.cu.edu.eg',
      nameAr: 'د. أحمد حسن محمد',
      nameEn: 'Dr. Ahmed Hassan Mohamed',
      degree: FacultyDegree.assistant_professor,
      departmentId: egyptology.id,
      specializationAr: 'اللغة الهيروغليفية',
      specializationEn: 'Hieroglyphics',
    },
    {
      email: 'fatma.ali@fa-arch.cu.edu.eg',
      nameAr: 'أ.د. فاطمة علي إبراهيم',
      nameEn: 'Prof. Fatma Ali Ibrahim',
      degree: FacultyDegree.professor,
      departmentId: islamic.id,
      specializationAr: 'العمارة الإسلامية',
      specializationEn: 'Islamic Architecture',
    },
    {
      email: 'mohamed.salem@fa-arch.cu.edu.eg',
      nameAr: 'د. محمد سالم أحمد',
      nameEn: 'Dr. Mohamed Salem Ahmed',
      degree: FacultyDegree.lecturer,
      departmentId: conservation.id,
      specializationAr: 'ترميم المخطوطات',
      specializationEn: 'Manuscript Conservation',
    },
    {
      email: 'sara.mahmoud@fa-arch.cu.edu.eg',
      nameAr: 'د. سارة محمود حسن',
      nameEn: 'Dr. Sara Mahmoud Hassan',
      degree: FacultyDegree.assistant_professor,
      departmentId: grecoRoman.id,
      specializationAr: 'الآثار البطلمية',
      specializationEn: 'Ptolemaic Archaeology',
    },
  ];

  for (const faculty of facultyData) {
    const user = await prisma.user.upsert({
      where: { email: faculty.email },
      update: {},
      create: {
        email: faculty.email,
        passwordHash: await bcrypt.hash('Faculty@123', 12),
        role: UserRole.faculty,
      },
    });

    await prisma.facultyMember.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        departmentId: faculty.departmentId,
        nameAr: faculty.nameAr,
        nameEn: faculty.nameEn,
        degree: faculty.degree,
        specializationAr: faculty.specializationAr,
        specializationEn: faculty.specializationEn,
        email: faculty.email,
      },
    });
    console.log(`✅ Faculty: ${faculty.nameAr}`);
  }

  // ─── 2. Students ──────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const students = [
    { universityId: '2021170001', nameAr: 'أحمد محمود عبدالله', nameEn: 'Ahmed Mahmoud Abdullah', email: 'ahmed.m@st.fa-arch.cu.edu.eg', departmentId: egyptology.id, academicYear: 3, enrollmentYear: 2021 },
    { universityId: '2021170002', nameAr: 'منى حسن علي', nameEn: 'Mona Hassan Ali', email: 'mona.h@st.fa-arch.cu.edu.eg', departmentId: islamic.id, academicYear: 2, enrollmentYear: 2022 },
    { universityId: '2021170003', nameAr: 'خالد سعيد محمد', nameEn: 'Khaled Said Mohamed', email: 'khaled.s@st.fa-arch.cu.edu.eg', departmentId: conservation.id, academicYear: 4, enrollmentYear: 2020 },
    { universityId: '2021170004', nameAr: 'نورهان أحمد حسين', nameEn: 'Nourhan Ahmed Hussein', email: 'nourhan.a@st.fa-arch.cu.edu.eg', departmentId: grecoRoman.id, academicYear: 1, enrollmentYear: 2023 },
    { universityId: '2021170005', nameAr: 'عمر فتحي السيد', nameEn: 'Omar Fathy Elsayed', email: 'omar.f@st.fa-arch.cu.edu.eg', departmentId: egyptology.id, academicYear: 2, enrollmentYear: 2022 },
    { universityId: '2021170006', nameAr: 'هدى محمد إبراهيم', nameEn: 'Hoda Mohamed Ibrahim', email: 'hoda.m@st.fa-arch.cu.edu.eg', departmentId: islamic.id, academicYear: 3, enrollmentYear: 2021 },
  ];

  for (const student of students) {
    const user = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        email: student.email,
        username: student.universityId,
        universityId: student.universityId,
        passwordHash: await bcrypt.hash('Student@123', 12),
        role: UserRole.student,
      },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        universityId: student.universityId,
        departmentId: student.departmentId,
        nameAr: student.nameAr,
        nameEn: student.nameEn,
        academicYear: student.academicYear,
        enrollmentYear: student.enrollmentYear,
      },
    });
    console.log(`✅ Student: ${student.nameAr}`);
  }

  // ─── 3. News ──────────────────────────────────────────────────────────────
  const newsData = [
    {
      titleAr: 'افتتاح معرض الآثار المصرية القديمة',
      titleEn: 'Opening of the Ancient Egyptian Artifacts Exhibition',
      bodyAr: 'أعلنت كلية الآثار عن افتتاح معرض شامل للآثار المصرية القديمة يوم الأحد القادم، بمشاركة طلاب قسم الآثار المصرية. المعرض يشمل مجموعة نادرة من القطع الأثرية والنماذج التعليمية التي تعكس عظمة الحضارة المصرية القديمة.',
      bodyEn: 'The Faculty of Archaeology announced the opening of a comprehensive exhibition of ancient Egyptian artifacts next Sunday, with participation from students of the Egyptology department. The exhibition includes a rare collection of artifacts and educational models reflecting the greatness of ancient Egyptian civilization.',
      category: NewsCategory.general,
      isPublished: true,
      publishedAt: new Date('2024-06-20'),
    },
    {
      titleAr: 'مؤتمر الآثار الدولي السنوي',
      titleEn: 'Annual International Archaeology Conference',
      bodyAr: 'تستضيف كلية الآثار المؤتمر الدولي السنوي للآثار والحفائر في الفترة من 15-18 يوليو، بمشاركة أكثر من 150 باحثاً من 15 دولة حول العالم. سيناقش المؤتمر أحدث الاكتشافات الأثرية والأبحاث المتخصصة في مجالات علم الآثار.',
      bodyEn: 'The Faculty of Archaeology hosts the Annual International Conference on Archaeology and Excavations from July 15-18, with over 150 researchers from 15 countries worldwide. The conference will discuss the latest archaeological discoveries and specialized research in archaeology.',
      category: NewsCategory.conference,
      isPublished: true,
      publishedAt: new Date('2024-06-15'),
    },
    {
      titleAr: 'برنامج تدريبي في ترميم الآثار',
      titleEn: 'Training Program in Artifact Conservation',
      bodyAr: 'أعلن قسم ترميم الآثار عن افتتاح التسجيل في البرنامج التدريبي الصيفي المتخصص في تقنيات الترميم الحديثة للآثار، والذي سيقام على مدار شهر أغسطس. البرنامج يستهدف طلاب الكلية والخريجين الراغبين في تطوير مهاراتهم العملية.',
      bodyEn: 'The Conservation Department announced the opening of registration for the summer training program specialized in modern conservation techniques, to be held throughout August. The program targets faculty students and graduates who wish to develop their practical skills.',
      category: NewsCategory.academic,
      isPublished: true,
      publishedAt: new Date('2024-06-10'),
    },
    {
      titleAr: 'اكتشاف أثري جديد بالمنيا',
      titleEn: 'New Archaeological Discovery in Minya',
      bodyAr: 'شارك فريق من أساتذة وطلاب قسم الآثار المصرية في اكتشاف مقبرة فرعونية مهمة بمنطقة تونا الجبل بالمنيا، تعود للأسرة الثامنة عشر. الاكتشاف يضم مجموعة من النقوش والتماثيل النادرة التي تلقي الضوء على جوانب جديدة من الحياة اليومية في مصر القديمة.',
      bodyEn: 'A team of professors and students from the Egyptology department participated in discovering an important pharaonic tomb in Tuna el-Gebel, Minya, dating back to the 18th Dynasty. The discovery includes a collection of rare inscriptions and statues that shed light on new aspects of daily life in ancient Egypt.',
      category: NewsCategory.research,
      isPublished: true,
      publishedAt: new Date('2024-06-05'),
    },
    {
      titleAr: 'نتائج امتحانات الفصل الدراسي الثاني',
      titleEn: 'Second Semester Exam Results',
      bodyAr: 'أعلنت شؤون الطلاب عن نتائج امتحانات الفصل الدراسي الثاني لجميع الفرق الدراسية. يمكن للطلاب الاطلاع على النتائج من خلال البوابة الأكاديمية باستخدام الرقم الجامعي وكلمة المرور الخاصة بهم.',
      bodyEn: 'Student Affairs announced the second semester exam results for all academic levels. Students can view results through the academic portal using their university ID and password.',
      category: NewsCategory.student,
      isPublished: true,
      publishedAt: new Date('2024-06-01'),
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({ data: news });
    console.log(`✅ News: ${news.titleAr}`);
  }

  // ─── 4. Courses ───────────────────────────────────────────────────────────
  const currentAcademicYear = 2024;
  const courses = [
    {
      code: 'ARCH101',
      nameAr: 'مدخل إلى علم الآثار',
      nameEn: 'Introduction to Archaeology',
      descriptionAr: 'مقدمة شاملة لعلم الآثار ومناهج البحث الأثري',
      descriptionEn: 'Comprehensive introduction to archaeology and archaeological research methods',
      departmentId: egyptology.id,
      creditHours: 3,
      semester: 1,
      academicYear: currentAcademicYear,
    },
    {
      code: 'ARCH201',
      nameAr: 'اللغة الهيروغليفية المتقدمة',
      nameEn: 'Advanced Hieroglyphics',
      descriptionAr: 'دراسة متقدمة للغة المصرية القديمة والنصوص الهيروغليفية',
      descriptionEn: 'Advanced study of ancient Egyptian language and hieroglyphic texts',
      departmentId: egyptology.id,
      creditHours: 4,
      semester: 2,
      academicYear: currentAcademicYear,
    },
    {
      code: 'ISL101',
      nameAr: 'العمارة الإسلامية',
      nameEn: 'Islamic Architecture',
      descriptionAr: 'دراسة تطور العمارة الإسلامية عبر العصور',
      descriptionEn: 'Study of the development of Islamic architecture through the ages',
      departmentId: islamic.id,
      creditHours: 3,
      semester: 1,
      academicYear: currentAcademicYear,
    },
    {
      code: 'CON101',
      nameAr: 'أسس الترميم',
      nameEn: 'Conservation Fundamentals',
      descriptionAr: 'المبادئ الأساسية لترميم وصيانة الآثار',
      descriptionEn: 'Basic principles of artifact conservation and restoration',
      departmentId: conservation.id,
      creditHours: 3,
      semester: 1,
      academicYear: currentAcademicYear,
    },
    {
      code: 'GRC101',
      nameAr: 'اللغة اليونانية القديمة',
      nameEn: 'Ancient Greek Language',
      descriptionAr: 'أساسيات اللغة اليونانية القديمة وقراءة النصوص',
      descriptionEn: 'Fundamentals of ancient Greek language and text reading',
      departmentId: grecoRoman.id,
      creditHours: 3,
      semester: 1,
      academicYear: currentAcademicYear,
    },
  ];

  for (const course of courses) {
    await prisma.course.create({ data: course });
    console.log(`✅ Course: ${course.nameAr}`);
  }

  // ─── 5. Library Books ─────────────────────────────────────────────────────
  const books = [
    {
      libraryType: 'egyptology' as const,
      titleAr: 'تاريخ مصر القديمة',
      titleEn: 'History of Ancient Egypt',
      authorAr: 'سليم حسن',
      authorEn: 'Selim Hassan',
      isbn: '978-9771234567',
      publisher: 'دار الكتب المصرية',
      publishYear: 1992,
      copiesCount: 5,
      departmentId: egyptology.id,
    },
    {
      libraryType: 'islamic' as const,
      titleAr: 'العمارة الإسلامية في مصر',
      titleEn: 'Islamic Architecture in Egypt',
      authorAr: 'كريسويل',
      authorEn: 'Creswell',
      isbn: '978-9771234568',
      publisher: 'دار النهضة العربية',
      publishYear: 1995,
      copiesCount: 3,
      departmentId: islamic.id,
    },
    {
      libraryType: 'conservation' as const,
      titleAr: 'ترميم وصيانة الآثار',
      titleEn: 'Artifact Conservation and Restoration',
      authorAr: 'أحمد عبد الرازق',
      authorEn: 'Ahmed Abdel Razek',
      isbn: '978-9771234569',
      publisher: 'مكتبة الأنجلو المصرية',
      publishYear: 2005,
      copiesCount: 4,
      departmentId: conservation.id,
    },
  ];

  for (const book of books) {
    await prisma.libraryBook.create({ data: book });
    console.log(`✅ Book: ${book.titleAr}`);
  }

  // ─── 6. Conference ────────────────────────────────────────────────────────
  const conference = await prisma.conference.create({
    data: {
      slug: 'conf-2024-15',
      number: 15,
      titleAr: 'المؤتمر الدولي الخامس عشر للآثار',
      titleEn: '15th International Archaeology Conference',
      themeAr: 'الاكتشافات الأثرية الحديثة',
      themeEn: 'Modern Archaeological Discoveries',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-18'),
      status: 'upcoming' as const,
    },
  });
  console.log(`✅ Conference: ${conference.titleAr}`);

  console.log('\n🎉 Demo seed completed successfully!');
  console.log('📊 Data Summary:');
  console.log('   - 4 Faculty members');
  console.log('   - 6 Students');
  console.log('   - 5 News articles');
  console.log('   - 5 Courses');
  console.log('   - 3 Library books');
  console.log('   - 1 Conference');
  console.log('\n📧 Login Credentials:');
  console.log('   Admin:   admin@fa-arch.cu.edu.eg / Admin@12345');
  console.log('   Dean:    dean@fa-arch.cu.edu.eg  / Dean@12345');
  console.log('   Faculty: ahmed.hassan@fa-arch.cu.edu.eg / Faculty@123');
  console.log('   Student: ahmed.m@st.fa-arch.cu.edu.eg / Student@123');
}

main()
  .catch((err) => {
    console.error('❌ Demo seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
