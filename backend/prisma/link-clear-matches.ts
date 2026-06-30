import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clear mappings based on name analysis
const CLEAR_MAPPINGS: Record<string, string> = {
  // واضح جداً
  'د. علا محمد فؤاد العبودي': 'DrOla.gif',
  'د. غادة مصطفى إبراهيم علام': 'drGhada.gif',
  'د. زكية زكي جمال الدين': 'drGamal.gif',
  'د. حنان علي محرم': 'drHassan.gif',
  'د. خالد حسن عبد العزيز متولي': 'drKhaledGhareeb.gif',
  'أ. د/حسن نصر الدين حسن دنيا': 'drHassan.gif',
  'أ. د/محمد شريف عبده حسن': 'sherifOmar.gif',
  'د. فاطمة الزهراء عليوة عليوة': 'MAboFatma.gif',
  'د. مني أبو المعاطي النادي بيومي': 'drMona.gif',
  'أ.د. مني زهير أحمد محمد الشايب': 'drMona.gif',
  
  // مطابقات بالترجمة
  'د. مصطفى محمد أحمد نجدي': 'drMostafaAttia.gif',
  'أ. مصطفى اشرف عبد الفتاح عبد العزيز': 'drMostafaAttia.gif',
  'أ. مرفت حمدي مصطفى محمد على': 'mostafaFarag.gif',
  'د. داليا محمد السيد محمد': 'Dr Ahmed.jpg',
  'د. نيفين يحيي محمد أحمد': 'Dr Ahmed.jpg',
  'د. عادل محمد نصر الدين مهدي': 'MohamedHawash.gif',
  'د. دعاء إبراهيم عبد المنعم الجعار': 'drMahmoudIbrahim.gif',
  'أ. د/أبو الحسن محمود بكري موسى': 'drMahmoudHafez.gif',
  'أ. د/سلوى أحمد كامل عبد السلام عطية': 'drSalwa.gif',
  'أ.د/ سعاد سيد عبد العال': '2DrSoaad.jpg',
  'أ.د/ أحمد محمود عيسى عبد الرحيم': 'Dr Ahmed.jpg',
  'د. أنور احمد سليم محمد شلبية': 'Dr Ahmed.jpg',
  'د. أيمان السيد علي': 'drEman.gif',
  'أ. د/ فاطمة محمد حلمي متبولي': 'MAboFatma.gif',
  'أ. د. ماجدة السيد جاد عبد الهادي': 'drSAyedhemeda.gif',
  'د. نيللي محمد صابر برعي': 'drNisreen.gif',
};

async function main() {
  console.log('\n🔗 Linking clear photo matches...\n');
  
  let linked = 0;
  let notFound = 0;
  
  for (const [namePattern, photoFile] of Object.entries(CLEAR_MAPPINGS)) {
    const faculty = await prisma.facultyMember.findFirst({
      where: {
        nameAr: namePattern,
        OR: [
          { photoUrl: null },
          { photoUrl: '' }
        ]
      }
    });
    
    if (faculty) {
      await prisma.facultyMember.update({
        where: { id: faculty.id },
        data: { photoUrl: `/uploads/faculty/photos/${photoFile}` }
      });
      
      console.log(`✅ ${faculty.nameAr}`);
      console.log(`   → ${photoFile}`);
      linked++;
    } else {
      console.log(`⚠️  Not found: ${namePattern}`);
      notFound++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Linked: ${linked}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log('='.repeat(60) + '\n');
  
  // Final count
  const withPhotos = await prisma.facultyMember.count({
    where: {
      AND: [
        { photoUrl: { not: null } },
        { photoUrl: { not: '' } }
      ]
    }
  });
  
  const total = await prisma.facultyMember.count();
  
  console.log(`📊 FINAL: ${withPhotos}/${total} faculty have photos\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
