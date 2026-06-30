import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map photo filenames to potential name matches
const PHOTO_NAME_MAP: Record<string, string[]> = {
  // CV/Images directory photos
  'ProfFawzia.jpg': ['فوزية'],
  'ProfHossam.gif': ['حسام'],
  'ProfAmal.gif': ['آمال', 'أمال'],
  'ProfAboelhamad.gif': ['أبو الحمد', 'ابو الحمد'],
  'drMostafaAttia.gif': ['مصطفى عطية', 'مصطفي عطية'],
  'drmostafaaAttia2.gif': ['مصطفى عطية', 'مصطفي عطية'],
  'DrHarby.jpg': ['حربي'],
  'drHamza.gif': ['حمزة'],
  'drAhmedragab.gif': ['أحمد رجب'],
  'DrAhmedYossef.gif': ['أحمد يوسف'],
  'drAhmedSaed.gif': ['أحمد سعيد'],
  'drAhmedMekawi.gif': ['أحمد مكاوي'],
  'DrAhmedElsawy.gif': ['أحمد الصاوي'],
  'drAhmedAbdelkader.gif': ['أحمد عبد القادر'],
  'drAhmedBadran.gif': ['أحمد بدران'],
  'drGamal.gif': ['جمال'],
  'DrGamal.jpg': ['جمال'],
  'drMona.gif': ['منى'],
  'drMonaGabr.gif': ['منى جبر', 'مني جبر'],
  'drGhada.gif': ['غادة'],
  'drSalwa.gif': ['سلوى'],
  'drsawsan.gif': ['سوسن'],
  'drwafika.gif': ['وفيقة'],
  'drWafaa.gif': ['وفاء'],
  'drEman.gif': ['إيمان', 'ايمان'],
  'drAsmaaTurkey.gif': ['أسماء'],
  'DrNayera.jpg': ['نيرة', 'نايرة'],
  'drNisreen.gif': ['نسرين'],
  'drRehab.gif': ['رحاب'],
  'drReham.gif': ['رهام'],
  'rehamSaeed.gif': ['رهام سعيد'],
  'hudasalah.gif': ['هدى صلاح'],
  'drHeba.gif': ['هبة'],
  'hayamHawash.pdf': ['هيام'],
  'drMaisra.gif': ['ميسرة'],
  'drZinab.gif': ['زينب'],
  'DrMokhtar.jpg': ['مختار'],
  'drShebl.gif': ['شبل'],
  'drTarek.gif': ['طارق'],
  'tarek.jpg': ['طارق'],
  'DrSalahelkholy.gif': ['صلاح'],
  'drYasser.gif': ['ياسر'],
  'drHosniNouser.gif': ['حسني'],
  'drhosny.jpg': ['حسني'],
  'drHusseinRamadan.jpg': ['حسين رمضان'],
  'DrHusseinRmdan.gif': ['حسين رمضان'],
  'drHusseinRabie.gif': ['حسين ربيع'],
  'drRamadan.jpg': ['رمضان'],
  'drRamdan.gif': ['رمضان'],
  'drMahmoudHafez.gif': ['محمود حافظ'],
  'drMAhmoudMorsi.gif': ['محمود مرسي'],
  'mahmoudRoshdy.gif': ['محمود رشدي'],
  'drMahmoudSaideldin.gif': ['محمود سيف الدين'],
  'MohamedHawash.gif': ['محمد عطية'],
  'MohamedHawash2.gif': ['محمد عطية'],
  'mohamedy.gif': ['محمدي'],
  'muhamdy.gif': ['محمدي'],
  'muhammdyFathi.jpg': ['محمدي فتحي'],
  'MohamedAboseif.gif': ['محمد أبو سيف'],
  'Msamir.gif': ['محمد سمير'],
  'drMansourAbdelrazik.gif': ['منصور'],
  'drOmar.jpeg': ['عمر'],
  'drOmarAbdelkarim.gif': ['عمر عبد الكريم'],
  'sherifOmar.gif': ['شريف عمر'],
  'drOsama.gif': ['أسامة', 'اسامة'],
  'osamakamal.gif': ['أسامة كمال', 'اسامة كمال'],
  'drAbdelrahman.gif': ['عبد الرحمن'],
  'drAbdelkhalik.gif': ['عبد الخالق'],
  'DrAbdelkhalik.jpg': ['عبد الخالق'],
  'drAboBakr.gif': ['أبو بكر', 'ابو بكر'],
  'drAlieltayesh.gif': ['علي الطايش'],
  'drElarabi.gif': ['العربي'],
  'drKhaledGhareeb.gif': ['خالد'],
  'emad.gif': ['عماد'],
  'DrFayza.jpg': ['فايزة'],
  'drShadia.gif': ['شادية'],
  'drShadia.jpg': ['شادية'],
  'MAboFatma.gif': ['مصطفى أبو فتحة'],
  'mostafaFarag.gif': ['مصطفى فراج'],
  'drSoliman.gif': ['سليمان'],
  'drSolimanHamed.jpg': ['سليمان حامد'],
  'nagah.gif': ['نجاح'],
  'malka.gif': ['ملكة'],
  'mahaAhmed.gif': ['مها أحمد'],
  'drMaysaMansour.gif': ['ميسا منصور'],
  'DrMohsenNegm2.jpg': ['محسن'],
  'drElGhoul.jpg': ['الغول'],
  'nefertari.pdf': ['نفرتاري'],
  'drSAyedhemeda.gif': ['سيد حميدة'],
  'drGomaa.gif': ['جمعة'],
  
  // images/Deans directory photos
  '1DrElAmir.jpg': ['الأمير', 'الامير'],
  '2DrSoaad.jpg': ['سعاد'],
  '3DrAbdelaziz.jpg': ['عبد العزيز'],
  '4DrSaid.jpg': ['سعيد'],
  '5DrAli.jpg': ['علي'],
  '6DrSalah.jpg': ['صلاح'],
  '7DrGabAllah.jpg': ['جاب الله'],
  '8DrRaffat.jpg': ['رفعت'],
  '9DrOla.jpg': ['علا'],
  '10DrAlaa.jpg': ['علاء'],
  '11drAzza.jpg': ['عزة'],
  '12DrHamza.jpg': ['حمزة'],
  
  // images/photos/Persons directory photos
  'Dr Ahmed.jpg': ['أحمد'],
  'dr_abdal7aleem.jpg': ['عبد الحليم'],
  'Dr.AHamza.gif': ['حمزة'],
  'DrOla.gif': ['علا'],
  
  // images/ root directory photos
  'drMostafaAttia.jpg': ['مصطفى عطية', 'مصطفي عطية'],
  'د علاء.JPG': ['علاء'],
  'د علاء2.JPG': ['علاء'],
};

