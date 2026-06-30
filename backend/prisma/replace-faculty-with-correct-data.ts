import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🗑️  Deleting all current faculty members...\n');
  
  const deleted = await prisma.facultyMember.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} faculty members\n`);
  
  console.log('📝 Now run the correct seed script:');
  console.log('   npx tsx prisma/seed.migration.ts\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
