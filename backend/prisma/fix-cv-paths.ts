import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CV_DIR = path.join(__dirname, '../../frontend/public/uploads/faculty/cvs');

async function fixCVPaths() {
  console.log('\n🔧 Fixing CV file paths...\n');
  
  // Get all faculty with CV files
  const facultyWithCVs = await prisma.facultyMember.findMany({
    where: {
      cvFileUrl: {
        not: null
      }
    },
    select: {
      id: true,
      nameAr: true,
      cvFileUrl: true
    }
  });
  
  console.log(`Found ${facultyWithCVs.length} faculty members with CV references\n`);
  
  let fixed = 0;
  let notFound = 0;
  
  for (const faculty of facultyWithCVs) {
    const currentPath = faculty.cvFileUrl;
    if (!currentPath) continue;
    
    // Extract filename from path (e.g., "CV/DrAsmaa.pdf" -> "DrAsmaa.pdf")
    const filename = currentPath.split('/').pop();
    if (!filename) continue;
    
    // Check if file exists in new location
    const fullPath = path.join(CV_DIR, filename);
    
    if (fs.existsSync(fullPath)) {
      // Update to correct path
      const newPath = `/uploads/faculty/cvs/${filename}`;
      
      await prisma.facultyMember.update({
        where: { id: faculty.id },
        data: { cvFileUrl: newPath }
      });
      
      console.log(`✅ ${faculty.nameAr}`);
      console.log(`   ${currentPath} → ${newPath}`);
      fixed++;
    } else {
      console.log(`❌ ${faculty.nameAr} - File not found: ${filename}`);
      
      // Try to find similar files
      const files = fs.readdirSync(CV_DIR);
      const nameWithoutExt = path.basename(filename, path.extname(filename)).toLowerCase();
      const similar = files.filter(f => 
        f.toLowerCase().includes(nameWithoutExt) || 
        nameWithoutExt.includes(path.basename(f, path.extname(f)).toLowerCase())
      );
      
      if (similar.length > 0) {
        console.log(`   Possible matches: ${similar.join(', ')}`);
      }
      
      notFound++;
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Not Found: ${notFound}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await fixCVPaths();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
