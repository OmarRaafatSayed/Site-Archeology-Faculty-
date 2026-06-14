# Software Requirements Specification (SRS)
## موقع كلية الآثار — جامعة القاهرة (إعادة البناء)

**الإصدار:** 1.0  
**التاريخ:** يونيو 2026  
**الحالة:** مسودة أولى  
**المراجع:** BRD v1.0 | FRD v1.0

---

## 1. مقدمة

### 1.1 الغرض من المستند
هذا المستند يحدد المتطلبات التقنية والوظيفية الكاملة لبناء موقع كلية الآثار — جامعة القاهرة من الصفر. يُستخدم كمرجع رئيسي لفريق التطوير طوال دورة حياة المشروع.

### 1.2 التقنيات المحددة

| الطبقة | التقنية | الإصدار المستهدف |
|--------|---------|----------------|
| **Frontend** | Next.js | 14+ (App Router) |
| **Backend** | Node.js + Express.js | Node 20 LTS |
| **Database** | PostgreSQL | 16+ |
| **ORM** | Prisma | 5+ |
| **Authentication** | JWT + bcrypt | — |
| **File Storage** | Local / S3-compatible | — |
| **Cache** | Redis | 7+ |
| **Search** | PostgreSQL Full-Text Search | — |

### 1.3 المستندات المرجعية
- BRD v1.0 — Business Requirements Document
- FRD v1.0 — Functional Requirements Document
- تحليل الموقع الحالي (يونيو 2026)

---

## 2. نظرة عامة على النظام

### 2.1 المعمارية العامة

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│   Next.js 14 (SSR + SSG + ISR)  │  Admin CMS (Next.js)     │
└──────────────────┬──────────────────────────┬──────────────┘
                   │ HTTPS / REST API          │
┌──────────────────▼──────────────────────────▼──────────────┐
│                      API Layer (Node.js)                    │
│   Express.js  │  JWT Auth Middleware  │  Rate Limiter       │
│   Input Validation (Zod)  │  File Upload (Multer)           │
└──────────────────┬──────────────────────────┬──────────────┘
                   │                          │
┌──────────────────▼──────┐   ┌───────────────▼─────────────┐
│   PostgreSQL 16          │   │   Redis 7 (Cache/Sessions)  │
│   (via Prisma ORM)       │   │                             │
└─────────────────────────┘   └─────────────────────────────┘
```

### 2.2 أنماط الـ Rendering في Next.js

| نوع الصفحة | نمط الـ Rendering | السبب |
|-----------|-----------------|-------|
| الصفحة الرئيسية | ISR (revalidate: 300s) | محتوى يتغير أحياناً + أداء عالي |
| صفحات الكلية الثابتة | SSG | نادراً ما تتغير |
| صفحات الأخبار | ISR (revalidate: 60s) | تتحدث بانتظام |
| بوابة الطالب | CSR (Client-Side) | بيانات شخصية لا تُخزَّن في cache |
| لوحة التحكم | CSR | تفاعل مستمر + بيانات حساسة |
| صفحات المؤتمرات | SSG + ISR | محتوى شبه ثابت |

---

## 3. هيكل قاعدة البيانات (PostgreSQL)

### 3.1 مخطط الجداول الكامل

#### جدول المستخدمين
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id VARCHAR(20) UNIQUE,           -- رقم الجامعة (للطلاب/المحاضرين)
  username      VARCHAR(100) UNIQUE,          -- اسم المستخدم (للإداريين)
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL,           -- ENUM
  is_active     BOOLEAN DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM (
  'student', 'faculty', 'content_manager', 'admin'
);
```

#### جدول الأقسام
```sql
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name_ar     VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول أعضاء هيئة التدريس
```sql
CREATE TABLE faculty_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id   UUID REFERENCES departments(id) ON DELETE RESTRICT,
  name_ar         VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255) NOT NULL,
  degree          faculty_degree NOT NULL,
  specialization_ar VARCHAR(500),
  specialization_en VARCHAR(500),
  email           VARCHAR(255),
  bio_ar          TEXT,
  bio_en          TEXT,
  photo_url       VARCHAR(500),
  admin_role      VARCHAR(100),              -- عميد / وكيل / رئيس قسم
  is_active       BOOLEAN DEFAULT true,
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE faculty_degree AS ENUM (
  'assistant_lecturer', 'lecturer', 'assistant_professor', 'professor'
);
```

#### جدول البرامج الدراسية
```sql
CREATE TABLE programs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  name_ar       VARCHAR(255) NOT NULL,
  name_en       VARCHAR(255) NOT NULL,
  level         program_level NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  credit_hours  INTEGER,
  duration_years INTEGER,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE program_level AS ENUM ('undergraduate', 'masters', 'doctorate');
