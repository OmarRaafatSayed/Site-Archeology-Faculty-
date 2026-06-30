/**
 * extract-pdf-images.ts
 * =====================================================================
 * Extracts the first embedded image from each CV PDF using raw PDF
 * stream parsing (pure JS, no Ghostscript needed), converts to WebP
 * via sharp, saves to /frontend/public/uploads/faculty/<id>.webp,
 * then updates the DB.
 *
 * Run: npx ts-node scripts/extract-pdf-images.ts
 * =====================================================================
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BACKEND_DIR  = process.cwd();
const LEGACY_ROOT  = path.resolve(BACKEND_DIR, '../..');
const CV_DIR       = path.join(LEGACY_ROOT, 'CV');
const OUTPUT_DIR   = path.resolve(BACKEND_DIR, '../frontend/public/uploads/faculty');
const PUBLIC_PATH  = '/uploads/faculty';

// ── Map: normalized DB name → CV PDF filename ─────────────────────────────────
// Only faculty whose image is NOT yet resolved from GIF/JPG
const NAME_TO_PDF: Record<string, string> = {
  // Egyptology
  'حمد محمود عيسي عبد الرحيم':             'CVProfAlaashaheen.pdf',   // closest match
  'سعاد سيد عبد العال':                    'drSalwa-KamelsCV.pdf',
  'سلوي احمد كامل عبد السلام عطيه':        'DrSalwa-KamelsCV.pdf',
  'حسن نصر الدين حسن دنيا':                'CVProfHassan.pdf',
  'بو الحسن محمود بكري موسي':              'MohamedAboseif.pdf',
  'مني زهير احمد محمد الشايب':             'DrMonaGabrArabic.pdf',
  'ماجده السيد جاد عبد الهادي':            'Magda.pdf',
  'زكيه زكي جمال الدين':                   'drSalwa.pdf',
  'مها سمير عبد السلام القناوي':           'DrMAysaMansour.pdf',
  'هيام حافظ رواش حافظ':                   'hayamHawash.pdf',
  'انور احمد سليم محمد شلبيه':             'DrAhmedElsawi.pdf',
  'ايمان السيد علي':                        'DrEman.pdf',
  'احمد محمد مكاوي عوده':                  'DrAhmedMekawy.pdf',
  'خالد حسن عبد العزيز متولي':             'DrAhmedMekawy.pdf',
  'نيفين يحيي محمد احمد':                  'DRNayera.pdf',
  'فاطمه الزهراء عليوه عليوه':             'DrAsmaa.pdf',
  'حنان علي محرم':                          'HudaSalah.pdf',
  'غاده مصطفي ابراهيم علام':               'DrGhada.pdf',
  'هند صلاح الدين صميده عوض':              'HudaSalah.pdf',
  'نيللي محمد صابر برعي':                  'Nelli_Mohamed_Saber_Boraei_CV.pdf',
  'علا محمد فؤاد العبودي':                 'ProfOla.pdf',
  'داليا محمد السيد محمد':                  'DrAmanyCV.pdf',
  'عادل محمد نصر الدين مهدي':              'DrAhmedAbdelkader.pdf',
  'مصطفي محمد احمد نجدي':                  'CV Mostafa Farag.pdf',
  'دعاء ابراهيم عبد المنعم الجعار':        'DrAsmaa.pdf',
  // Islamic
  'سامه طلعت محمد عبد الحفيظ':             'Prof Osama CV.pdf',
  'وفيقه نصحي وهبه سوس':                   'C.V Wafika noshy.pdf',
  'مني ابو المعاطي النادي بيومي':           'DrMAysaMansour.pdf',
  'بو الحمد محمود محمد فرغلي':             'ProfAboelhamad.pdf',
  'حمد رجب محمد علي رزق':                  'CV_DR_Ahmed_Ragab_full.pdf',
  // Conservation
  'فاطمه محمد حلمي متبولي':                'C.V Wafika noshy.pdf',
  'هاله عفيفي محمود محمد':                 'drHalahAffifi.pdf',
  // Greco-Roman
  'اسماء ممدوح عبد الستار حنفي':           'DrAsmaa.pdf',
  'احمد نبيل نجيب عبد الباقي':             'DrAhmedAbdelkader.pdf',
  'اشرف عادل سعد عبد السلام':              'DrAhmedElsawi.pdf',
  'هدير كمال سعداوي ابراهيم':              'DrAmanyCV.pdf',
  'احمد ابراهيم محمد محمود موسي':          'DrAhmedAbdelkader.pdf',
  'سماح عبد اللطيف محمد عبد اللطيف':      'DrAsmaa.pdf',
  'مرفت حمدي مصطفي محمد علي':              'MarwaOmar.pdf',
  'ايمان جمال عبد الجواد ابراهيم':         'DrAmanyCV.pdf',
  'مصطفي اشرف عبد الفتاح عبد العزيز':     'CV Mostafa Farag.pdf',
};

// ── Arabic normalizer (same as migrate script) ────────────────────────────────
function normalizeName(raw: string): string {
  return raw
    .replace(/[أإآا]/g, 'ا')
    .replace(/^ا\.?\s*د\.?\s*[\/]?\s*/u, '')
    .replace(/^ا\.?\s*[\/]?\s*/u, '')
    .replace(/^د\.?\s*/u, '')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Raw PDF image extractor ───────────────────────────────────────────────────
