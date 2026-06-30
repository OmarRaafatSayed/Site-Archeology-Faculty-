import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OUTPUT_DIR = path.resolve(process.cwd(), '../frontend/public/uploads/faculty');

async function main() {
  const total      = await prisma.facultyMember.count();
  const withPhoto  = await prisma.facultyMember.count({ where: { photoUrl: { not: null } } });
  const noPhoto    = await prisma.facultyMember.count({ where: { photoUrl: null } });

  console.log('\n📊 Faculty Photo Status');
  console.log('─────────────────────────────────────');
  console.log('  Total faculty    :', total);
  console.log('  With photoUrl    :', withPhoto, `(${((withPhoto/total)*100).toFixed(1)}%)`);
  console.log('  Without photoUrl :', noPhoto);

  // Check WebP files on disk
  const files = fs.existsSync(OUTPUT_DIR)
    ? fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webp'))
    : [];
  const totalKB = files
    .map(f => fs.statSync(path.join(OUTPUT_DIR, f)).size)
    .reduce((a, b) => a + b, 0) / 1024;

  console.log('\n  WebP files on disk  :', files.length);
  console.log('  Total size          :', totalKB.toFixed(1), 'KB');
  console.log('  Output dir          :', OUTPUT_DIR);

  // Cross-check: every DB photoUrl points to a real file
  const members = await prisma.facultyMember.findMany({
    where: { photoUrl: { not: null } },
    select: { id: true, nameAr: true, photoUrl: true },
  });

  let broken = 0;
  for (const m of members) {
    if (!m.photoUrl!.startsWith('/uploads/faculty/')) continue;
    const filename = m.photoUrl!.split('/').pop()!;
    const diskPath = path.join(OUTPUT_DIR, filename);
    if (!fs.existsSync(diskPath)) {
      broken++;
      console.log(`  ⚠️  BROKEN: ${m.nameAr} → ${m.photoUrl}`);
    }
  }
  if (broken === 0) console.log('\n  ✅ All DB photoUrls have matching files on disk');

  // Show who still has no photo
  const missing = await prisma.facultyMember.findMany({
    where: { photoUrl: null },
    select: { nameAr: true, degree: true },
    orderBy: { degree: 'desc' },
  });
  if (missing.length > 0) {
    console.log('\n  Members without photo:');
    for (const m of missing) console.log('   -', m.nameAr, `(${m.degree})`);
  }

  console.log('─────────────────────────────────────\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