```

#### جدول المقررات
```sql
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID REFERENCES programs(id) ON DELETE RESTRICT,
  department_id   UUID REFERENCES departments(id) ON DELETE RESTRICT,
  faculty_id      UUID REFERENCES faculty_members(id) ON DELETE SET NULL,
  code            VARCHAR(20) UNIQUE NOT NULL,
  name_ar         VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255) NOT NULL,
  description_ar  TEXT,
  description_en  TEXT,
  credit_hours    INTEGER NOT NULL,
  semester        INTEGER NOT NULL,           -- 1 أو 2
  academic_year   INTEGER NOT NULL,           -- 1-4
  prerequisite_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول الطلاب
```sql
CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  university_id   VARCHAR(20) UNIQUE NOT NULL,
  name_ar         VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255),
  department_id   UUID REFERENCES departments(id) ON DELETE RESTRICT,
  academic_year   INTEGER NOT NULL,           -- 1-4
  enrollment_year INTEGER NOT NULL,
  status          student_status DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE student_status AS ENUM ('active', 'graduated', 'suspended', 'transferred');
```

#### جدول نتائج الامتحانات
```sql
CREATE TABLE exam_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses(id) ON DELETE RESTRICT,
  semester    INTEGER NOT NULL,
  academic_year VARCHAR(9) NOT NULL,          -- "2024-2025"
  grade       DECIMAL(5,2),
  grade_letter VARCHAR(2),
  is_published BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, semester, academic_year)
);
```

#### جدول الجداول الدراسية
```sql
CREATE TABLE class_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id   UUID REFERENCES faculty_members(id) ON DELETE SET NULL,
  day_of_week  INTEGER NOT NULL,              -- 0=الأحد ... 6=السبت
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  location     VARCHAR(255),
  semester     INTEGER NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول الامتحانات
```sql
CREATE TABLE exam_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_date    DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  location     VARCHAR(255),
  exam_type    VARCHAR(50),                   -- midterm / final
  semester     INTEGER NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول الأخبار والإعلانات
```sql
CREATE TABLE news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  title_ar     VARCHAR(500) NOT NULL,
  title_en     VARCHAR(500),
  body_ar      TEXT NOT NULL,
  body_en      TEXT,
  cover_image  VARCHAR(500),
  category     news_category DEFAULT 'general',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE news_category AS ENUM (
  'general', 'academic', 'student', 'conference', 'research'
);
```

#### جدول الصفحات الثابتة
```sql
CREATE TABLE pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(255) UNIQUE NOT NULL,
  title_ar    VARCHAR(500) NOT NULL,
  title_en    VARCHAR(500),
  content_ar  TEXT,
  content_en  TEXT,
  meta_description_ar VARCHAR(500),
  meta_description_en VARCHAR(500),
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول الأبحاث والمنشورات
```sql
CREATE TABLE publications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id    UUID REFERENCES faculty_members(id) ON DELETE CASCADE,
  title_ar      VARCHAR(1000) NOT NULL,
  title_en      VARCHAR(1000),
  abstract_ar   TEXT,
  abstract_en   TEXT,
  journal_name  VARCHAR(500),
  publish_year  INTEGER,
  doi           VARCHAR(255),
  file_url      VARCHAR(500),
  is_published  BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### جدول المؤتمرات
```sql
CREATE TABLE conferences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(255) UNIQUE NOT NULL,
  number         INTEGER NOT NULL,            -- الخامس / السادس ...
  title_ar       VARCHAR(500) NOT NULL,
  title_en       VARCHAR(500),
  theme_ar       VARCHAR(500),
  theme_en       VARCHAR(500),
  start_date     DATE,
  end_date       DATE,
  banner_ar_url  VARCHAR(500),
  banner_en_url  VARCHAR(500),
  status         conference_status DEFAULT 'upcoming',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE conference_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
```

#### جدول تسجيلات المؤتمرات
```sql
CREATE TABLE conference_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id     UUID REFERENCES conferences(id) ON DELETE CASCADE,
  full_name         VARCHAR(255) NOT NULL,
  institution       VARCHAR(500),
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(50),
  participation_type VARCHAR(50),             -- presenter / attendee
  paper_title       VARCHAR(1000),
  abstract          TEXT,
  registration_code VARCHAR(20) UNIQUE,
  status            reg_status DEFAULT 'pending',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE reg_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
```

