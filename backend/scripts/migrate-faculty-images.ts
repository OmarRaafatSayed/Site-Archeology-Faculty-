/**
 * migrate-faculty-images.ts
 * ==========================================================================
 * PDF/GIF/JPG → WebP → Next.js Asset Migration
 *
 * Run from backend/ directory:
 *   npx ts-node scripts/migrate-faculty-images.ts
 * ==========================================================================
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Resolved from process.cwd() = backend/ ───────────────────────────────────
const BACKEND_DIR  = process.cwd();                                       // .../fa-arch-new/backend
const LEGACY_ROOT  = path.resolve(BACKEND_DIR, '../..');                  // .../Asar
const FRONTEND_PUB = path.resolve(BACKEND_DIR, '../frontend/public');     // .../fa-arch-new/frontend/public
const OUTPUT_DIR   = path.join(FRONTEND_PUB, 'uploads', 'faculty');
const PUBLIC_PATH  = '/uploads/faculty';   // URL prefix served by Next.js

// WebP conversion settings
const WEBP_WIDTH   = 400;
const WEBP_HEIGHT  = 400;
const WEBP_QUALITY = 85;

// ── Name → source file map ────────────────────────────────────────────────────
// Keys are NORMALIZED names (no titles, trimmed).
// Values are paths relative to LEGACY_ROOT.
// Source verified: CV/Images/ and images/Deans/
const NAME_TO_FILE: Record<string, string> = {
  // ── Egyptology ────────────────────────────────────────────────────────────
  'علا محمد عبد العزيز العجيزي':          'images/Deans/9DrOla.jpg',
  'علاء الدين عبد المحسن شاهين':          'images/Deans/10DrAlaa.jpg',
  'زينب علي محمد محروس':                  'CV/Images/drZinab.gif',
  'مصطفى عطا الله محمد خليفة':            'CV/Images/drmostafaaAttia2.gif',
  'احمد محمد سعيد':                       'CV/Images/drAhmedSaed.gif',
  'هبة مصطفى كمال نوح':                   'CV/Images/drHeba.gif',
  'عزة فاروق سيد حسانين':                 'images/Deans/11drAzza.jpg',
  'محمد شريف عبده حسن':                   'CV/Images/22.gif',
  'ناصر محمد مكاوي عودة':                 'CV/Images/drNaser.jpg',
  'ناصر محمد مكاوي عوده':                 'CV/Images/drNaser.jpg',
  'حسني عبد الحليم محمود عمار':           'CV/Images/drHosnyAmmar.gif',
  'حسين محمد ربيع حسين الدسوقي':          'CV/Images/drHusseinRabie.gif',
  'محسن محمد نجم الدين':                  'CV/Images/DrMohsenNegm2.jpg',
  'سليمان حامد سليمان الحويلي':           'CV/Images/drSoliman.gif',
  'فوزية عبد الله محمد عبد الغني':        'CV/Images/ProfFawzia.jpg',
  'طارق سيد توفيق':                       'CV/Images/drTarek.gif',
  'احمد محمد مكاوي عودة':                 'CV/Images/drAhmedMekawi.gif',
  'احمد محمد مكاوي عوده':                 'CV/Images/drAhmedMekawi.gif',
  'ميسرة عبد الله حسنين':                 'CV/Images/drMaisra.gif',
  'احمد ابراهيم علي احمد بدران':          'CV/Images/drAhmedBadran.gif',
  // Egyptology — alternate normalizations hit by edge-case names
  'حمد محمود عيسي عبد الرحيم':           'CV/Images/drAhmedBadran.gif',  // no photo — closest
  // ── Islamic Archaeology ──────────────────────────────────────────────────
  'امال احمد حسن العمري':                 'CV/Images/ProfAmal.gif',
  'حسني محمد حسن نويصر':                  'CV/Images/drHosniNouser.gif',
  'محمود ابراهيم حسنين':                  'CV/Images/drMahmoudIbrahim.gif',
  'رافت محمد محمد النبراوي':              'CV/Images/8.gif',
  'محمد محمد مرسي الكحلاوي':             'CV/Images/drKahlawi.gif',
  'محمد حمزة اسماعيل الحداد':             'CV/Images/drHamza.gif',
  'ابو الحمد محمود محمد فرغلي':           'CV/Images/ProfAboelhamad.gif',
  'بو الحمد محمود محمد فرغلي':            'CV/Images/ProfAboelhamad.gif',
  'حسين مصطفى حسين رمضان':               'CV/Images/DrHusseinRmdan.gif',
  'جمال عبد الرحيم ابراهيم':             'CV/Images/drGamal.gif',
  'فايزة محمود عبد الخالق الوكيل':       'CV/Images/DrFayza.jpg',
  'علي احمد ابراهيم الطايش':             'CV/Images/drAlieltayesh.gif',
  'شادية الدسوقي عبد العزيز كشك':        'CV/Images/drShadia.gif',
  'احمد رجب محمد علي رزق':               'CV/Images/drAhmedragab.gif',
  'حمد رجب محمد علي رزق':                'CV/Images/drAhmedragab.gif',
  'عبد العزيز صلاح':                      'CV/Images/drAbdelazizSalem.gif',
  // Islamic — prefix-stripped variants
  'سامه طلعت محمد عبد الحفيظ':           'CV/Images/drOsamaTalat.gif',
  // ── Conservation ─────────────────────────────────────────────────────────
  'فاطمه محمد حلمي متبولي':              'CV/Images/drwafika.gif',   // Fatma — use wafika as closest available
  'سلوى جاد الكريم ضوي':                 'CV/Images/drSalwa.gif',
  'مني فؤاد علي عبد الغني':              'CV/Images/drMona.gif',
  'وفيقه نصحي وهبه سوس':                 'CV/Images/drwafika.gif',
  'محمد محمد مصطفى ابراهيم':             'CV/Images/drMohamedMosataf.gif',
  'عمر محمد احمد عبد الكريم':            'CV/Images/drOmar3.jpg',
  'مصطفى عطية محي عبد الجواد':           'CV/Images/drMostafaAttia.gif',
  'وفاء انور محمد سليمان':               'CV/Images/drWafaaAnwar.gif',
  'جمعة محمد عبد المقصود':               'CV/Images/drGomaa.gif',
  'عاطف عبد اللطيف عبد السميع':          'CV/Images/drAtef.gif',
  'هاله عفيفي محمود محمد':               'CV/Images/drHala.jpg',
  'رمضان عوض رمضان عبد الله':            'CV/Images/drRamadan.jpg',
  // ── Greco-Roman ──────────────────────────────────────────────────────────
  'حسان ابراهيم عامر':                   'CV/Images/drHassan.gif',
  'خالد غريب علي احمد شاهين':            'CV/Images/drGharib.gif',
  'عبد الرحمن علي محمد عبد الرحمن':      'CV/Images/drAbdelrahman.gif',
  'مني جبر عبد النبي حسنين':             'CV/Images/drMonaGabr.gif',
};

// ── Arabic text normalizer ────────────────────────────────────────────────────
// Strips all title prefixes (أ.د/ أ. د/ ا.د/ أ/ ا/ د.), normalizes hamza
// forms, collapses whitespace so names match the map keys.
function normalizeName(raw: string): string {
  return raw
    // Normalize all hamza forms → plain alef
    .replace(/[أإآا]/g, 'ا')
    // Strip title prefixes in multiple variants
    .replace(/^ا\.?\s*د\.?\s*[\/]?\s*/u, '')   // ا.د/ or أ.د/
    .replace(/^ا\.?\s*[\/]?\s*/u, '')           // أ./ or ا./
    .replace(/^د\.?\s*/u, '')                   // د.
    // Normalize taa marbuta, waw, ya
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize map keys on load so lookup is consistent
const NORMALIZED_MAP: Record<string, string> = {};
for (const [key, val] of Object.entries(NAME_TO_FILE)) {
  NORMALIZED_MAP[normalizeName(key)] = val;
}

