-- ================================================================
-- Performance Indexes — Phase 9: Performance Optimization
-- استعلامات متكررة تحتاج فهرسة إضافية لتحسين الأداء
-- يُشغَّل بعد full_text_search_indexes.sql
-- ================================================================

-- ─── News: الاستعلامات الأكثر شيوعاً ──────────────────────────

-- جلب الأخبار المنشورة مرتبة بالتاريخ (الصفحة الرئيسية + قائمة الأخبار)
CREATE INDEX IF NOT EXISTS idx_news_published_at_desc
  ON news(published_at DESC)
  WHERE is_published = true;

-- الأخبار بالـ category + published معاً (فلترة متكررة)
CREATE INDEX IF NOT EXISTS idx_news_category_published
  ON news(category, is_published, published_at DESC);

-- ─── Faculty: الاستعلامات الأكثر شيوعاً ───────────────────────

-- فهرس على is_active — معظم الاستعلامات بتفلتر على active فقط
CREATE INDEX IF NOT EXISTS idx_faculty_active_department
  ON faculty_members(department_id, is_active)
  WHERE is_active = true;

-- فرز حسب order_index (ترتيب العرض)
CREATE INDEX IF NOT EXISTS idx_faculty_order
  ON faculty_members(order_index, department_id);

-- ─── Students: الاستعلامات الأكثر شيوعاً ──────────────────────

-- جلب طلاب قسم معين بسنة دراسية (الجداول + النتائج)
CREATE INDEX IF NOT EXISTS idx_students_department_year
  ON students(department_id, academic_year);

-- البحث بالـ university_id (تسجيل الدخول + الاستعلامات السريعة)
-- university_id على students مختلف عن users
CREATE INDEX IF NOT EXISTS idx_students_enrollment_year
  ON students(enrollment_year);

-- ─── Exam Results: أهم الاستعلامات ────────────────────────────

-- جلب نتائج طالب بعام دراسي + فصل (dashboard الطالب)
CREATE INDEX IF NOT EXISTS idx_results_student_year_semester
  ON exam_results(student_id, academic_year, semester)
  WHERE is_published = true;

-- جلب نتائج مقرر بعام + فصل (Admin view)
CREATE INDEX IF NOT EXISTS idx_results_course_year
  ON exam_results(course_id, academic_year, semester);

-- ─── Class Schedules: جداول الدراسة ───────────────────────────

-- جدول القسم + الفصل الدراسي + العام (استعلام الـ dashboard)
CREATE INDEX IF NOT EXISTS idx_schedule_year_semester
  ON class_schedules(academic_year, semester);

-- ─── Exam Schedules ────────────────────────────────────────────

-- جلب امتحانات قادمة بعد تاريخ معين (upcoming filter)
CREATE INDEX IF NOT EXISTS idx_exam_schedule_date
  ON exam_schedules(exam_date, academic_year);

CREATE INDEX IF NOT EXISTS idx_exam_schedule_course_year
  ON exam_schedules(course_id, academic_year);

-- ─── Publications ──────────────────────────────────────────────

-- أبحاث منشورة مرتبة بالسنة (صفحة المجلة)
CREATE INDEX IF NOT EXISTS idx_publications_published_year
  ON publications(is_published, publish_year DESC)
  WHERE is_published = true;

-- ─── Library Books ─────────────────────────────────────────────

-- فلترة بالسنة (استعلام شائع)
CREATE INDEX IF NOT EXISTS idx_library_publish_year
  ON library_books(publish_year DESC);

-- ─── Conference Registrations ──────────────────────────────────

-- عدد المسجلين لكل مؤتمر (يظهر في صفحة المؤتمر)
CREATE INDEX IF NOT EXISTS idx_conf_reg_conf_status
  ON conference_registrations(conference_id, status);

-- ─── Courses ───────────────────────────────────────────────────

-- المقررات النشطة بفصل + سنة دراسية (جداول + نتائج)
CREATE INDEX IF NOT EXISTS idx_courses_active_semester
  ON courses(department_id, semester, academic_year)
  WHERE is_active = true;

-- ─── Pages: البحث بالـ slug (cache miss scenario) ──────────────
-- slug بالفعل unique index من Prisma — لا يحتاج تكرار

-- ─── AuditLog: تنظيف السجلات القديمة (يُستخدم في cron job) ────
CREATE INDEX IF NOT EXISTS idx_audit_action_created
  ON audit_logs(action, created_at DESC);

-- ─── Users: الاستعلامات الشائعة ───────────────────────────────

-- جلب المستخدمين النشطين بالـ role (Admin dashboard)
CREATE INDEX IF NOT EXISTS idx_users_role_active
  ON users(role, is_active);

-- ─── ANALYZE: تحديث إحصائيات الـ planner بعد الإنشاء ──────────
ANALYZE users;
ANALYZE faculty_members;
ANALYZE students;
ANALYZE exam_results;
ANALYZE news;
ANALYZE publications;
ANALYZE class_schedules;
ANALYZE exam_schedules;
ANALYZE library_books;
ANALYZE conferences;
ANALYZE conference_registrations;
ANALYZE audit_logs;