#### جدول الكتب (المكتبة)
```sql
CREATE TABLE library_books (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_type  library_type NOT NULL,
  title_ar      VARCHAR(1000) NOT NULL,
  title_en      VARCHAR(1000),
  author_ar     VARCHAR(500),
  author_en     VARCHAR(500),
  publisher     VARCHAR(500),
  publish_year  INTEGER,
  isbn          VARCHAR(20),
  copies_count  INTEGER DEFAULT 1,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE library_type AS ENUM (
  'egyptology', 'islamic', 'conservation', 'postgraduate'
);
```

#### جدول Audit Log
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,          -- CREATE / UPDATE / DELETE
  entity_type VARCHAR(100) NOT NULL,          -- news / faculty / course ...
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. هيكل الـ Backend (Node.js + Express.js)

### 4.1 هيكل المجلدات

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        -- Prisma client setup
│   │   ├── redis.ts           -- Redis connection
│   │   └── env.ts             -- Environment variables validation (Zod)
│   ├── middleware/
│   │   ├── auth.ts            -- JWT verification
│   │   ├── authorize.ts       -- Role-based access control
│   │   ├── rateLimiter.ts     -- Rate limiting per route
│   │   ├── validate.ts        -- Request body validation (Zod)
│   │   ├── upload.ts          -- File upload (Multer)
│   │   └── auditLog.ts        -- Automatic audit logging
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   ├── faculty/
│   │   ├── students/
│   │   ├── departments/
│   │   ├── programs/
│   │   ├── courses/
│   │   ├── schedules/
│   │   ├── results/
│   │   ├── news/
│   │   ├── pages/
│   │   ├── publications/
│   │   ├── conferences/
│   │   ├── library/
│   │   └── search/
│   ├── shared/
│   │   ├── errors/            -- Custom error classes
│   │   ├── utils/             -- Helper functions
│   │   └── types/             -- Shared TypeScript types
│   └── app.ts                 -- Express app setup
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
└── package.json
```

### 4.2 Endpoints الـ API الكاملة

#### Authentication
```
POST   /api/auth/login              -- تسجيل دخول (طالب / محاضر / إداري)
POST   /api/auth/logout             -- تسجيل خروج + إبطال الـ Token
POST   /api/auth/refresh            -- تجديد الـ Access Token
POST   /api/auth/forgot-password    -- طلب إعادة تعيين كلمة المرور
POST   /api/auth/reset-password     -- إعادة التعيين بعد التحقق
```

#### Departments
```
GET    /api/departments                     -- قائمة الأقسام
GET    /api/departments/:slug               -- تفاصيل قسم
GET    /api/departments/:slug/faculty       -- أعضاء التدريس في القسم
GET    /api/departments/:slug/programs      -- البرامج في القسم
PUT    /api/departments/:id            [A]  -- تعديل قسم
```

#### Faculty Members
```
GET    /api/faculty                         -- قائمة كل أعضاء التدريس
GET    /api/faculty/:id                     -- تفاصيل عضو
GET    /api/faculty/:id/publications        -- أبحاث عضو
POST   /api/faculty                    [A]  -- إضافة عضو جديد
PUT    /api/faculty/:id                [A]  -- تعديل بيانات عضو
DELETE /api/faculty/:id                [A]  -- حذف عضو
PUT    /api/faculty/me                 [F]  -- عضو يعدل بياناته الخاصة
```

#### Students — (Protected: Student + Admin)
```
GET    /api/students/me                [S]  -- بيانات الطالب الحالي
GET    /api/students/me/results        [S]  -- نتائج الطالب الحالي
GET    /api/students/me/schedule       [S]  -- جدول الطالب الحالي
GET    /api/students/me/exams          [S]  -- جدول امتحانات الطالب
PUT    /api/students/me                [S]  -- تعديل بيانات الاتصال
GET    /api/students                   [A]  -- قائمة كل الطلاب
POST   /api/students/import            [A]  -- استيراد طلاب من Excel
```

#### Courses
```
GET    /api/courses                         -- قائمة المقررات
GET    /api/courses/:id                     -- تفاصيل مقرر
POST   /api/courses                    [A]  -- إضافة مقرر
PUT    /api/courses/:id                [A]  -- تعديل مقرر
DELETE /api/courses/:id                [A]  -- حذف مقرر
```

#### Schedules
```
GET    /api/schedules?dept=&year=&sem=      -- جدول دراسي مصفى
POST   /api/schedules                  [A]  -- إضافة حصة
POST   /api/schedules/import           [A]  -- استيراد جدول من Excel
PUT    /api/schedules/:id              [A]  -- تعديل حصة
DELETE /api/schedules/:id              [A]  -- حذف حصة
GET    /api/exam-schedules?dept=&year= [*]  -- جدول امتحانات
POST   /api/exam-schedules/import      [A]  -- استيراد جدول امتحانات
```

#### Exam Results
```
GET    /api/results?studentId=&year=   [A]  -- نتائج طالب (admin view)
POST   /api/results/import             [A]  -- استيراد نتائج من Excel
PUT    /api/results/:id/publish        [A]  -- نشر نتيجة
PUT    /api/results/publish-batch      [A]  -- نشر مجموعة نتائج
```

#### News
```
GET    /api/news?page=&category=            -- قائمة الأخبار
GET    /api/news/:id                        -- تفاصيل خبر
POST   /api/news                       [CM] -- إضافة خبر
PUT    /api/news/:id                   [CM] -- تعديل خبر
DELETE /api/news/:id                   [CM] -- حذف خبر
PUT    /api/news/:id/publish           [CM] -- نشر / إلغاء نشر
```

#### Pages (Static Content)
```
GET    /api/pages/:slug                     -- محتوى صفحة ثابتة
PUT    /api/pages/:slug                [A]  -- تعديل صفحة
```

#### Publications
```
GET    /api/publications?facultyId=&year=   -- قائمة الأبحاث
GET    /api/publications/:id                -- تفاصيل بحث
POST   /api/publications               [F]  -- إضافة بحث (للمحاضر)
PUT    /api/publications/:id           [F]  -- تعديل بحث
DELETE /api/publications/:id           [F]  -- حذف بحث
```

#### Conferences
```
GET    /api/conferences                     -- قائمة المؤتمرات
GET    /api/conferences/:slug               -- تفاصيل مؤتمر
POST   /api/conferences                [A]  -- إنشاء مؤتمر جديد
PUT    /api/conferences/:id            [A]  -- تعديل مؤتمر
POST   /api/conferences/:id/register        -- تسجيل في مؤتمر (عام)
GET    /api/conferences/:id/registrations [A] -- قائمة المسجلين
PUT    /api/conferences/:id/registrations/:regId [A] -- تحديث حالة تسجيل
```

#### Library
```
GET    /api/library?type=&q=&dept=          -- بحث في المكتبة
POST   /api/library                    [A]  -- إضافة كتاب
PUT    /api/library/:id                [A]  -- تعديل كتاب
DELETE /api/library/:id                [A]  -- حذف كتاب
POST   /api/library/import             [A]  -- استيراد من Excel
```

#### Search
```
GET    /api/search?q=&type=&lang=           -- بحث مركزي
```

#### Admin
```
GET    /api/admin/audit-logs           [A]  -- سجل العمليات
GET    /api/admin/users                [A]  -- إدارة المستخدمين
POST   /api/admin/users                [A]  -- إضافة مستخدم
PUT    /api/admin/users/:id            [A]  -- تعديل صلاحيات
DELETE /api/admin/users/:id            [A]  -- حذف مستخدم
GET    /api/admin/dashboard-stats      [A]  -- إحصائيات عامة
```

**الأدوار:** `[A]` = Admin فقط | `[CM]` = Content Manager+ | `[F]` = Faculty+ | `[S]` = Student+ | `[*]` = يحتاج تسجيل دخول

---

### 4.3 متطلبات المصادقة والأمان التقنية

#### JWT Strategy
```typescript
// Access Token: صلاحية 15 دقيقة
// Refresh Token: صلاحية 7 أيام — مخزن في HttpOnly Cookie
// عند تسجيل الخروج: إضافة الـ Token للـ Blacklist في Redis

