import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Fixing photo paths...\n');
  
  const faculty = await prisma.facultyMember.findMany({
    where: {
      photoUrl: {
        not: null
      }
    }
  });
  
  let updated = 0;
  
  for (const member of faculty) {
    if (!member.photoUrl) continue;
    
    let newPath = member.photoUrl;
    
    // Fix paths
    if (newPath.startsWith('CV/Images/')) {
      newPath = newPath.replace('CV/Images/', '/uploads/faculty/photos/');
    } else if (newPath.startsWith('images/Deans/')) {
      newPath = newPath.replace('images/Deans/', '/uploads/faculty/photos/');
    } else if (newPath.startsWith('en/CV/')) {
      newPath = newPath.replace('en/CV/', '/uploads/faculty/cvs/');
    } else if (!newPath.startsWith('/')) {
      // Add leading slash if missing
      newPath = `/uploads/faculty/photos/${newPath}`;
    }
    
    if (newPath !== member.photoUrl) {
      await prisma.facultyMember.update({
        where: { id: member.id },
        data: { photoUrl: newPath }
      });
      
      console.log(`✅ ${member.nameAr}`);
      console.log(`   ${member.photoUrl} → ${newPath}`);
      updated++;
    }
  }
  
  console.log(`\n✅ Updated ${updated} photo paths\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
