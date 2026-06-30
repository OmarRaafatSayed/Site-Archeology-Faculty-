import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Sample Faculty Check - Verifying Name & Photo Accuracy\n');
  console.log('═'.repeat(70) + '\n');
  
  // Sample from each department
  const samples = [
    { dept: 'قسم الآثار المصرية', count: 5 },
    { dept: 'قسم الآثار الإسلامية', count: 3 },
    { dept: 'قسم ترميم الآثار', count: 3 },
    { dept: 'قسم الآثار اليونانية الرومانية', count: 3 },
  ];
  
  for (const { dept, count } of samples) {
    console.log(`\n📚 ${dept}\n`);
    
    const faculty = await prisma.facultyMember.findMany({
      where: {
        department: {
          nameAr: dept
        }
      },
      include: {
        department: {
          select: {
            nameAr: true
          }
        }
      },
      take: count,
      orderBy: { nameAr: 'asc' }
    });
    
    for (const member of faculty) {
      const photoStatus = member.photoUrl ? '✅ Has Photo' : '❌ No Photo';
      const photoFile = member.photoUrl ? member.photoUrl.split('/').pop() : 'N/A';
      
      console.log(`   ${member.nameAr}`);
      console.log(`      English: ${member.nameEn}`);
      console.log(`      Degree: ${member.degree}`);
      console.log(`      Specialization: ${member.specializationAr || 'N/A'}`);
      console.log(`      Photo: ${photoStatus} ${member.photoUrl ? `(${photoFile})` : ''}`);
      
      // Check if name looks clean (no mixed specialization)
      const hasProblem = member.nameAr.includes('تاريخ') || 
                        member.nameAr.includes('عمارة') ||
                        member.nameAr.includes('فنون') ||
                        member.nameAr.length > 100;
      
      if (hasProblem) {
        console.log(`      ⚠️  WARNING: Name might contain specialization!`);
      } else {
        console.log(`      ✓ Name is clean`);
      }
      
      console.log('');
    }
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ Sample Check Complete\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