interface JWTPayload {
  userId: string;
  role: UserRole;
  universityId?: string;
  iat: number;
  exp: number;
}
```

#### Rate Limiting
```
/api/auth/login         → 10 requests / 15 minutes per IP
/api/auth/*             → 20 requests / 15 minutes per IP
/api/conferences/*/register → 5 requests / hour per IP
/api/search             → 30 requests / minute per IP
باقي الـ API            → 100 requests / minute per IP
```

#### Input Validation (Zod)
- كل request body يمر على Zod Schema قبل الوصول للـ Controller
- SQL Injection مستحيل — كل الاستعلامات عبر Prisma ORM
- XSS Prevention — كل نص يُعقَّم قبل الحفظ في قاعدة البيانات

#### File Upload Security
```typescript
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];
const maxFileSize = 10 * 1024 * 1024; // 10MB

// التحقق من MIME type الحقيقي (magic bytes) وليس الامتداد فقط
```

---

## 5. هيكل الـ Frontend (Next.js 14)

### 5.1 هيكل المجلدات

```
frontend/
├── app/
│   ├── (public)/                    -- الصفحات العامة
│   │   ├── page.tsx                 -- الصفحة الرئيسية
│   │   ├── about/
│   │   │   ├── history/page.tsx
│   │   │   ├── mission/page.tsx
│   │   │   ├── vision/page.tsx
│   │   │   └── leadership/page.tsx
│   │   ├── departments/
│   │   │   └── [slug]/page.tsx
│   │   ├── faculty/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── programs/
│   │   │   ├── undergraduate/page.tsx
│   │   │   └── postgraduate/page.tsx
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── library/page.tsx
│   │   ├── conferences/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       ├── register/page.tsx
│   │   │       ├── program/page.tsx
│   │   │       └── abstracts/page.tsx
│   │   ├── contact/page.tsx
│   │   └── search/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (student)/                   -- بوابة الطالب (Protected)
│   │   └── dashboard/
│   │       ├── page.tsx             -- Dashboard overview
│   │       ├── results/page.tsx
│   │       ├── schedule/page.tsx
│   │       ├── exams/page.tsx
│   │       └── profile/page.tsx
│   ├── (faculty)/                   -- بوابة المحاضر (Protected)
│   │   └── dashboard/
│   │       ├── page.tsx             -- Dashboard overview
│   │       ├── courses/page.tsx
│   │       ├── publications/page.tsx
│   │       └── profile/page.tsx
│   ├── (admin)/                     -- لوحة التحكم (Protected)
│   │   └── admin/
│   │       ├── page.tsx             -- Dashboard overview + stats
│   │       ├── news/
│   │       │   ├── page.tsx
│   │       │   └── new/page.tsx
│   │       ├── faculty/
│   │       │   ├── page.tsx
│   │       │   └── new/page.tsx
│   │       ├── students/
│   │       │   ├── page.tsx
│   │       │   └── import/page.tsx
│   │       ├── courses/page.tsx
│   │       ├── schedules/
│   │       │   ├── page.tsx
│   │       │   └── import/page.tsx
│   │       ├── results/
│   │       │   ├── page.tsx
│   │       │   ├── import/page.tsx
│   │       │   └── publish/page.tsx
│   │       ├── conferences/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/registrations/page.tsx
│   │       ├── library/page.tsx
│   │       ├── pages/page.tsx
│   │       ├── users/page.tsx
│   │       ├── audit-logs/page.tsx
│   │       └── settings/page.tsx
│   ├── [lang]/                      -- i18n routing (ar / en)
│   ├── layout.tsx                   -- Root layout
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                          -- Atomic UI components
│   ├── layout/
│   │   ├── PublicNavbar.tsx         -- Navbar الموقع العام
│   │   ├── StudentNavbar.tsx        -- Navbar بوابة الطالب
│   │   ├── FacultyNavbar.tsx        -- Navbar بوابة المحاضر
│   │   ├── AdminNavbar.tsx          -- Navbar لوحة التحكم
│   │   ├── Sidebar.tsx              -- Sidebar للـ Admin
│   │   └── Footer.tsx
│   ├── features/
│   │   ├── DepartmentCard.tsx       -- كارت القسم مع Hover Animation
│   │   ├── DepartmentsGrid.tsx      -- الـ Grid الرباعي للأقسام
│   │   └── ...
│   └── admin/                       -- Admin-specific components
├── lib/
│   ├── api/
│   ├── auth/
│   ├── i18n/
│   └── utils/
├── hooks/
├── store/
└── public/
```

### 5.1.1 — البوابات الثلاث: Navbar لكل بوابة

#### PublicNavbar — الموقع العام
```typescript
// الروابط: الرئيسية | عن الكلية ▾ | الأقسام ▾ | البكالوريوس ▾ | الدراسات العليا ▾
//           أعضاء التدريس | المجلة | المكتبة | المؤتمرات | اتصل بنا
// على اليمين: زر تسجيل الدخول + تبديل اللغة (AR/EN)
// Sticky على الـ Scroll + تأثير blur عند التمرير
```

#### StudentNavbar — بوابة الطالب
```typescript
// الروابط: الرئيسية | جدولي | امتحاناتي | نتائجي | ملفي الشخصي
// على اليمين: اسم الطالب + صورة مصغرة + زر تسجيل الخروج
// Badge على "نتائجي" عند وجود نتائج جديدة غير مشاهدة
```

#### FacultyNavbar — بوابة المحاضر
```typescript
// الروابط: الرئيسية | مقرراتي | أبحاثي | ملفي
// على اليمين: اسم المحاضر + درجته + زر تسجيل الخروج
```

#### AdminNavbar — لوحة التحكم
```typescript
// أفقي في الأعلى: شعار الكلية + "لوحة التحكم" + اسم المدير + تسجيل الخروج
// Sidebar على اليسار (RTL: اليمين): كل أقسام الإدارة
// Sidebar قابل للطي (Collapsible)
```

### 5.1.2 — كروت الأقسام الأربعة (DepartmentCard Component)

#### مواصفات الـ Component

```typescript
// components/features/DepartmentCard.tsx

