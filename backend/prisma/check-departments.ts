import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== الأقسام الموجودة في قاعدة البيانات ===\n');
  
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          facultyMembers: true
        }
      }
    }
  });
  
  for (const dept of departments) {
    console.log(`${dept.nameAr}`);
    console.log(`  ID: ${dept.id}`);
    console.log(`  English: ${dept.nameEn}`);
    console.log(`  Faculty Count: ${dept._count.facultyMembers}`);
    console.log('');
  }
  
  // Check faculty without proper department
  const facultyWithIssues = await prisma.facultyMember.findMany({
    select: {
      nameAr: true,
      department: {
        select: {
          nameAr: true
        }
      }
    },
    take: 10
  });
  
  console.log('\n=== عينة من أعضاء هيئة التدريس ===\n');
  for (const f of facultyWithIssues) {
    console.log(`${f.nameAr}`);
    console.log(`  القسم: ${f.department?.nameAr || 'غير محدد'}`);
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