// Source paths
const OLD_PHOTOS_DIRS = [
  path.join(__dirname, '../../../CV/Images'),           // Main CV photos
  path.join(__dirname, '../../../images/Deans'),        // Dean photos
  path.join(__dirname, '../../../images/photos/Persons'), // Person photos
  path.join(__dirname, '../../../images')               // Root images directory
];
const NEW_PHOTOS_DIR = path.join(__dirname, '../../frontend/public/uploads/faculty/photos');

async function copyPhotoFiles() {
  console.log('\n📸 Copying faculty photo files from all directories...\n');
  
  // Create target directory
  if (!fs.existsSync(NEW_PHOTOS_DIR)) {
    fs.mkdirSync(NEW_PHOTOS_DIR, { recursive: true });
  }
  
  let totalCopied = 0;
  
  for (const sourceDir of OLD_PHOTOS_DIRS) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`   ⚠️  Directory not found: ${sourceDir}`);
      continue;
    }
    
    console.log(`   Scanning: ${path.basename(sourceDir)}...`);
    
    // Copy all image files
    const files = fs.readdirSync(sourceDir);
    let copied = 0;
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.gif', '.png', '.webp'].includes(ext)) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(NEW_PHOTOS_DIR, file);
        
        // Skip if file is a directory or already exists
        if (fs.statSync(sourcePath).isDirectory()) continue;
        if (fs.existsSync(targetPath)) continue;
        
        try {
          fs.copyFileSync(sourcePath, targetPath);
          copied++;
          totalCopied++;
        } catch (error: any) {
          console.log(`      ❌ Error copying ${file}: ${error.message}`);
        }
      }
    }
    
    if (copied > 0) {
      console.log(`      ✅ Copied ${copied} files`);
    }
  }
  
  console.log(`\n✅ Total copied: ${totalCopied} photo files\n`);
}