interface DepartmentCardProps {
  slug: 'egyptology' | 'islamic' | 'conservation' | 'greco-roman';
  name_ar: string;
  name_en: string;
  description_ar: string;
  faculty_count: number;
  cover_image_url: string;
  accent_color: string;    // اللون المميز للقسم
}

// الـ Grid في الصفحة الرئيسية:
// Desktop: 4 كروت في صف واحد
// Tablet:  2 كروت × 2 صفوف
// Mobile:  1 كارت × 4 صفوف
```

#### تفاصيل الـ Animation (Tailwind CSS + CSS Variables)

```typescript
// Default State
className="
  relative overflow-hidden rounded-2xl cursor-pointer
  h-72 md:h-80
  transition-all duration-300 ease-in-out
  border border-transparent
"

// Hover State (group-hover)
className="
  group-hover:-translate-y-2
  group-hover:shadow-2xl
  group-hover:border-[var(--accent-color)]
"

// الصورة الخلفية
// Default: opacity-30 scale-100
// Hover:   opacity-75 scale-105  (تكبير خفيف + ظهور)
// transition: duration-500 ease-in-out

// اسم القسم
// Default: text-white font-bold text-xl bottom-6
// Hover:   يتحرك لأعلى قليلاً (translateY -4px)

// زر "استكشف القسم"
// Default: opacity-0 translateY(+16px)
// Hover:   opacity-100 translateY(0)   -- fade-in من الأسفل
// transition: duration-200 delay-100ms
```

#### بيانات الأقسام الثابتة (seed data)

```typescript
// prisma/seed.ts
const departments = [
  {
    slug: 'egyptology',
    name_ar: 'قسم الآثار المصرية',
    name_en: 'Department of Egyptology',
    accent_color: '#C9A84C',
    cover_image: '/images/depts/egyptology.jpg',
    order_index: 1,
  },
  {
    slug: 'islamic',
    name_ar: 'قسم الآثار الإسلامية',
    name_en: 'Department of Islamic Archaeology',
    accent_color: '#4A7C59',
    cover_image: '/images/depts/islamic.jpg',
    order_index: 2,
  },
  {
    slug: 'conservation',
    name_ar: 'قسم ترميم الآثار',
    name_en: 'Department of Conservation',
    accent_color: '#8B6914',
    cover_image: '/images/depts/conservation.jpg',
    order_index: 3,
  },
  {
    slug: 'greco-roman',
    name_ar: 'قسم الآثار اليونانية الرومانية',
    name_en: 'Department of Greco-Roman Archaeology',
    accent_color: '#2C5282',
    cover_image: '/images/depts/greco-roman.jpg',
    order_index: 4,
  },
];
```

#### إضافة حقل `accent_color` لجدول departments في PostgreSQL

```sql
-- Migration إضافية على جدول departments
ALTER TABLE departments
  ADD COLUMN accent_color VARCHAR(7) DEFAULT '#6B7280',
  ADD COLUMN cover_image_url VARCHAR(500);
