import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Read extracted faculty data
const extractedDataPath = path.join(__dirname, '../../scripts/extracted_faculty.json');
const extractedData = JSON.parse(fs.readFileSync(extractedDataPath, 'utf-8'));

const CV_SOURCE_DIR = path.join(__dirname, '../../../CV');
const CV_TARGET_DIR = path.join(__dirname, '../../frontend/public/uploads/faculty/cvs');

async function updateCVFiles() {
  console.log('\n📄 Updating faculty CV files...\n');
  
  let updated = 0;
  let notFound = 0;
  let noCV = 0;
  
  for (const [deptKey, members] of Object.entries(extractedData) as [string, any[]]) {
    console.log(`\n${deptKey}:`);
    
    for (const member of members) {
      const cvFile = member.cv_file;
      
      if (!cvFile) {
        noCV++;
        continue;
      }
      
      // Find faculty member in database - try multiple matching strategies
      let faculty = null;
      
      // Extract core name (remove titles and "اضغط هنا")
      const coreName = member.name
        .replace(/أ\.د\.|د\.|أستاذ|استاذ|مساعد|متفرغ|مدرس|اضغط هنا.*$/g, '')
        .trim();
      
      // Try exact match first
      faculty = await prisma.facultyMember.findFirst({
        where: {
          nameAr: {
            contains: coreName.split(' ').slice(0, 3).join(' ')
          }
        }
      });
      
      // Try with just first 2 words if not found
      if (!faculty) {
        faculty = await prisma.facultyMember.findFirst({
          where: {
            nameAr: {
              contains: coreName.split(' ').slice(0, 2).join(' ')
            }
          }
        });
      }
      
      if (!faculty) {
        console.log(`   ⚠️  Faculty not found in DB: ${member.name.substring(0, 50)}`);
        notFound++;
        continue;
      }
      
      // Get CV filename
      const cvFilename = cvFile.split('/').pop();
      if (!cvFilename) continue;
      
      // Check if CV file exists in old location
      const sourceCV = path.join(CV_SOURCE_DIR, cvFilename);
      const targetCV = path.join(CV_TARGET_DIR, cvFilename);
      
      if (fs.existsSync(sourceCV)) {
        // Copy CV if not already copied
        if (!fs.existsSync(targetCV)) {
          try {
            fs.copyFileSync(sourceCV, targetCV);
          } catch (error: any) {
            console.log(`   ❌ Error copying CV for ${faculty.nameAr}: ${error.message}`);
            continue;
          }
        }
        
        // Update faculty with CV URL
        await prisma.facultyMember.update({
          where: { id: faculty.id },
          data: { cvFileUrl: `/uploads/faculty/cvs/${cvFilename}` }
        });
        
        console.log(`   ✅ ${faculty.nameAr} → ${cvFilename}`);
        updated++;
      } else {
        console.log(`   ⚠️  CV file not found: ${cvFilename} for ${faculty.nameAr}`);
        notFound++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ CV Files Updated: ${updated}`);
  console.log(`⚠️  Files Not Found: ${notFound}`);
  console.log(`ℹ️  No CV in Data: ${noCV}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await updateCVFiles();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
