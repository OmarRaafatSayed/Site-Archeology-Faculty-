/**
 * fix-photo-urls.ts
 * Fixes all faculty member photoUrl values that are relative paths (not starting
 * with "/" or "http") — sets them to null so next/image doesn't crash.
 * Run: npx ts-node prisma/fix-photo-urls.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing faculty member photoUrl values...\n');

  // Fetch all faculty with a non-null photoUrl
  const members = await prisma.facultyMember.findMany({
    where: { photoUrl: { not: null } },
    select: { id: true, nameAr: true, photoUrl: true },
  });

  let fixed = 0;
  let kept = 0;

  for (const m of members) {
    const url = m.photoUrl!;
    const isValid = url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');

    if (!isValid) {
      await prisma.facultyMember.update({
        where: { id: m.id },
        data: { photoUrl: null },
      });
      fixed++;
      console.log(`  FIXED → null  : ${m.nameAr} | was: ${url}`);
    } else {
      kept++;
    }
  }

  console.log(`\n✅ Done — Fixed: ${fixed} | Already valid: ${kept}`);
  console.log(`   Total faculty with photoUrl: ${members.length}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
