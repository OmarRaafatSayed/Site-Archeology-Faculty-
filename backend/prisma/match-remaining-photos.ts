import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(__dirname, '../../frontend/public/uploads/faculty/photos');

// Get all available photo files
function getAvailablePhotos(): string[] {
  const files = fs.readdirSync(PHOTOS_DIR);
  return files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.gif', '.png'].includes(ext);
  });
}

// Extract name keywords from Arabic name
function extractKeywords(nameAr: string): string[] {
  // Remove titles
  let cleaned = nameAr
    .replace(/أ\.د\.|أ\. د\.|د\./g, '')
    .replace(/\/|،|,/g, ' ')
    .trim();
  
  // Split into words and filter meaningful ones
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  return words;
}

// Try to match photo by name similarity
function findBestPhotoMatch(nameAr: string, availablePhotos: string[]): string | null {
  const keywords = extractKeywords(nameAr);
  
  // Name patterns to check
  const nameVariations = [
    ...keywords,
    keywords.join(''),
    keywords.slice(0, 2).join(''),
  ];
  
  for (const photo of availablePhotos) {
    const photoLower = photo.toLowerCase();
    const photoWithoutExt = path.basename(photo, path.extname(photo)).toLowerCase();
    
    for (const keyword of keywords) {
      const keywordLatin = transliterateArabicToLatin(keyword);
      
      if (photoWithoutExt.includes(keywordLatin.toLowerCase())) {
        return photo;
      }
    }
  }
  
  return null;
}

// Basic transliteration helper
function transliterateArabicToLatin(arabic: string): string {
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
  };
  
  return map[arabic] || arabic;
}

async function main() {
  console.log('\n🔍 Matching remaining photos...\n');
  
  const availablePhotos = getAvailablePhotos();
  console.log(`📁 Found ${availablePhotos.length} available photos\n`);
  
  // Get faculty without photos
  const facultyWithoutPhotos = await prisma.facultyMember.findMany({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: '' }
      ]
    },
    orderBy: { nameAr: 'asc' }
  });
  
  console.log(`👤 Found ${facultyWithoutPhotos.length} faculty without photos\n`);
  console.log('═'.repeat(70));
  
  let matched = 0;
  const suggestions: Array<{name: string, photos: string[]}> = [];
  
  for (const member of facultyWithoutPhotos) {
    const keywords = extractKeywords(member.nameAr);
    const possibleMatches: string[] = [];
    
    // Check each keyword against photo names
    for (const keyword of keywords) {
      const keywordLatin = transliterateArabicToLatin(keyword);
      
      for (const photo of availablePhotos) {
        const photoLower = path.basename(photo, path.extname(photo)).toLowerCase();
        
        if (photoLower.includes(keywordLatin.toLowerCase())) {
          if (!possibleMatches.includes(photo)) {
            possibleMatches.push(photo);
          }
        }
      }
    }
    
    if (possibleMatches.length > 0) {
      console.log(`\n👤 ${member.nameAr}`);
      console.log(`   Keywords: ${keywords.join(', ')}`);
      console.log(`   Possible matches:`);
      possibleMatches.forEach(p => console.log(`      - ${p}`));
      
      suggestions.push({
        name: member.nameAr,
        photos: possibleMatches
      });
      matched++;
    } else {
      console.log(`\n❌ ${member.nameAr}`);
      console.log(`   Keywords: ${keywords.join(', ')}`);
      console.log(`   No matches found`);
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`   Faculty without photos: ${facultyWithoutPhotos.length}`);
  console.log(`   Potential matches found: ${matched}`);
  console.log(`   No matches: ${facultyWithoutPhotos.length - matched}`);
  console.log('');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
