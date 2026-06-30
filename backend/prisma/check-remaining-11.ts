import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(__dirname, '../../frontend/public/uploads/faculty/photos');

function getAvailablePhotos(): string[] {
  const files = fs.readdirSync(PHOTOS_DIR);
  return files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.gif', '.png'].includes(ext);
  });
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 CHECKING REMAINING 11 FACULTY WITHOUT PHOTOS');
  console.log('='.repeat(70) + '\n');
  
  const facultyWithoutPhotos = await prisma.facultyMember.findMany({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: '' }
      ]
    },
    include: {
      department: {
        select: {
          nameAr: true
        }
      }
    },
    orderBy: { nameAr: 'asc' }
  });
  
  const availablePhotos = getAvailablePhotos();
  console.log(`📁 Total available photos: ${availablePhotos.length}\n`);
  
  console.log(`👤 Faculty without photos: ${facultyWithoutPhotos.length}\n`);
  console.log('='.repeat(70));
  
  for (const member of facultyWithoutPhotos) {
    console.log(`\n${member.nameAr}`);
    console.log(`   Department: ${member.department?.nameAr || 'N/A'}`);
    console.log(`   Degree: ${member.degree}`);
    
    // Extract name parts
    const cleanName = member.nameAr
      .replace(/أ\.د\.|أ\. د\.|د\./g, '')
      .replace(/\/|،|,/g, ' ')
      .trim();
    
    const nameParts = cleanName.split(/\s+/).filter(w => w.length > 2);
    console.log(`   Name parts: ${nameParts.join(', ')}`);
    
    // Search for potential matches
    const potentialMatches: string[] = [];
    
    for (const photo of availablePhotos) {
      const photoLower = photo.toLowerCase();
      const photoName = path.basename(photo, path.extname(photo)).toLowerCase();
      
      // Check each name part
      for (const part of nameParts) {
        const transliterations = [
          part,
          transliterate(part).toLowerCase(),
        ];
        
        for (const trans of transliterations) {
          if (photoName.includes(trans.toLowerCase())) {
            if (!potentialMatches.includes(photo)) {
              potentialMatches.push(photo);
            }
          }
        }
      }
    }
    
    if (potentialMatches.length > 0) {
      console.log(`   ✅ Potential matches found:`);
      potentialMatches.forEach(p => console.log(`      → ${p}`));
    } else {
      console.log(`   ❌ No potential matches found`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('DONE');
  console.log('='.repeat(70) + '\n');
}

function transliterate(arabic: string): string {
  const map: Record<string, string> = {
    'محمد': 'mohamed',
    'أحمد': 'ahmed',
    'علي': 'ali',
    'عبد': 'abd',
    'حسن': 'hassan',
    'حسين': 'hussein',
    'سعيد': 'saeed',
    'عمر': 'omar',
    'خالد': 'khaled',
    'طارق': 'tarek',
    'ياسر': 'yasser',
    'مصطفى': 'mostafa',
    'محمود': 'mahmoud',
    'إبراهيم': 'ibrahim',
    'منصور': 'mansour',
    'جمال': 'gamal',
    'رمضان': 'ramadan',
    'سليمان': 'soliman',
    'عماد': 'emad',
    'شريف': 'sherif',
    'رحاب': 'rehab',
    'هدي': 'huda',
    'غادة': 'ghada',
    'نجاح': 'nagah',
    'مروة': 'marwa',
    'سوزان': 'susan',
    'نهي': 'noha',
    'رهام': 'reham',
    'ايمان': 'eman',
    'أماني': 'amany',
    'هيام': 'hiyam',
    'منى': 'mona',
    'مني': 'mona',
    'نيللي': 'nelli',
    'فاطمة': 'fatma',
    'عزة': 'azza',
    'هبة': 'heba',
    'سعاد': 'soad',
    'علا': 'ola',
    'داليا': 'dalia',
    'رشدية': 'rashdia',
    'زكية': 'zakiya',
    'زينب': 'zeinab',
    'نجلاء': 'naglaa',
    'سامية': 'samia',
    'سهام': 'siham',
    'نادية': 'nadia',
    'وفاء': 'wafaa',
    'عصام': 'essam',
    'حامد': 'hamed',
    'صلاح': 'salah',
    'نبيل': 'nabil',
    'فتحي': 'fathy',
    'رشدي': 'roshdy',
    'سمير': 'samir',
    'نور': 'nour',
    'هشام': 'hesham',
    'وليد': 'walid',
    'جابر': 'gaber',
    'عاطف': 'atef',
    'منير': 'mounir',
    'بسام': 'bassam',
    'فؤاد': 'fouad',
    'كمال': 'kamal',
    'سيد': 'sayed',
    'صفاء': 'safaa',
    'شيماء': 'shimaa',
    'ريم': 'reem',
    'مها': 'maha',
    'لمياء': 'lamiaa',
    'ياسمين': 'yasmin',
    'نسرين': 'nisreen',
    'كريم': 'karim',
    'باسم': 'basem',
    'ماهر': 'maher',
    'ثناء': 'thanaa',
    'صباح': 'sabah',
    'رجب': 'ragab',
    'جابر': 'gaber',
    'عوض': 'awad',
    'ربيع': 'rabie',
    'سالم': 'salem',
    'حلمي': 'helmy',
    'هاني': 'hany',
    'رشا': 'rasha',
    'إيمان': 'eman',
    'سلوى': 'salwa',
    'هناء': 'hanaa',
    'صفوت': 'safwat',
    'مراد': 'mourad',
    'نصر': 'nasr',
    'بدر': 'badr',
    'أمل': 'amal',
    'سميرة': 'samira',
    'ليلى': 'laila',
  };
  
  return map[arabic] || arabic;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