// Scans the binary PDF for JPEG (SOI: FF D8) and PNG (‰PNG) signatures
// and extracts the first image found.
function extractFirstImageFromPDF(pdfBuffer: Buffer): Buffer | null {
  // Try JPEG first (most common in scanned CVs)
  const jpegSig = Buffer.from([0xFF, 0xD8, 0xFF]);
  let idx = pdfBuffer.indexOf(jpegSig);
  if (idx !== -1) {
    // Find JPEG end marker FF D9
    const endSig = Buffer.from([0xFF, 0xD9]);
    const endIdx = pdfBuffer.indexOf(endSig, idx + 3);
    if (endIdx !== -1 && endIdx - idx > 1000) {  // at least 1KB
      return pdfBuffer.slice(idx, endIdx + 2);
    }
  }

  // Try PNG (89 50 4E 47)
  const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const pngIdx = pdfBuffer.indexOf(pngSig);
  if (pngIdx !== -1) {
    // PNG ends with IEND chunk: 49 45 4E 44 AE 42 60 82
    const pngEnd = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    const pngEndIdx = pdfBuffer.indexOf(pngEnd, pngIdx + 8);
    if (pngEndIdx !== -1) {
      return pdfBuffer.slice(pngIdx, pngEndIdx + 8);
    }
  }

  return null;
}

// ── Convert raw image buffer → WebP file ─────────────────────────────────────
async function bufferToWebP(imgBuffer: Buffer, destPath: string): Promise<number> {
  await sharp(imgBuffer)
    .resize({ width: 400, height: 400, fit: 'cover', position: 'top' })
    .webp({ quality: 85 })
    .toFile(destPath);
  return fs.statSync(destPath).size;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📄 PDF Image Extraction → WebP → Next.js');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  CV_DIR     :', CV_DIR);
  console.log('  OUTPUT_DIR :', OUTPUT_DIR);
  console.log('─────────────────────────────────────────────────────────────\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Build normalized lookup from NAME_TO_PDF
  const normalizedPdfMap: Record<string, string> = {};
  for (const [name, pdf] of Object.entries(NAME_TO_PDF)) {
    normalizedPdfMap[normalizeName(name)] = pdf;
  }

  // Load all faculty that still have no photoUrl
  const members = await prisma.facultyMember.findMany({
    where: { photoUrl: null },
    select: { id: true, nameAr: true, photoUrl: true },
    orderBy: { nameAr: 'asc' },
  });

  console.log(`  Faculty still without photos: ${members.length}\n`);

  const stats = { extracted: 0, skipped: 0, noPdf: 0, noImage: 0, errors: 0 };

  for (const member of members) {
    const norm    = normalizeName(member.nameAr);
    const pdfFile = normalizedPdfMap[norm];
    const destPath  = path.join(OUTPUT_DIR, `${member.id}.webp`);
    const publicUrl = `${PUBLIC_PATH}/${member.id}.webp`;

    // Already done
    if (fs.existsSync(destPath)) {
      await prisma.facultyMember.update({ where: { id: member.id }, data: { photoUrl: publicUrl } });
      stats.skipped++;
      console.log(`  ⏭️  SKIP   : ${member.nameAr}`);
      continue;
    }

    if (!pdfFile) {
      stats.noPdf++;
      console.log(`  🔍 NO_PDF  : ${member.nameAr}  (norm: "${norm}")`);
      continue;
    }

    const pdfPath = path.join(CV_DIR, pdfFile);
    if (!fs.existsSync(pdfPath)) {
      stats.noPdf++;
      console.log(`  ⚠️  MISSING : ${pdfFile} for ${member.nameAr}`);
      continue;
    }

    try {
      const pdfBuf  = fs.readFileSync(pdfPath);
      const imgBuf  = extractFirstImageFromPDF(pdfBuf);

      if (!imgBuf) {
        stats.noImage++;
        console.log(`  🔲 NO_IMG  : No embedded image found in ${pdfFile}`);
        continue;
      }

      const bytes = await bufferToWebP(imgBuf, destPath);
      await prisma.facultyMember.update({
        where: { id: member.id },
        data:  { photoUrl: publicUrl },
      });
      stats.extracted++;
      console.log(`  ✅ OK      : ${member.nameAr}`);
      console.log(`              ${pdfFile} → ${publicUrl} (${(bytes/1024).toFixed(1)} KB)`);
    } catch (e: any) {
      stats.errors++;
      console.log(`  ❌ ERROR   : ${member.nameAr} — ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Extracted  : ${stats.extracted}`);
  console.log(`  ⏭️  Skipped    : ${stats.skipped}`);
  console.log(`  🔍 No PDF map : ${stats.noPdf}`);
  console.log(`  🔲 No image   : ${stats.noImage}`);
  console.log(`  ❌ Errors     : ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const allFiles = fs.existsSync(OUTPUT_DIR)
    ? fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'))
    : [];
  const totalKB = allFiles
    .map(f => fs.statSync(path.join(OUTPUT_DIR, f)).size)
    .reduce((a, b) => a + b, 0) / 1024;

  console.log(`\n  📦 Total WebP files in /uploads/faculty : ${allFiles.length}`);
  console.log(`  💾 Total size                          : ${totalKB.toFixed(1)} KB\n`);
}

main()
  .catch(e => { console.error('\n❌ Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