```

### 5.2 إدارة الحالة (State Management)

```typescript
// Zustand للـ Global State
// React Query (TanStack Query) للـ Server State + Caching

// Auth Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
}

// React Query لكل الـ API calls
// مثال: جلب نتائج الطالب
const { data, isLoading } = useQuery({
  queryKey: ['results', studentId],
  queryFn: () => api.results.getMyResults(),
  staleTime: 5 * 60 * 1000, // 5 دقائق
});
```

### 5.3 دعم اللغتين (i18n)

```typescript
// next-intl لإدارة الترجمة
// الـ Routing: /ar/... و /en/...
// الـ Default: /ar (عربي)

// مثال بنية ملفات الترجمة
// messages/ar.json
{
  "nav": {
    "home": "الرئيسية",
    "about": "عن الكلية",
    "departments": "الأقسام"
  },
  "departments": {
    "egyptology": "قسم الآثار المصرية",
    "islamic": "قسم الآثار الإسلامية"
  }
}
```

### 5.4 SEO و Metadata

```typescript
// كل صفحة لها generateMetadata function
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageTitle} | كلية الآثار — جامعة القاهرة`,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      locale: params.lang === 'ar' ? 'ar_EG' : 'en_US',
    },
    alternates: {
      canonical: `https://fa-arch.cu.edu.eg/ar/${slug}`,
      languages: {
        'ar': `/ar/${slug}`,
        'en': `/en/${slug}`,
      },
    },
  };
}
```

---

## 6. متطلبات الأداء التقنية

### 6.1 قاعدة البيانات

```sql
-- Indexes الأساسية
CREATE INDEX idx_faculty_department ON faculty_members(department_id);
CREATE INDEX idx_courses_program ON courses(program_id);
CREATE INDEX idx_results_student ON exam_results(student_id);
CREATE INDEX idx_results_published ON exam_results(is_published) WHERE is_published = true;
CREATE INDEX idx_news_published ON news(published_at) WHERE is_published = true;
CREATE INDEX idx_news_category ON news(category);

