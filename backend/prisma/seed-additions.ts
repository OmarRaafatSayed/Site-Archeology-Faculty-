/**
 * SEED DATA ADDITIONS FOR MISSING FEATURES
 * Add these sections to the main seed.ts file
 */

import { PrismaClient, ServiceCategory, ExcavationStatus, AgreementType, LinkCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ─── 1. QUALITY ASSURANCE SEED DATA ───────────────────────────────────────────

async function seedQualityAssurance() {
  console.log('📊 Seeding Quality Assurance data...');

  // Quality Assurance page
  await prisma.page.upsert({
    where: { slug: 'quality-assurance' },
    update: {},
    create: {
      slug: 'quality-assurance',
      titleAr: 'وحدة ضمان الجودة والاعتماد',
      titleEn: 'Quality Assurance and Accreditation Unit',
      contentAr: 'تهدف وحدة ضمان الجودة والاعتماد إلى تحسين وتطوير الأداء المؤسسي بالكلية.',
      contentEn: 'The Quality Assurance and Accreditation Unit aims to improve and develop institutional performance.',
    },
  });

  console.log('✅ Quality Assurance page created');
}

// ─── 2. STUDENT SERVICES SEED DATA ────────────────────────────────────────────

async function seedStudentServices() {
  console.log('🎓 Seeding Student Services data...');

  const services = [
    {
      category: ServiceCategory.bookstore,
      titleAr: 'بيع الكتب',
      titleEn: 'Bookstore',
      descriptionAr: 'يوفر مكتب بيع الكتب بالكلية جميع الكتب والمراجع اللازمة للطلاب',
      descriptionEn: 'The faculty bookstore provides all necessary books and references for students',
      iconName: 'book',
      orderIndex: 1,
    },
    {
      category: ServiceCategory.youth_care,
      titleAr: 'رعاية الشباب',
      titleEn: 'Youth Care',
      descriptionAr: 'تقدم إدارة رعاية الشباب مجموعة متنوعة من الأنشطة الطلابية',
      descriptionEn: 'Youth care management provides a variety of student activities',
      iconName: 'users',
      orderIndex: 2,
    },
    {
      category: ServiceCategory.training,
      titleAr: 'التدريب العملي والزيارات',
      titleEn: 'Practical Training and Visits',
      descriptionAr: 'برنامج التدريب العملي يشمل زيارات ميدانية للمواقع الأثرية',
      descriptionEn: 'Practical training program includes field visits to archaeological sites',
      iconName: 'map',
      orderIndex: 3,
    },
    {
      category: ServiceCategory.cultural,
      titleAr: 'المواسم الثقافية',
      titleEn: 'Cultural Seasons',
      descriptionAr: 'تنظيم ندوات ومحاضرات ثقافية على مدار العام',
      descriptionEn: 'Organizing cultural seminars and lectures throughout the year',
      iconName: 'calendar',
      orderIndex: 4,
    },
    {
      category: ServiceCategory.clubs,
      titleAr: 'الأندية الطلابية',
      titleEn: 'Student Clubs',
      descriptionAr: 'مجموعة من الأندية الطلابية في مجالات متنوعة',
      descriptionEn: 'Various student clubs in different fields',
      iconName: 'star',
      orderIndex: 5,
    },
  ];

  for (const service of services) {
    await prisma.studentService.create({ data: service });
    console.log(`✅ Service: ${service.titleAr}`);
  }
}

// ─── 3. EXCAVATION SITES SEED DATA ────────────────────────────────────────────

async function seedExcavationSites(departmentIds: Record<string, string>) {
  console.log('🏛️ Seeding Excavation Sites data...');

  const sites = [
    {
      slug: 'saqqara',
      nameAr: 'حفائر سقارة',
      nameEn: 'Saqqara Excavations',
      descriptionAr: 'موقع حفائر الكلية بمنطقة سقارة الأثرية، أحد أهم المواقع الأثرية في مصر',
      descriptionEn: 'Faculty excavation site at Saqqara archaeological area, one of Egypt\'s most important sites',
      departmentId: departmentIds['egyptology'],
      location: 'سقارة، الجيزة',
      startYear: 1975,
      status: ExcavationStatus.active,
      externalUrl: 'http://saqqara.fa-arch.cu.edu.eg',
      teamLeaderAr: 'أ.د. عميد الكلية',
      teamLeaderEn: 'Prof. Dr. Faculty Dean',
      orderIndex: 1,
    },
    {
      slug: 'anbiba',
      nameAr: 'حفائر عنبية',
      nameEn: 'Anbiba Excavations',
      descriptionAr: 'موقع حفائر عنبية بالنوبة',
      descriptionEn: 'Anbiba excavation site in Nubia',
      departmentId: departmentIds['egyptology'],
      location: 'النوبة، أسوان',
      startYear: 1980,
      status: ExcavationStatus.active,
      orderIndex: 2,
    },
    {
      slug: 'pyramids-area',
      nameAr: 'حفائر منطقة الأهرامات',
      nameEn: 'Pyramids Area Excavations',
      descriptionAr: 'حفائر منطقة الأهرامات بالجيزة',
      descriptionEn: 'Excavations in the Pyramids area, Giza',
      departmentId: departmentIds['egyptology'],
      location: 'الجيزة',
      startYear: 1985,
      status: ExcavationStatus.active,
      orderIndex: 3,
    },
    {
      slug: 'tuna-el-gebel',
      nameAr: 'حفائر تونة الجبل',
      nameEn: 'Tuna el-Gebel Excavations',
      descriptionAr: 'موقع تونة الجبل الأثري',
      descriptionEn: 'Tuna el-Gebel archaeological site',
      departmentId: departmentIds['egyptology'],
      location: 'المنيا',
      startYear: 1990,
      status: ExcavationStatus.active,
      orderIndex: 4,
    },
    {
      slug: 'arab-el-hisn',
      nameAr: 'حفائر عرب الحصن',
      nameEn: 'Arab el-Hisn Excavations',
      descriptionAr: 'موقع عرب الحصن الأثري',
      descriptionEn: 'Arab el-Hisn archaeological site',
      departmentId: departmentIds['egyptology'],
      location: 'الشرقية',
      startYear: 1995,
      status: ExcavationStatus.active,
      orderIndex: 5,
    },
    {
      slug: 'mit-rahina',
      nameAr: 'حفائر ميت رهينة',
      nameEn: 'Mit Rahina Excavations',
      descriptionAr: 'موقع ميت رهينة (منف القديمة)',
      descriptionEn: 'Mit Rahina site (Ancient Memphis)',
      departmentId: departmentIds['egyptology'],
      location: 'الجيزة',
      startYear: 1988,
      status: ExcavationStatus.active,
      orderIndex: 6,
    },
    {
      slug: 'abu-sir',
      nameAr: 'حفائر أبو صير',
      nameEn: 'Abu Sir Excavations',
      descriptionAr: 'موقع أبو صير الأثري',
      descriptionEn: 'Abu Sir archaeological site',
      departmentId: departmentIds['egyptology'],
      location: 'الجيزة',
      startYear: 1992,
      status: ExcavationStatus.active,
      orderIndex: 7,
    },
    {
      slug: 'fustat',
      nameAr: 'حفائر الفسطاط',
      nameEn: 'Fustat Excavations',
      descriptionAr: 'موقع الفسطاط - الآثار الإسلامية',
      descriptionEn: 'Fustat site - Islamic Archaeology',
      departmentId: departmentIds['islamic'],
      location: 'القاهرة',
      startYear: 1998,
      status: ExcavationStatus.active,
      orderIndex: 8,
    },
    {
      slug: 'qasr-el-ainy',
      nameAr: 'حفائر القصر العيني',
      nameEn: 'Qasr el-Ainy Excavations',
      descriptionAr: 'موقع القصر العيني - الآثار الإسلامية',
      descriptionEn: 'Qasr el-Ainy site - Islamic Archaeology',
      departmentId: departmentIds['islamic'],
      location: 'القاهرة',
      startYear: 2000,
      status: ExcavationStatus.active,
      orderIndex: 9,
    },
  ];

  for (const site of sites) {
    await prisma.excavationSite.create({ data: site });
    console.log(`✅ Excavation Site: ${site.nameAr}`);
  }
}

// ─── 4. SPECIAL PROGRAMS SEED DATA ────────────────────────────────────────────

async function seedSpecialPrograms() {
  console.log('🎓 Seeding Special Programs data...');

  const programs = [
    {
      slug: 'ais',
      nameAr: 'برنامج نظم المعلومات الأثرية',
      nameEn: 'Archaeological Information Systems Program',
      descriptionAr: 'برنامج متخصص في تطبيق تكنولوجيا المعلومات في مجال الآثار',
      descriptionEn: 'Specialized program in applying information technology in archaeology',
      programType: 'undergraduate',
      durationYears: 4,
      creditHours: 144,
      externalUrl: 'http://fa-arch.cu.edu.eg/ais',
      orderIndex: 1,
    },
    {
      slug: 'archaeological-guidance',
      nameAr: 'برنامج الإرشاد الأثري',
      nameEn: 'Archaeological Guidance Program',
      descriptionAr: 'برنامج متخصص في إعداد المرشدين الأثريين المحترفين',
      descriptionEn: 'Specialized program for preparing professional archaeological guides',
      programType: 'undergraduate',
      durationYears: 4,
      creditHours: 144,
      externalUrl: 'http://fa-arch.cu.edu.eg/ag',
      orderIndex: 2,
    },
  ];

  for (const program of programs) {
    await prisma.specialProgram.create({ data: program });
    console.log(`✅ Special Program: ${program.nameAr}`);
  }
}

// ─── 5. RESEARCH CENTERS SEED DATA ────────────────────────────────────────────

async function seedResearchCenters() {
  console.log('🏛️ Seeding Research Centers data...');

  const centers = [
    {
      slug: 'conservation-center',
      nameAr: 'مركز صيانة الآثار والمباني التاريخية ومقتنيات المتاحف',
      nameEn: 'Conservation Center for Monuments, Historic Buildings and Museum Collections',
      descriptionAr: 'مركز متخصص في ترميم وصيانة الآثار تأسس عام 1996',
      descriptionEn: 'Specialized center for restoration and conservation of antiquities, established in 1996',
      location: 'كلية الآثار - جامعة القاهرة',
      externalUrl: 'http://cca-arch.cu.edu.eg',
      orderIndex: 1,
    },
    {
      slug: 'luxor-center',
      nameAr: 'مركز الدراسات الأثرية بالأقصر',
      nameEn: 'Archaeological Studies Center in Luxor',
      descriptionAr: 'مركز للدراسات والبحوث الأثرية بمدينة الأقصر',
      descriptionEn: 'Center for archaeological studies and research in Luxor',
      location: 'الأقصر',
      orderIndex: 2,
    },
    {
      slug: 'museum',
      nameAr: 'متحف كلية الآثار',
      nameEn: 'Faculty of Archaeology Museum',
      descriptionAr: 'متحف يضم أكثر من 3500 قطعة أثرية من مختلف العصور',
      descriptionEn: 'Museum housing over 3500 artifacts from various periods',
      location: 'كلية الآثار - جامعة القاهرة',
      externalUrl: 'http://museum.fa-arch.cu.edu.eg',
      orderIndex: 3,
    },
  ];

  for (const center of centers) {
    await prisma.researchCenter.create({ data: center });
    console.log(`✅ Research Center: ${center.nameAr}`);
  }
}

// ─── 6. EXTERNAL LINKS SEED DATA ──────────────────────────────────────────────

async function seedExternalLinks() {
  console.log('🔗 Seeding External Links data...');

  const links = [
    // Academic Systems
    {
      category: LinkCategory.academic_system,
      nameAr: 'بلاك بورد - جامعة القاهرة',
      nameEn: 'Cairo University Blackboard',
      url: 'https://cu.blackboard.com/',
      iconName: 'graduation-cap',
      orderIndex: 1,
    },
    // Social Media
    {
      category: LinkCategory.social_media,
      nameAr: 'فيسبوك',
      nameEn: 'Facebook',
      url: 'https://www.facebook.com/CUArchaeology',
      iconName: 'facebook',
      orderIndex: 1,
    },
    {
      category: LinkCategory.social_media,
      nameAr: 'تويتر',
      nameEn: 'Twitter',
      url: 'https://twitter.com/FaArcho',
      iconName: 'twitter',
      orderIndex: 2,
    },
    {
      category: LinkCategory.social_media,
      nameAr: 'يوتيوب',
      nameEn: 'YouTube',
      url: 'https://www.youtube.com/channel/UCKoD4fuWbqLe9Vey-qv33XQ',
      iconName: 'youtube',
      orderIndex: 3,
    },
    // Libraries
    {
      category: LinkCategory.library,
      nameAr: 'مكتبات الجامعات المصرية',
      nameEn: 'Egyptian Universities Libraries',
      url: 'http://www.eul.edu.eg',
      iconName: 'library',
      orderIndex: 1,
    },
    {
      category: LinkCategory.library,
      nameAr: 'مكتبة IEEE',
      nameEn: 'IEEE Library',
      url: 'http://ieeexplore.ieee.org/Xplore/home.jsp',
      iconName: 'book',
      orderIndex: 2,
    },
    {
      category: LinkCategory.library,
      nameAr: 'مكتبة Science Direct',
      nameEn: 'Science Direct Library',
      url: 'http://www.sciencedirect.com',
      iconName: 'book',
      orderIndex: 3,
    },
    // External Resources
    {
      category: LinkCategory.external_resource,
      nameAr: 'موقع جامعة القاهرة',
      nameEn: 'Cairo University Website',
      url: 'http://cu.edu.eg',
      iconName: 'globe',
      orderIndex: 1,
    },
  ];

  for (const link of links) {
    await prisma.externalLink.create({ data: link });
    console.log(`✅ External Link: ${link.nameAr}`);
  }
}

// ─── 7. COMMUNITY SERVICE SEED DATA ───────────────────────────────────────────

async function seedCommunityService() {
  console.log('🤝 Seeding Community Service data...');

  await prisma.page.upsert({
    where: { slug: 'community-service' },
    update: {},
    create: {
      slug: 'community-service',
      titleAr: 'قطاع خدمة المجتمع وتنمية البيئة',
      titleEn: 'Community Service and Environmental Development Sector',
      contentAr: 'يهدف القطاع إلى تفعيل دور الكلية في خدمة المجتمع وتنمية البيئة',
      contentEn: 'The sector aims to activate the faculty\'s role in community service and environmental development',
    },
  });

  console.log('✅ Community Service page created');
}

// ─── 8. PROTOCOLS & AGREEMENTS SEED DATA ──────────────────────────────────────

async function seedProtocolsPage() {
  console.log('📜 Seeding Protocols page...');

  await prisma.page.upsert({
    where: { slug: 'protocols-agreements' },
    update: {},
    create: {
      slug: 'protocols-agreements',
      titleAr: 'الاتفاقيات والبروتوكولات الدولية',
      titleEn: 'International Agreements and Protocols',
      contentAr: 'تسعى الكلية لتوطيد علاقاتها الدولية من خلال الاتفاقيات والبروتوكولات',
      contentEn: 'The faculty seeks to strengthen its international relations through agreements and protocols',
    },
  });

  console.log('✅ Protocols & Agreements page created');
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────

export async function seedMissingFeatures(departmentIds: Record<string, string>) {
  console.log('\n🌱 Seeding missing features data...\n');

  await seedQualityAssurance();
  await seedStudentServices();
  await seedExcavationSites(departmentIds);
  await seedSpecialPrograms();
  await seedResearchCenters();
  await seedExternalLinks();
  await seedCommunityService();
  await seedProtocolsPage();

  console.log('\n🎉 Missing features seed completed!\n');
}

