import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function separatePhotosAndCVs() {
  console.log('\n🔧 Separating Photos from CVs...\n');
  
  // Find all faculty where photoUrl points to a PDF (CV file)
  const faculty = await prisma.facultyMember.findMany({
    where: {
      photoUrl: {
        contains: '.pdf'
      }
    }
  });
  
  console.log(`Found ${faculty.length} faculty with PDF in photoUrl field\n`);
  
  for (const member of faculty) {
    if (!member.photoUrl) continue;
    
    // If photoUrl is a PDF, move it to cvFileUrl and clear photoUrl
    if (member.photoUrl.endsWith('.pdf')) {
      await prisma.facultyMember.update({
        where: { id: member.id },
        data: {
          cvFileUrl: member.photoUrl,
          photoUrl: null  // Will be linked by photo linking script
        }
      });
      
      console.log(`✅ ${member.nameAr}`);
      console.log(`   Moved ${member.photoUrl} to cvFileUrl`);
    }
  }
  
  console.log('\n✅ Done! Now run photo linking script again.\n');
}

async function main() {
  await separatePhotosAndCVs();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
