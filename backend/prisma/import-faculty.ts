import { PrismaClient, FacultyDegree } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExtractedFaculty {
  name: string;
  email: string | null;
  cv_file: string | null;
  raw_text: string;
}

interface FacultyByDept {
  [key: string]: ExtractedFaculty[];
}

// Map old department names to new department IDs
const DEPT_MAP: Record<string, string> = {
  'Egyptology': 'egyptology',
  'Islamic Archaeology': 'islamic',
  'Conservation': 'conservation',
  'Greco-Roman': 'greco-roman'
};

// Extract degree from name
function extractDegree(name: string): FacultyDegree {
  if (name.includes('أ.د.') || name.includes('Prof.') || name.includes('استاذ') || name.includes('Professor')) {
    return FacultyDegree.professor;
  }
  if (name.includes('استاذ مساعد') || name.includes('Assistant Professor')) {
    return FacultyDegree.assistant_professor;
  }
  if (name.includes('مدرس') || name.includes('Lecturer')) {
    return FacultyDegree.lecturer;
  }
  if (name.includes('مدرس مساعد') || name.includes('Assistant Lecturer')) {
    return FacultyDegree.assistant_lecturer;
  }
  if (name.includes('معيد') || name.includes('Demonstrator')) {
    return FacultyDegree.demonstrator;
  }
  
  // Default to lecturer if unclear
  return FacultyDegree.lecturer;
}

// Clean name - remove titles and extra text
function cleanName(rawName: string): { nameAr: string; degree: FacultyDegree; specialization: string } {
  let name = rawName;
  
  // Remove common phrases
  name = name.replace(/اضغط هنا.*$/g, '');
  name = name.replace(/البريد الالكتروني.*$/g, '');
  name = name.replace(/\(A\)|\(E\)/g, '');
  
  // Extract degree first
  const degree = extractDegree(name);
  
  // Remove degree titles
  name = name.replace(/أ\.د\.|د\.|Prof\.|Dr\./g, '');
  name = name.replace(/استاذ متفرغ|استاذ مساعد متفرغ|استاذ مساعد|استاذ|مدرس مساعد|مدرس|معيد/g, '');
  name = name.replace(/Professor|Assistant Professor|Lecturer|Assistant Lecturer|Demonstrator/gi, '');
  
  // Extract specialization (usually after the name)
  let specialization = '';
  const specializationMatch = name.match(/(آثار|فنون|ديانة|لغة|تاريخ|عمارة|ترميم|نصوص|نقوش|حفائر|متاحف)[\s\w]+/);
  if (specializationMatch) {
    specialization = specializationMatch[0].trim();
    name = name.replace(specialization, '');
  }
  
  // Clean up name
  name = name.trim();
  name = name.replace(/\s+/g, ' '); // Multiple spaces to single
  
  return {
    nameAr: name,
    degree,
    specialization: specialization || 'غير محدد'
  };
}

async function importFacultyData() {
  console.log('\n🚀 Starting Faculty Import to Database...\n');
  
  // Read extracted data
  const dataPath = path.join(__dirname, '../../scripts/extracted_faculty.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const facultyByDept: FacultyByDept = JSON.parse(rawData);
  
  // Get departments from database
  const departments = await prisma.department.findMany({
    where: {
      slug: { in: Object.values(DEPT_MAP) }
    }
  });
  
  const deptMap = new Map(departments.map((d: any) => [d.slug, d.id]));
  
  let totalImported = 0;
  let totalSkipped = 0;
  
  for (const [deptName, facultyList] of Object.entries(facultyByDept)) {
    const deptSlug = DEPT_MAP[deptName];
    const departmentId = deptMap.get(deptSlug);
    
    if (!departmentId) {
      console.log(`❌ Department not found: ${deptName}`);
      continue;
    }
    
    console.log(`\n📚 Processing ${deptName} (${facultyList.length} members)...`);
    
    for (const faculty of facultyList) {
      try {
        // Clean and extract data
        const { nameAr, degree, specialization } = cleanName(faculty.name);
        
        // Skip if name is too short or invalid
        if (nameAr.length < 5 || !nameAr.match(/[\u0600-\u06FF]/)) {
          console.log(`   ⏭️  Skipping invalid name: ${nameAr}`);
          totalSkipped++;
          continue;
        }
        
        // Generate email if not provided
        let email = faculty.email;
        if (!email) {
          // Create email from name (simplified)
          const nameParts = nameAr.split(' ').filter(p => p.length > 2);
          if (nameParts.length >= 2) {
            email = `${nameParts[0]}.${nameParts[1]}@fa-arch.cu.edu.eg`.toLowerCase();
            // Remove Arabic characters from email
            email = email.replace(/[\u0600-\u06FF]/g, '');
          }
        }
        
        // Prepare CV file path
        let cvFile = faculty.cv_file;
        if (cvFile) {
          // Convert old path to new path
          cvFile = cvFile.replace('CV/', '/uploads/faculty/cvs/');
        }
        
        // Check if faculty already exists
        const existing = await prisma.facultyMember.findFirst({
          where: {
            nameAr: nameAr,
            departmentId: departmentId
          }
        });
        
        if (existing) {
          console.log(`   ⏭️  Already exists: ${nameAr}`);
          totalSkipped++;
          continue;
        }
        
        // Create faculty member
        await prisma.facultyMember.create({
          data: {
            departmentId,
            nameAr,
            nameEn: '', // Will be added manually later
            degree,
            specializationAr: specialization,
            specializationEn: '',
            email: email || undefined,
            photoUrl: cvFile || undefined, // Use CV as placeholder for now
            isActive: true,
            orderIndex: totalImported
          }
        });
        
        console.log(`   ✅ Imported: ${nameAr} (${degree})`);
        totalImported++;
        
      } catch (error: any) {
        console.log(`   ❌ Error importing ${faculty.name.substring(0, 50)}: ${error.message}`);
        totalSkipped++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Import Complete!`);
  console.log(`   Total Imported: ${totalImported}`);
  console.log(`   Total Skipped: ${totalSkipped}`);
  console.log('='.repeat(60) + '\n');
}

importFacultyData()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
