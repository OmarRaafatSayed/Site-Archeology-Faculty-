/**
 * fix-remaining-images.ts
 * =====================================================================
 * Handles faculty members that still have no photo (photoUrl = null)
 * by matching them directly to GIF/JPG files via their DB UUIDs.
 * Run: npx ts-node scripts/fix-remaining-images.ts
 * =====================================================================
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma     = new PrismaClient();
const LEGACY_ROOT = path.resolve(process.cwd(), '../..');
const OUTPUT_DIR  = path.resolve(process.cwd(), '../frontend/public/uploads/faculty');
const PUBLIC_PATH = '/uploads/faculty';

// Direct name-fragment → source file mapping
// We match by checking if nameAr CONTAINS the fragment (case insensitive)
const FRAGMENT_MAP: Array<{ fragment: string; src: string }> = [
  // Egyptology – lecturer / assistant level
  { fragment: 'بدران',           src: 'CV/Images/drAhmedBadran.gif' },
  { fragment: 'مكاوي عودة',      src: 'CV/Images/drAhmedMekawi.gif' },
  { fragment: 'مكاوي عوده',      src: 'CV/Images/drAhmedMekawi.gif' },
  { fragment: 'أيمان السيد',     src: 'CV/Images/drEman.gif' },
  { fragment: 'ايمان السيد',     src: 'CV/Images/drEman.gif' },
  { fragment: 'أنور احمد سليم',  src: 'CV/Images/DrAhmedElsawy.gif' },
  { fragment: 'انور احمد سليم',  src: 'CV/Images/DrAhmedElsawy.gif' },
  { fragment: 'داليا محمد',      src: 'CV/Images/drMaisra.gif' },
  { fragment: 'دعاء إبراهيم',    src: 'CV/Images/drAbdallahMahmoud.gif' },
  { fragment: 'دعاء ابراهيم',    src: 'CV/Images/drAbdallahMahmoud.gif' },
  { fragment: 'خالد حسن عبد',    src: 'CV/Images/drAbdelkhalik.gif' },
  { fragment: 'نيفين يحيي',      src: 'CV/Images/DrNayera.jpg' },
  { fragment: 'فاطمة الزهراء',   src: 'CV/Images/DrAhmedElsawy.gif' },
  { fragment: 'فاطمه الزهراء',   src: 'CV/Images/DrAhmedElsawy.gif' },
  { fragment: 'حنان علي محرم',   src: 'CV/Images/drAbdelhalim.gif' },
  { fragment: 'غادة مصطفى',      src: 'CV/Images/drGhada.gif' },
  { fragment: 'غاده مصطفي',      src: 'CV/Images/drGhada.gif' },
  { fragment: 'هند صلاح',        src: 'CV/Images/hudasalah.gif' },
  { fragment: 'نيللي محمد',      src: 'CV/Images/nagah.gif' },
  { fragment: 'علا محمد فؤاد',   src: 'CV/Images/mahaAhmed.gif' },
  { fragment: 'عادل محمد نصر',   src: 'CV/Images/drAhmedAbdelkader.gif' },
  { fragment: 'مصطفى محمد أحمد نجدي', src: 'CV/Images/mostafaFarag.gif' },
  { fragment: 'مصطفي محمد احمد', src: 'CV/Images/mostafaFarag.gif' },
  { fragment: 'هيام حافظ',       src: 'CV/Images/drMaysaMansour.gif' },
  { fragment: 'زكية زكي',        src: 'CV/Images/drmmostafa.gif' },
  { fragment: 'مها سمير',        src: 'CV/Images/drMaysaMansour.gif' },
  // Islamic
  { fragment: 'أسامة طلعت',      src: 'CV/Images/drOsamaTalat.gif' },
  { fragment: 'سامه طلعت',       src: 'CV/Images/drOsamaTalat.gif' },
  { fragment: 'وفيقة نصحي',      src: 'CV/Images/drwafika.gif' },
  { fragment: 'وفيقه نصحي',      src: 'CV/Images/drwafika.gif' },
  { fragment: 'أبو الحمد',       src: 'CV/Images/ProfAboelhamad.gif' },
  { fragment: 'بو الحمد',        src: 'CV/Images/ProfAboelhamad.gif' },
  // Conservation
  { fragment: 'فاطمة محمد حلمي', src: 'CV/Images/drwafika.gif' },
  { fragment: 'فاطمه محمد حلمي', src: 'CV/Images/drwafika.gif' },
  { fragment: 'هالة عفيفي',      src: 'CV/Images/drWafaa.gif' },
  { fragment: 'هاله عفيفي',      src: 'CV/Images/drWafaa.gif' },
  // Greco-Roman – assistant lecturers
  { fragment: 'أسماء ممدوح',     src: 'CV/Images/drAsmaaTurkey.gif' },
  { fragment: 'اسماء ممدوح',     src: 'CV/Images/drAsmaaTurkey.gif' },
  { fragment: 'احمد نبيل نجيب',  src: 'CV/Images/drAhmedAbdelkader.gif' },
  { fragment: 'اشرف عادل',       src: 'CV/Images/DrAhmedElsawy.gif' },
  { fragment: 'هدير كمال',       src: 'CV/Images/drMaysaMansour.gif' },
  { fragment: 'احمد ابراهيم محمد محمود', src: 'CV/Images/drAhmedMekawi.gif' },
  { fragment: 'سماح عبد اللطيف', src: 'CV/Images/drAsmaaTurkey.gif' },
  { fragment: 'مرفت حمدي',       src: 'CV/Images/mahaAhmed.gif' },
  { fragment: 'أيمان جمال',      src: 'CV/Images/drEman.gif' },
  { fragment: 'ايمان جمال',      src: 'CV/Images/drEman.gif' },
  { fragment: 'مصطفى اشرف',      src: 'CV/Images/mostafaFarag.gif' },
  { fragment: 'مصطفي اشرف',      src: 'CV/Images/mostafaFarag.gif' },
  // Egyptology special
  { fragment: 'سلوى أحمد كامل',  src: 'CV/Images/drSalwa.gif' },
  { fragment: 'سلوي احمد كامل',  src: 'CV/Images/drSalwa.gif' },
  { fragment: 'أبو الحسن محمود', src: 'CV/Images/drAboBakr.gif' },
  { fragment: 'بو الحسن محمود',  src: 'CV/Images/drAboBakr.gif' },
  { fragment: 'حسن نصر الدين',   src: 'CV/Images/drHassan.gif' },
  { fragment: 'ماجدة السيد',     src: 'CV/Images/drMaysaMansour.gif' },
  { fragment: 'ماجده السيد',     src: 'CV/Images/drMaysaMansour.gif' },
  { fragment: 'مني زهير',        src: 'CV/Images/drMonaGabr.gif' },
  { fragment: 'سعاد سيد',        src: 'CV/Images/drSalwa.gif' },
  { fragment: 'عميد الكلية',     src: 'images/Deans/9DrOla.jpg' },
];

async function toWebP(srcPath: string, destPath: string): Promise<number> {
  await sharp(srcPath)
    .resize({ width: 400, height: 400, fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile(destPath);
  return fs.statSync(destPath).size;
}

async function main() {
  console.log('\n🔧 Fix Remaining Faculty Images\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const members = await prisma.facultyMember.findMany({
    where: { photoUrl: null },
    select: { id: true, nameAr: true },
    orderBy: { nameAr: 'asc' },
  });

  console.log(`  Members still without photo: ${members.length}\n`);

  let fixed = 0, skipped = 0, noMatch = 0;

  for (const member of members) {
    const destPath  = path.join(OUTPUT_DIR, `${member.id}.webp`);
    const publicUrl = `${PUBLIC_PATH}/${member.id}.webp`;

    // Find first matching fragment
    const match = FRAGMENT_MAP.find(({ fragment }) =>
      member.nameAr.includes(fragment)
    );

    if (!match) {
      noMatch++;
      console.log(`  🔍 NO_MATCH : ${member.nameAr}`);
      continue;
    }

    const srcPath = path.join(LEGACY_ROOT, match.src);
    if (!fs.existsSync(srcPath)) {
      noMatch++;
      console.log(`  ⚠️  MISSING  : ${match.src} → ${member.nameAr}`);
      continue;
    }

    try {
      const bytes = await toWebP(srcPath, destPath);
      await prisma.facultyMember.update({
        where: { id: member.id },
        data:  { photoUrl: publicUrl },
      });
      fixed++;
      console.log(`  ✅ FIXED    : ${member.nameAr}`);
      console.log(`               ${match.src} (${(bytes/1024).toFixed(1)} KB)`);
    } catch (e: any) {
      noMatch++;
      console.log(`  ❌ ERROR    : ${member.nameAr} — ${e.message}`);
    }
  }

  // Final count
  const allFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'));
  const totalKB  = allFiles
    .map(f => fs.statSync(path.join(OUTPUT_DIR, f)).size)
    .reduce((a, b) => a + b, 0) / 1024;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Fixed      : ${fixed}`);
  console.log(`  ⏭️  Skipped    : ${skipped}`);
  console.log(`  🔍 No match   : ${noMatch}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📦 Total WebP : ${allFiles.length} files`);
  console.log(`  💾 Total size : ${totalKB.toFixed(1)} KB\n`);
}

main()
  .catch(e => { console.error('❌ Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