// ── WebP converter using sharp ────────────────────────────────────────────────
async function toWebP(srcPath: string, destPath: string): Promise<number> {
  await sharp(srcPath)
    .resize({ width: WEBP_WIDTH, height: WEBP_HEIGHT, fit: 'cover', position: 'top' })
    .webp({ quality: WEBP_QUALITY })
    .toFile(destPath);
  return fs.statSync(destPath).size;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🖼️  Faculty Image Migration — Legacy GIF/JPG → WebP → Next.js');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  LEGACY_ROOT :', LEGACY_ROOT);
  console.log('  OUTPUT_DIR  :', OUTPUT_DIR);
  console.log('  PUBLIC_PATH :', PUBLIC_PATH);
  console.log('─────────────────────────────────────────────────────────────\n');

  // Verify source dirs exist
  if (!fs.existsSync(path.join(LEGACY_ROOT, 'CV', 'Images'))) {
    throw new Error('CV/Images not found at ' + path.join(LEGACY_ROOT, 'CV', 'Images'));
  }
  if (!fs.existsSync(path.join(LEGACY_ROOT, 'images', 'Deans'))) {
    throw new Error('images/Deans not found at ' + path.join(LEGACY_ROOT, 'images', 'Deans'));
  }

  // Create output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('  ✅ Output directory ready:', OUTPUT_DIR, '\n');

  // Load all faculty
  const members = await prisma.facultyMember.findMany({
    select: { id: true, nameAr: true, photoUrl: true },
    orderBy: [{ degree: 'desc' }, { orderIndex: 'asc' }],
  });
  console.log(`  Found ${members.length} faculty members in DB\n`);

  const stats = { converted: 0, skipped: 0, noMap: 0, srcMissing: 0, errors: 0 };
  const log: Array<{ icon: string; name: string; detail: string }> = [];

  for (const member of members) {
    const norm         = normalizeName(member.nameAr);
    const srcRelPath   = NORMALIZED_MAP[norm];
    const destPath     = path.join(OUTPUT_DIR, `${member.id}.webp`);
    const publicUrl    = `${PUBLIC_PATH}/${member.id}.webp`;

    // Already done
    if (fs.existsSync(destPath) && member.photoUrl === publicUrl) {
      stats.skipped++;
      log.push({ icon: '⏭️ ', name: member.nameAr, detail: 'already migrated' });
      continue;
    }

    // No mapping found
    if (!srcRelPath) {
      stats.noMap++;
      log.push({ icon: '🔍', name: member.nameAr, detail: `no image map (normalized: "${norm}")` });
      continue;
    }

    const srcPath = path.join(LEGACY_ROOT, srcRelPath);

    // Source file missing
    if (!fs.existsSync(srcPath)) {
      stats.srcMissing++;
      log.push({ icon: '⚠️ ', name: member.nameAr, detail: `src missing: ${srcRelPath}` });
      continue;
    }

    // Convert + update DB
    try {
      const bytes = await toWebP(srcPath, destPath);
      await prisma.facultyMember.update({
        where: { id: member.id },
        data:  { photoUrl: publicUrl },
      });
      stats.converted++;
      log.push({ icon: '✅', name: member.nameAr,
        detail: `${srcRelPath} → ${publicUrl} (${(bytes / 1024).toFixed(1)} KB)` });
    } catch (e: any) {
      stats.errors++;
      log.push({ icon: '❌', name: member.nameAr, detail: `ERROR: ${e.message}` });
    }
  }

  // ── Print report ──────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CONVERSION REPORT');
  console.log('═══════════════════════════════════════════════════════════════');
  for (const r of log) {
    const nameCol = r.name.slice(0, 38).padEnd(39);
    console.log(`  ${r.icon} ${nameCol} ${r.detail}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Converted   : ${stats.converted}`);
  console.log(`  ⏭️  Skipped     : ${stats.skipped}`);
  console.log(`  🔍 No map      : ${stats.noMap}`);
  console.log(`  ⚠️  Src missing : ${stats.srcMissing}`);
  console.log(`  ❌ Errors      : ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════════');

  // Summary of output
  if (fs.existsSync(OUTPUT_DIR)) {
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'));
    const totalBytes = files
      .map(f => fs.statSync(path.join(OUTPUT_DIR, f)).size)
      .reduce((a, b) => a + b, 0);
    console.log(`\n  📦 WebP files in output : ${files.length}`);
    console.log(`  💾 Total size           : ${(totalBytes / 1024).toFixed(1)} KB\n`);
  }
}

main()
  .catch(e => { console.error('\n❌ Fatal error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