-- Full-Text Search Index للبحث العربي
CREATE INDEX idx_faculty_search ON faculty_members
  USING GIN(to_tsvector('arabic', name_ar || ' ' || COALESCE(bio_ar, '')));

CREATE INDEX idx_news_search ON news
  USING GIN(to_tsvector('arabic', title_ar || ' ' || COALESCE(body_ar, '')));
```

### 6.2 Caching Strategy (Redis)

```
الصفحة الرئيسية (أخبار + إعلانات)  → Cache 5 دقائق
قائمة هيئة التدريس                 → Cache 30 دقيقة
تفاصيل الأقسام                     → Cache 1 ساعة
محتوى الصفحات الثابتة              → Cache 24 ساعة (Invalidate عند التعديل)
نتائج البحث                        → Cache 10 دقائق (بناءً على query string)
```

### 6.3 معايير الأداء

| المعيار | الهدف |
|--------|-------|
| Time to First Byte (TTFB) | < 200ms |
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Lighthouse Score | > 90 |
| API Response Time (P95) | < 500ms |

---

## 7. متطلبات الأمان التقنية

### 7.1 HTTP Security Headers

```typescript
// في Next.js next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### 7.2 CORS Configuration

```typescript
// السماح فقط لـ Frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,              // للـ HttpOnly Cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 7.3 Password Policy

```
الحد الأدنى: 8 أحرف
يجب احتواء: حرف كبير + حرف صغير + رقم
التشفير: bcrypt مع salt rounds = 12
منع: كلمات المرور الشائعة (قائمة HIBP)
```

### 7.4 Environment Variables (المطلوبة)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="[256-bit random string]"
JWT_REFRESH_SECRET="[256-bit random string]"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App
FRONTEND_URL="https://fa-arch.cu.edu.eg"
NODE_ENV="production"
PORT=3001

# Email
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# CAPTCHA
RECAPTCHA_SECRET_KEY=""
```

---

## 8. متطلبات Excel Import/Export

### 8.1 استيراد نتائج الطلاب

```
القالب المطلوب:
| رقم الطالب | كود المقرر | الدرجة | الفصل | العام الدراسي |

المعالجة:
1. قراءة الملف (xlsx library)
2. التحقق من كل صف: رقم الطالب موجود؟ كود المقرر موجود؟ الدرجة صحيحة؟
3. إنشاء تقرير بالأخطاء قبل الحفظ
4. الحفظ فقط بعد موافقة المدير على التقرير
5. النتائج تبقى unpublished حتى يضغط المدير "نشر"
```

### 8.2 استيراد الجداول الدراسية

```
القالب المطلوب:
| كود المقرر | اليوم | وقت البداية | وقت النهاية | القاعة | الفصل | العام |

نفس آلية التحقق والتقرير قبل الحفظ
```

---

## 9. متطلبات البحث المركزي

### 9.1 آلية البحث في PostgreSQL

