import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clearer mappings from the analysis
const ADDITIONAL_MAPPINGS: Record<string, string> = {
  // Very clear matches
  'د. مها سمير عبد السلام القناوي': 'mahaAhmed.gif', // مها + Ahmed
  'د. هند صلاح الدين صميدة عوض': 'hudasalah.gif', // هند صلاح
  'أ. هدير كمال سعداوي إبراهيم': 'osamakamal.gif', // كمال
};

// Unclear matches - need manual verification
const NEEDS_VERIFICATION = [
  'أ. أسماء ممدوح عبد الستار حنفي', // Many عبد matches but no clear one
  'أ. أيمان جمال عبد الجواد إبراهيم', // Already have drEman.gif used, unclear
  'أ. احمد إبراهيم محمد محمود موسى', // Many محمد/محمود but no clear one
  'أ. احمد نبيل نجيب عبد الباقي', // Many عبد but no نبيل match
  'أ. اشرف عادل سعد عبد السلام', // Many عبد but no اشرف match
  'أ. سماح عبد اللطيف محمد عبد اللطيف', // Many عبد/محمد but no سماح
  'أ. د/ وفيقة نصحي وهبه سوس', // No matches at all
  'د. هيام حافظ رواش حافظ', // No matches at all
];

async function main() {
  console.log('\n🔗 Linking additional photo matches...\n');
  
  let linked = 0;
  let notFound = 0;
  
  for (const [namePattern, photoFile] of Object.entries(ADDITIONAL_MAPPINGS)) {
    const faculty = await prisma.facultyMember.findFirst({
      where: {
        nameAr: namePattern,
        OR: [
          { photoUrl: null },
          { photoUrl: '' }
        ]
      }
    });
    
    if (faculty) {
      await prisma.facultyMember.update({
        where: { id: faculty.id },
        data: { photoUrl: `/uploads/faculty/photos/${photoFile}` }
      });
      
      console.log(`✅ ${faculty.nameAr}`);
      console.log(`   → ${photoFile}`);
      linked++;
    } else {
      console.log(`⚠️  Not found: ${namePattern}`);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Linked: ${linked}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log('='.repeat(60) + '\n');
  
  // Show remaining
  console.log('📋 FACULTY STILL NEEDING MANUAL VERIFICATION:\n');
  console.log('These faculty have potential photo matches but need');
  console.log('manual verification by checking the actual photo files:\n');
  
  for (const name of NEEDS_VERIFICATION) {
    console.log(`   • ${name}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Final count
  const withPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const total = await prisma.facultyMember.count();
  const remaining = total - withPhotos;
  
  console.log(`\n📊 CURRENT STATUS:`);
  console.log(`   Total Faculty: ${total}`);
  console.log(`   With Photos: ${withPhotos} (${((withPhotos/total)*100).toFixed(1)}%)`);
  console.log(`   Without Photos: ${remaining}`);
  console.log('='.repeat(60) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