async function linkPhotosToFaculty() {
  console.log('🔗 Linking photos to faculty members...\n');
  
  // Get all faculty members
  const faculty = await prisma.facultyMember.findMany({
    orderBy: { nameAr: 'asc' }
  });
  
  let linked = 0;
  let updated = 0;
  let notFound = 0;
  
  for (const member of faculty) {
    let photoFound = false;
    let matchedPhoto = '';
    
    // Try to match photo by explicit mapping first
    for (const [photoFile, namePatterns] of Object.entries(PHOTO_NAME_MAP)) {
      for (const pattern of namePatterns) {
        if (member.nameAr.includes(pattern)) {
          matchedPhoto = photoFile;
          photoFound = true;
          break;
        }
      }
      if (photoFound) break;
    }
    
    // If not found in map, try fuzzy matching with all available photos
    if (!photoFound) {
      const photoFiles = fs.readdirSync(NEW_PHOTOS_DIR);
      
      for (const photoFile of photoFiles) {
        const ext = path.extname(photoFile).toLowerCase();
        if (!['.jpg', '.jpeg', '.gif', '.png', '.webp'].includes(ext)) continue;
        
        const fileNameWithoutExt = path.basename(photoFile, ext).toLowerCase();
        const memberNameSimplified = member.nameAr
          .replace(/أ\.د\.|د\.|أستاذ|استاذ|مساعد|متفرغ|مدرس/g, '')
          .trim()
          .split(' ')[0]; // Get first name
        
        // Try matching by first name in filename
        if (fileNameWithoutExt.includes(memberNameSimplified) || 
            memberNameSimplified.includes(fileNameWithoutExt)) {
          matchedPhoto = photoFile;
          photoFound = true;
          break;
        }
      }
    }
    
    // Update if photo was found
    if (photoFound && matchedPhoto) {
      const photoUrl = `/uploads/faculty/photos/${matchedPhoto}`;
      
      // Check if different from current photo
      if (member.photoUrl !== photoUrl) {
        try {
          await prisma.facultyMember.update({
            where: { id: member.id },
            data: { photoUrl }
          });
          
          console.log(`   ✅ ${member.nameAr} → ${matchedPhoto}`);
          if (member.photoUrl) {
            updated++;
          } else {
            linked++;
          }
        } catch (error: any) {
          console.log(`   ❌ Error updating ${member.nameAr}: ${error.message}`);
        }
      } else {
        // Already has this photo
        console.log(`   ℹ️  ${member.nameAr} (already has photo)`);
      }
    } else {
      console.log(`   ⚠️  No photo found for: ${member.nameAr}`);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Linking Complete!`);
  console.log(`   Newly Linked: ${linked}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not Found: ${notFound}`);
  console.log(`   Total Faculty: ${faculty.length}`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n🚀 Starting Faculty Photos Linking Process...\n');
  
  // Step 1: Copy photos
  await copyPhotoFiles();
  
  // Step 2: Link photos to faculty
  await linkPhotosToFaculty();
}

main()
  .catch((e) => {
    console.error('❌ Process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