```sql
-- دالة البحث الموحد
CREATE OR REPLACE FUNCTION search_all(
  query TEXT,
  lang TEXT DEFAULT 'ar',
  result_type TEXT DEFAULT 'all'
) RETURNS TABLE (
  id UUID, type TEXT, title TEXT, excerpt TEXT, url TEXT, rank REAL
) AS $$
BEGIN
  RETURN QUERY
  -- البحث في الأخبار
  SELECT n.id, 'news'::TEXT,
    CASE WHEN lang='ar' THEN n.title_ar ELSE COALESCE(n.title_en, n.title_ar) END,
    LEFT(CASE WHEN lang='ar' THEN n.body_ar ELSE COALESCE(n.body_en, n.body_ar) END, 200),
    '/news/' || n.id::TEXT,
    ts_rank(to_tsvector('arabic', n.title_ar), plainto_tsquery('arabic', query))
  FROM news n
  WHERE n.is_published = true
    AND to_tsvector('arabic', n.title_ar || ' ' || n.body_ar) @@ plainto_tsquery('arabic', query)
    AND (result_type = 'all' OR result_type = 'news')

  UNION ALL

  -- البحث في هيئة التدريس
  SELECT fm.id, 'faculty'::TEXT, fm.name_ar, fm.specialization_ar,
    '/faculty/' || fm.id::TEXT,
    ts_rank(to_tsvector('arabic', fm.name_ar), plainto_tsquery('arabic', query))
  FROM faculty_members fm
  WHERE fm.is_active = true
    AND to_tsvector('arabic', fm.name_ar) @@ plainto_tsquery('arabic', query)
    AND (result_type = 'all' OR result_type = 'faculty')

  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

---

## 10. متطلبات الإشعارات والبريد الإلكتروني

| الحدث | المستقبل | محتوى الإشعار |
|-------|---------|--------------|
| تسجيل في مؤتمر | المسجِّل | رقم التسجيل + تأكيد الاستلام |
| قبول التسجيل | المسجِّل | تأكيد القبول + تفاصيل الحضور |
| نشر نتائج امتحان | — | لا إشعارات (الطلاب يتحققون عبر البوابة) |
| تسجيل دخول من IP جديد | المستخدم المعني | تحذير أمني |
| فشل تسجيل دخول متكرر | مدير النظام | تنبيه أمني |

---

## 11. متطلبات الاستجابة (Responsive Design)

| النقطة | العرض | التعديلات |
|--------|-------|----------|
| Mobile | < 640px | قائمة Hamburger، تخطيط عمود واحد |
| Tablet | 640px – 1024px | تخطيط عمودين، sidebar مخفي |
| Desktop | > 1024px | التخطيط الكامل |

- الموقع يعمل بشكل كامل على المتصفحات: Chrome, Firefox, Safari, Edge (آخر إصدارين)
- RTL كامل للعربية — يشمل الـ padding/margin/flex direction
- الصور تستخدم `next/image` للـ lazy loading والتحسين التلقائي

---

## 12. بيئات التطوير والنشر

```
Development  → localhost:3000 (Frontend) + localhost:3001 (Backend)
Staging      → staging.fa-arch.cu.edu.eg  (للاختبار قبل الإطلاق)
Production   → fa-arch.cu.edu.eg
```

### 12.1 متطلبات الـ CI/CD

```
عند Push على main branch:
1. تشغيل Tests (Jest + Supertest)
2. TypeScript type check
3. ESLint
4. Build check
5. Deploy تلقائي على Staging
6. موافقة يدوية للـ Production Deploy
```

### 12.2 النسخ الاحتياطي

```
PostgreSQL: pg_dump تلقائي كل 24 ساعة
الاحتفاظ: آخر 30 نسخة
التخزين: مكان مختلف عن السيرفر الرئيسي
الاختبار: التحقق من صلاحية النسخة شهرياً
```

---

## 13. خريطة الارتباطات التقنية

```
Next.js Page → API Route → Express Controller → Service Layer → Prisma → PostgreSQL
                                                                      ↕
                                                               Redis Cache
                                                               (على النتائج المتكررة)

تسجيل الدخول:
POST /api/auth/login
  → Validate Input (Zod)
  → Rate Limit Check (Redis)
  → Find User (Prisma → PostgreSQL)
  → Verify Password (bcrypt)
  → Generate JWT (Access + Refresh)
  → Store Refresh Token (Redis)
  → Set HttpOnly Cookie
  → Return Access Token

جلب نتائج الطالب:
GET /api/students/me/results
  → Verify JWT (Middleware)
  → Extract studentId from Token
  → Check Cache (Redis)
  → If Miss: Query PostgreSQL (Prisma)
  → Store in Cache (Redis, TTL: 5min)
  → Return Results
```

---

*نهاية المستند — الإصدار 1.0*
