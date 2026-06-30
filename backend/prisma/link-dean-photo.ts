import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dean = await prisma.facultyMember.findFirst({
    where: {
      nameAr: {
        contains: 'عميد الكلية'
      }
    }
  });
  
  if (dean) {
    await prisma.facultyMember.update({
      where: { id: dean.id },
      data: { photoUrl: '/uploads/faculty/photos/12DrHamza.jpg' }
    });
    console.log('✅ Dean photo linked successfully');
  } else {
    console.log('⚠️  Dean record not found');
  }
}

main()
  .catch((e) => console.error('Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
