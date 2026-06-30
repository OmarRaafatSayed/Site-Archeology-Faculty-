import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanName(rawName: string): { name: string; specialization: string } {
  // Remove common titles and ranks first
  let cleaned = rawName
    .replace(/أ\.د\.|أ\. د\./g, '')
    .replace(/د\./g, '')
    .replace(/أستاذ مساعد متفرغ/g, '')
    .replace(/أستاذ مساعد/g, '')
    .replace(/استاذ مساعد متفرغ/g, '')
    .replace(/استاذ مساعد/g, '')
    .replace(/استاذ متفرغ/g, '')
    .replace(/أستاذ متفرغ/g, '')
    .replace(/أستاذ/g, '')
    .replace(/استاذ/g, '')
    .replace(/مدرس متفرغ/g, '')
    .replace(/مدرس/g, '')
    .replace(/متفرغ/g, '')
    .trim();
  
  // List of specialization patterns (more comprehensive)
  const specializationPatterns = [
    // Conservation specializations
    { pattern: /الترميم المعماري والإنشائي للمباني الأثرية والتاريخية/g, spec: 'الترميم المعماري' },
    { pattern: /الترميم المعماري والحفاظ علي المباني والمواقع الأثرية/g, spec: 'الترميم المعماري' },
    { pattern: /ترميم المباني والآثار الحجرية/g, spec: 'ترميم الآثار الحجرية' },
    { pattern: /الترميم المعماري والانشائي للمباني والمواقع الاثرية والتاريخية/g, spec: 'الترميم المعماري' },
    { pattern: /ال المعماري والإنشائي للمباني الأثرية والتاريخية/g, spec: 'الترميم المعماري' },
    { pattern: /ال المعماري والانشائي للمباني والمواقع الاثرية والتاريخية/g, spec: 'الترميم المعماري' },
    { pattern: /ال المعماري والحفاظ علي المباني والمواقع الأثرية/g, spec: 'الترميم المعماري' },
    { pattern: /علاج وصيانة الصور الجدارية/g, spec: 'ترميم الصور الجدارية' },
    { pattern: /علاج وصيانة اللوحات الجدارية/g, spec: 'ترميم اللوحات الجدارية' },
    { pattern: /علاج وصيانة الآثار المعدنية/g, spec: 'ترميم الآثار المعدنية' },
    { pattern: /علاج وصيانة الآثار العضوية/g, spec: 'ترميم الآثار العضوية' },
    { pattern: /علاج وصيانة الآثار الحجرية/g, spec: 'ترميم الآثار الحجرية' },
    { pattern: /علاج وصيانة الآثار الجصية/g, spec: 'ترميم الآثار الجصية' },
    { pattern: /علاج وصيانة الآثار الفخارية والخزفية والسيراميك/g, spec: 'ترميم الفخار والخزف' },
    { pattern: /علاج وصيانة المخطوطات/g, spec: 'ترميم المخطوطات' },
    { pattern: /علاج وصيانة الزجاج/g, spec: 'ترميم الزجاج' },
    { pattern: /علاج وصيانة الخزف/g, spec: 'ترميم الخزف' },
    { pattern: /علاج وصيانة الأخشاب/g, spec: 'ترميم الأخشاب' },
    { pattern: /علاج وصيانة الفخار والزجاج/g, spec: 'ترميم الفخار والزجاج' },
    { pattern: /ترميم وصيانة الآثار المعدنية/g, spec: 'ترميم الآثار المعدنية' },
    { pattern: /ترميم الآثار الحجرية الثابتة والمنقولة/g, spec: 'ترميم الآثار الحجرية' },
    { pattern: /ترميم المعماري/g, spec: 'الترميم المعماري' },
    { pattern: /معماري/g, spec: 'الترميم المعماري' },
    
    // Egyptology specializations
    { pattern: /تاريخ واثار الشرق الادني القديم/g, spec: 'آثار الشرق الأدنى القديم' },
    { pattern: /آثار الشرق الادني القديم/g, spec: 'آثار الشرق الأدنى القديم' },
    { pattern: /الشرق الادني القديم/g, spec: 'آثار الشرق الأدنى القديم' },
    { pattern: /آثار مصرية قديمة وديانة/g, spec: 'آثار مصرية قديمة' },
    { pattern: /آثار مصرية قديمة - فنون - ديانة/g, spec: 'آثار مصرية قديمة' },
    { pattern: /آثار مصرية قديمة/g, spec: 'آثار مصرية قديمة' },
    { pattern: /اثار مصرية قديمة/g, spec: 'آثار مصرية قديمة' },
    { pattern: /مصرية قديمة في العصر البطلمي/g, spec: 'آثار مصرية قديمة' },
    { pattern: /مصرية قديمة عصر متأخر الي العصر اليوناني/g, spec: 'آثار مصرية قديمة' },
    { pattern: /مصرية قديمة قبطي/g, spec: 'آثار مصرية قديمة' },
    { pattern: /مصرية قديمة/g, spec: 'آثار مصرية قديمة' },
    { pattern: /لغة مصرية قديمة في العصر البطلمي/g, spec: 'لغة مصرية قديمة' },
    { pattern: /لغة مصرية قديمة قبطي/g, spec: 'لغة قبطية' },
    { pattern: /لغة مصرية قديمة/g, spec: 'لغة مصرية قديمة' },
    { pattern: /لغة قبطية/g, spec: 'لغة قبطية' },
    { pattern: /قبطية/g, spec: 'لغة قبطية' },
    { pattern: /ديانة مصرية قديمة/g, spec: 'ديانة مصرية قديمة' },
    { pattern: /عمارة وفنون/g, spec: 'عمارة وفنون' },
    { pattern: /آثار ما قبل التاريخ/g, spec: 'آثار ما قبل التاريخ' },
    { pattern: /فنون آثار ما قبل التاريخ/g, spec: 'آثار ما قبل التاريخ' },
    { pattern: /تاريخ وآثار شبة الجزيرة العربية/g, spec: 'آثار شبه الجزيرة العربية' },
    { pattern: /آثار وديانة مصر القديمة في العصر اليوناني الروماني/g, spec: 'آثار يونانية رومانية' },
    { pattern: /مصر في العصرين البطلمي والروماني/g, spec: 'آثار يونانية رومانية' },
    { pattern: /فنون مصرية خلال العصرين البطلمي والروماني/g, spec: 'فنون يونانية رومانية' },
    { pattern: /عصر متاخر/g, spec: 'عصر متأخر' },
    { pattern: /منذ الدولة القديمة وحتي الدولة الحديثة/g, spec: 'آثار مصرية قديمة' },
    
    // Islamic specializations
    { pattern: /عمارة إسلامية\(المشرق الإسلامى\)/g, spec: 'عمارة إسلامية' },
    { pattern: /عمارة إسلامية\(المشرق العربي\)/g, spec: 'عمارة إسلامية' },
    { pattern: /إسلامية\(المشرق الإسلامى\)/g, spec: 'آثار إسلامية' },
    { pattern: /إسلامية\(المشرق العربي\)/g, spec: 'آثار إسلامية' },
    { pattern: /فنون إسلامية بالمشرق/g, spec: 'فنون إسلامية' },
    { pattern: /إسلامية بالمشرق/g, spec: 'آثار إسلامية' },
    { pattern: /عمارة المشرق الإسلامي/g, spec: 'عمارة إسلامية' },
    { pattern: /فنون إسلامية/g, spec: 'فنون إسلامية' },
    { pattern: /عمارة إسلامية/g, spec: 'عمارة إسلامية' },
    { pattern: /تصوير إسلامي/g, spec: 'تصوير إسلامي' },
    { pattern: /مسككوكات إسلامية/g, spec: 'مسكوكات إسلامية' },
    { pattern: /مسكوكات إسلامية/g, spec: 'مسكوكات إسلامية' },
    { pattern: /مسكوكات/g, spec: 'مسكوكات إسلامية' },
    { pattern: /كتابات اثرية/g, spec: 'كتابات أثرية' },
    { pattern: /فنون اسلامية/g, spec: 'فنون إسلامية' },
    { pattern: /اسلامية/g, spec: 'آثار إسلامية' },
    { pattern: /إسلامية/g, spec: 'آثار إسلامية' },
    { pattern: /تاريخ الفن/g, spec: 'تاريخ الفن' },
    { pattern: /الفن/g, spec: 'تاريخ الفن' },
  ];
  
  let specialization = 'غير محدد';
  
  // Try to find specialization
  for (const { pattern, spec } of specializationPatterns) {
    if (pattern.test(cleaned)) {
      specialization = spec;
      cleaned = cleaned.replace(pattern, '').trim();
      break;
    }
  }
  
  // Remove any remaining extra words
  cleaned = cleaned
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .replace(/^- /g, '')   // Leading dash
    .replace(/ -$/g, '')   // Trailing dash
    .trim();
  
  return {
    name: cleaned,
    specialization: specialization
  };
}

async function cleanAllFacultyNames() {
  console.log('\n🧹 Cleaning faculty names...\n');
  
  const allFaculty = await prisma.facultyMember.findMany({
    orderBy: { nameAr: 'asc' }
  });
  
  let updated = 0;
  
  for (const faculty of allFaculty) {
    const { name, specialization } = cleanName(faculty.nameAr);
    
    // Only update if name changed
    if (name !== faculty.nameAr) {
      await prisma.facultyMember.update({
        where: { id: faculty.id },
        data: {
          nameAr: name,
          specializationAr: specialization
        }
      });
      
      console.log(`✅ ${faculty.nameAr}`);
      console.log(`   → ${name}`);
      console.log(`   التخصص: ${specialization}`);
      console.log('');
      updated++;
    }
  }
  
  console.log('='.repeat(60));
  console.log(`✅ Updated ${updated} faculty members`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await cleanAllFacultyNames();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
