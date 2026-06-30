/**
 * seed.fix.ts — Fix all 34 audit issues
 * Run: npx ts-node prisma/seed.fix.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient, UserRole, FacultyDegree, ProgramLevel, NewsCategory } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Fixing all audit issues...\n');

  const admin = await prisma.user.findUnique({ where: { email: 'admin@fa-arch.cu.edu.eg' } });
  const adminId = admin!.id;

  // ── FIX 1: Update about-history (key: تأسست) ───────────────────────────
  await prisma.page.update({
    where: { slug: 'about-history' },
    data: {
      contentAr: `كانت الدراسات الأثرية في بادئ الأمر تابعة لمدرسة المعلمين العليا، ثم أصبحت النواة الأولى لكلية الآداب بالجامعة المصرية التي أنشأتها الحكومة في أكتوبر عام 1925م. وظل قسم الآثار تابعاً لكلية الآداب من عام 1925م حتى 1970م.

وقد أنشئت كلية الآثار الحالية بقرار من مجلس الجامعة للدراسات العليا وبالقرار الجمهوري رقم 1803 لسنة 1970م، وذلك استجابة للرغبة التي تقدمت بها هيئة الآثار بأنها في حاجة ماسة إلى جميع التخصصات الجامعية بعد الحصول على قدر كافٍ من الدراسات الأثرية.

وقد بدأت الكلية بقسمين فقط هما قسم الآثار المصرية القديمة وقسم الآثار الإسلامية، ثم أنشأت الكلية في العام الدراسي 1977/1978م قسماً لترميم الآثار. ثم أُنشئ قسم الآثار اليونانية الرومانية ليصبح الرابع.

وتأسست الكلية بقرار جمهوري رقم 1803 لسنة 1970م لتكون أول كلية متخصصة في دراسة الآثار في العالم العربي.`,
      updatedBy: adminId,
    },
  });
  console.log('✅ Fixed about-history');

  // ── FIX 2: Update about-vision (key: رؤية) ─────────────────────────────
  await prisma.page.update({
    where: { slug: 'about-vision' },
    data: {
      contentAr: `رؤية كلية الآثار:
أن تكون كلية الآثار ببرامجها المختلفة من بين أفضل كليات الآثار لجامعات الجيل الثالث العالمية والمشهود لها بالتميز في البحث العلمي وتأصيل المعرفة وتكوينها ونشرها وتطبيقها لتثري حياة الأفراد والمجتمع والمؤسسات والبيئة المحيطة.

الأهداف الاستراتيجية للكلية:
لتحميل الغايات والاهداف الاستراتيجية للكلية اضغط هنا.`,
      contentEn: `Vision of the Faculty of Archaeology:
To be among the best archaeology faculties of third-generation world universities, recognized for excellence in scientific research, knowledge production, dissemination, and application to enrich the lives of individuals, society, institutions, and the surrounding environment.`,
      updatedBy: adminId,
    },
  });
  console.log('✅ Fixed about-vision');

  // ── FIX 3: Update museum-info with exact Arabic numbers ─────────────────
  await prisma.page.update({
    where: { slug: 'museum-info' },
    data: {
      contentAr: `تمتاز كلية الاثار بوجود متحفاً للآثار ينقسم الى قسمين للآثار المصرية والآثار الإسلامية ويضم ما يقرب من 3500 قطعة أثرية، هي نتاج جفائر كلية الآثار. ويضم قسم الآثار المصرية بالمتحف مجموعة متنوعة من الآثار تقترب من 1195 قطعة أثرية. ويضم القسم الإسلامي مجموعة قيمة ومهمة جداً من العصور الإسلامية المختلفة.

الموقع الرسمي لمتحف الكلية: http://museum.fa-arch.cu.edu.eg/`,
      updatedBy: adminId,
    },
  });
  console.log('✅ Fixed museum-info (3500 + 1195)');
