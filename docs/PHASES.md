# Project Phases — كلية الآثار جامعة القاهرة
## خطة التطوير من Phase 0 إلى Phase 10

**الإصدار:** 2.0  
**التاريخ:** يونيو 2026  
**المستودع:** https://github.com/OmarRaafatSayed/Site-Archeology-Faculty-.git

---

## نظرة عامة على الـ Phases

```
Phase 0  →  Project Setup — هيكل المشروع + قاعدة البيانات + بيئة التطوير
Phase 1  →  Backend: Auth System — تسجيل الدخول + JWT + الأدوار
Phase 2  →  Backend: Core Entities — الأقسام + هيئة التدريس + الطلاب
Phase 3  →  Backend: Academic System — المقررات + الجداول + النتائج
Phase 4  →  Backend: Content System — الأخبار + الصفحات + الأبحاث + المكتبة
Phase 5  →  Backend: Conferences + Search + Caching
Phase 6  →  Backend: Admin APIs + Excel Import + Audit Log
Phase 7  →  Frontend: Public Website — الصفحات العامة + كروت الأقسام
Phase 8  →  Frontend: Dashboards — الثلاث بوابات (طالب / محاضر / إداري)
Phase 9  →  Testing + Security + Performance
Phase 10 →  Deploy + CI/CD + Handover
```

---

## Phase 0 — Project Setup & Infrastructure
**الهدف:** إعداد البيئة الكاملة للمشروع قبل كتابة أي سطر كود

### المهام
- [ ] إنشاء هيكل المجلدات (backend / frontend / docs)
- [ ] تهيئة `backend/package.json` — TypeScript + Express + Prisma + Zod
- [ ] تهيئة `frontend/package.json` — Next.js 14 App Router + Tailwind CSS
- [ ] إعداد `backend/.env.example` بكل المتغيرات المطلوبة
- [ ] إعداد `frontend/.env.example`
- [ ] كتابة `backend/prisma/schema.prisma` بكل الجداول (من SRS القسم 3)
- [ ] تشغيل `prisma migrate dev` لأول مرة
- [ ] إعداد Redis connection
- [ ] كتابة `backend/src/config/env.ts` — Zod validation للـ env vars
- [ ] إعداد ESLint + Prettier للمشروعين
- [ ] إعداد `.gitignore` صحيح (node_modules / .env / uploads / dist)
- [ ] ربط المشروع بـ GitHub وإنشاء branch strategy

### Deliverable
بيئة تطوير تعمل محلياً: `npm run dev` على الـ Backend بيشتغل + Prisma Studio يفتح

---

## Phase 1 — Backend: Auth & Users
**الهدف:** نظام مصادقة كامل وآمن للبوابات الثلاث

### المهام
- [ ] `POST /api/auth/login` — تسجيل دخول لكل الأدوار
- [ ] `POST /api/auth/logout` — تسجيل خروج + Redis blacklist
- [ ] `POST /api/auth/refresh` — تجديد Access Token
- [ ] `POST /api/auth/forgot-password` — طلب إعادة تعيين
- [ ] `POST /api/auth/reset-password` — إعادة التعيين بعد التحقق
- [ ] Middleware: `auth.ts` — التحقق من JWT
- [ ] Middleware: `authorize.ts` — RBAC (student / faculty / content_manager / admin)
- [ ] Middleware: `rateLimiter.ts` — Rate limiting بالـ Redis
- [ ] `GET/POST/PUT/DELETE /api/admin/users` — إدارة المستخدمين
- [ ] bcrypt hashing لكل كلمات المرور
- [ ] HttpOnly Cookie للـ Refresh Token
- [ ] كتابة Unit Tests للـ Auth module

### Deliverable
تسجيل دخول يعمل للأدوار الثلاثة + JWT صحيح + Rate Limiting فعّال

---

## Phase 2 — Backend: Core Data
**الهدف:** الـ CRUD الكامل للأقسام وهيئة التدريس والطلاب

### المهام

**Departments:**
- [ ] `GET /api/departments`
- [ ] `GET /api/departments/:slug`
- [ ] `GET /api/departments/:slug/faculty`
- [ ] `GET /api/departments/:slug/programs`
- [ ] `PUT /api/departments/:id` (Admin)
- [ ] Seed data للأقسام الأربعة بالألوان والصور

**Faculty Members:**
- [ ] `GET /api/faculty` — مع pagination
- [ ] `GET /api/faculty/:id`
- [ ] `GET /api/faculty/:id/publications`
- [ ] `POST /api/faculty` (Admin)
- [ ] `PUT /api/faculty/:id` (Admin)
- [ ] `DELETE /api/faculty/:id` (Admin)
- [ ] `PUT /api/faculty/me` — عضو يعدل بياناته

**Students:**
- [ ] `GET /api/students/me`
- [ ] `PUT /api/students/me`
- [ ] `GET /api/students` (Admin)
- [ ] `POST /api/students/import` — Excel استيراد
- [ ] Audit Log middleware على كل Write operations

### Deliverable
API endpoints كاملة للـ Core entities + Postman collection للـ Testing

---

## Phase 3 — Backend: Academic
**الهدف:** الشأن الأكاديمي الكامل — مقررات + جداول + نتائج

### المهام

**Courses & Programs:**
- [ ] `GET/POST/PUT/DELETE /api/courses`
- [ ] `GET/POST/PUT/DELETE /api/programs`

**Schedules:**
- [ ] `GET /api/schedules?dept=&year=&sem=`
- [ ] `POST /api/schedules`
- [ ] `POST /api/schedules/import` — Excel
- [ ] `PUT/DELETE /api/schedules/:id`
- [ ] `GET /api/exam-schedules?dept=&year=`
- [ ] `POST /api/exam-schedules/import`

**Exam Results:**
- [ ] `POST /api/results/import` — رفع Excel مع Validation Report
- [ ] `PUT /api/results/publish-batch` — نشر مجموعة نتائج
- [ ] `GET /api/students/me/results` (Student Protected)
- [ ] `GET /api/students/me/schedule` (Student Protected)
- [ ] `GET /api/students/me/exams` (Student Protected)

### Deliverable
الطالب يستطيع رؤية نتيجته عبر API بعد تسجيل الدخول فقط

---

## Phase 4 — Backend: Content
**الهدف:** نظام إدارة المحتوى — أخبار + صفحات + أبحاث + مكتبة

### المهام

**News:**
- [ ] `GET /api/news?page=&category=`
- [ ] `GET /api/news/:id`
- [ ] `POST/PUT/DELETE /api/news` (Content Manager+)
- [ ] `PUT /api/news/:id/publish`

**Pages:**
- [ ] `GET /api/pages/:slug`
- [ ] `PUT /api/pages/:slug` (Admin)
- [ ] Seed الصفحات الأساسية

**Publications:**
- [ ] `GET /api/publications?facultyId=&year=`
- [ ] `POST/PUT/DELETE /api/publications` (Faculty+)

**Library:**
- [ ] `GET /api/library?type=&q=&dept=`
- [ ] `POST/PUT/DELETE /api/library` (Admin)
- [ ] `POST /api/library/import` — Excel

**Admin Stats:**
- [ ] `GET /api/admin/dashboard-stats`
- [ ] `GET /api/admin/audit-logs`

### Deliverable
كل محتوى الموقع قابل للإدارة والتعديل من API

---

## Phase 5 — Backend: Conferences & Search
**الهدف:** نظام المؤتمرات الكامل + محرك البحث المركزي

### المهام

**Conferences:**
- [ ] `GET /api/conferences`
- [ ] `GET /api/conferences/:slug`
- [ ] `POST /api/conferences` — إنشاء + توليد الصفحات تلقائياً
- [ ] `PUT /api/conferences/:id`
- [ ] `POST /api/conferences/:id/register` — تسجيل عام + CAPTCHA
- [ ] `GET /api/conferences/:id/registrations` (Admin)
- [ ] `PUT /api/conferences/:id/registrations/:regId`
- [ ] إرسال بريد تأكيد تلقائي (Nodemailer)

**Search:**
- [ ] PostgreSQL Full-Text Search indexes
- [ ] دالة `search_all()` (من SRS القسم 9.1)
- [ ] `GET /api/search?q=&type=&lang=`
- [ ] Redis caching لنتائج البحث (10 دقائق)

**Redis Caching:**
- [ ] Caching strategy كاملة (من SRS القسم 6.2)
- [ ] Cache invalidation عند كل Write operation

### Deliverable
**Backend كامل 100%** — كل الـ API endpoints تعمل + Postman collection شاملة

---

## Phase 6 — Frontend: Public Website
**الهدف:** بناء الموقع العام بالكامل (Next.js 14)

### المهام

**Setup:**
- [ ] Next.js 14 App Router + Tailwind CSS + next-intl (AR/EN)
- [ ] RTL support كامل
- [ ] PublicNavbar — Sticky + Blur on scroll
- [ ] Footer
- [ ] SEO: generateMetadata لكل صفحة

**الصفحة الرئيسية:**
- [ ] Hero Section
- [ ] **DepartmentCard Component** — 4 كروت مع Hover Animation الكاملة
- [ ] قسم آخر الأخبار (ISR 60s)
- [ ] قسم المؤتمرات القادمة
- [ ] روابط سريعة

**صفحات الكلية:**
- [ ] `/about/history` | `/about/mission` | `/about/vision`
- [ ] `/about/leadership`
- [ ] `/departments/[slug]`
- [ ] `/faculty` | `/faculty/[id]`
- [ ] `/programs/undergraduate` | `/programs/postgraduate`
- [ ] `/news` | `/news/[id]`
- [ ] `/journal` | `/library` | `/contact`
- [ ] `/conferences` | `/conferences/[slug]`
- [ ] `/conferences/[slug]/register`
- [ ] `/search`

### Deliverable
الموقع العام يعمل بالكامل باللغتين + Lighthouse Score > 85

---

## Phase 7 — Frontend: Dashboards
**الهدف:** البوابات الثلاث مع Dashboards كاملة

### المهام

**Auth:**
- [ ] `/login` — توجّه حسب الـ Role
- [ ] `/forgot-password`

**Student Dashboard:**
- [ ] StudentNavbar + Badge للنتائج الجديدة
- [ ] Overview: جدول اليوم + أقرب امتحان + آخر نتيجة
- [ ] `/student/dashboard/schedule`
- [ ] `/student/dashboard/exams`
- [ ] `/student/dashboard/results`
- [ ] `/student/dashboard/profile`

**Faculty Dashboard:**
- [ ] FacultyNavbar
- [ ] Overview
- [ ] `/faculty/dashboard/courses` — مقرراته + رفع مواد
- [ ] `/faculty/dashboard/publications` — CRUD أبحاثه
- [ ] `/faculty/dashboard/profile`

**Admin Dashboard:**
- [ ] AdminNavbar + Collapsible Sidebar
- [ ] Overview: إحصائيات + Audit Log مختصر
- [ ] إدارة الأخبار (CRUD + نشر)
- [ ] إدارة هيئة التدريس
- [ ] إدارة الطلاب + استيراد Excel
- [ ] إدارة المقررات والجداول
- [ ] رفع ونشر النتائج + Validation Report
- [ ] إدارة المؤتمرات + التسجيلات
- [ ] إدارة المكتبة
- [ ] تعديل الصفحات الثابتة
- [ ] إدارة المستخدمين والصلاحيات
- [ ] Audit Logs viewer

### Deliverable
البوابات الثلاث تعمل بالكامل — كل مستخدم يرى ما يخصه فقط

---

## Phase 8 — Integration, Testing & Security Audit
**الهدف:** ضمان أن كل شيء يعمل معاً بشكل صحيح وآمن

### المهام

**Integration Testing:**
- [ ] اختبار كل User Journey (UC-01 → UC-05 من FRD)
- [ ] اختبار الـ i18n — كل الصفحات بالعربية والإنجليزية
- [ ] اختبار RTL على كل الصفحات
- [ ] اختبار Excel Import
- [ ] اختبار نظام المؤتمرات كاملاً

**Security Audit:**
- [ ] التحقق من Security Headers
- [ ] اختبار Rate Limiting
- [ ] اختبار JWT expiry وإبطال الـ Token
- [ ] اختبار File Upload Security
- [ ] التحقق من عدم وجود SQL Injection
- [ ] التحقق من عدم تسريب بيانات في API responses
- [ ] التحقق من الـ Audit Log

**Tests:**
- [ ] Backend: Jest + Supertest — coverage > 70%
- [ ] Frontend: React Testing Library للـ Components الحرجة

### Deliverable
تقرير Security Audit + Test Coverage Report + قائمة بكل المشاكل المحلولة

---

## Phase 9 — Performance, SEO & Accessibility
**الهدف:** الوصول لمعايير الأداء المحددة في SRS

### المهام

**Performance:**
- [ ] Lighthouse Score > 90 على الصفحة الرئيسية
- [ ] LCP < 2.5s | TTFB < 200ms | CLS < 0.1
- [ ] تحسين الصور (next/image + WebP + lazy loading)
- [ ] Code splitting وتقليل Bundle Size
- [ ] التحقق من Redis Cache (Cache Hit Rate > 80%)
- [ ] EXPLAIN ANALYZE على الاستعلامات البطيئة

**SEO:**
- [ ] title + description + canonical لكل الصفحات
- [ ] Sitemap.xml ديناميكي
- [ ] robots.txt صحيح
- [ ] Open Graph tags
- [ ] Schema.org markup للكلية والأقسام

**Accessibility:**
- [ ] alt text لكل الصور
- [ ] Keyboard navigation يعمل
- [ ] ARIA labels على العناصر التفاعلية
- [ ] Contrast ratio مناسب

### Deliverable
Lighthouse Report + PageSpeed Insights Score > 90

---

## Phase 10 — Production Deploy & Handover
**الهدف:** إطلاق الموقع الجديد ونقل الملكية للكلية

### المهام

**Pre-Launch:**
- [ ] مراجعة كل الـ Environment Variables في Production
- [ ] إعداد SSL Certificate
- [ ] إعداد نظام النسخ الاحتياطي (pg_dump يومي)
- [ ] اختبار Load على السيرفر

**Deploy:**
- [ ] Deploy Backend على السيرفر
- [ ] Deploy Frontend (Next.js)
- [ ] إعداد Nginx reverse proxy
- [ ] إعداد PM2 لإدارة Node.js processes
- [ ] تشغيل `prisma migrate deploy` في Production
- [ ] Seed البيانات الأساسية

**GitHub CI/CD:**
- [ ] GitHub Actions workflow
- [ ] Auto-deploy على Staging عند Push لـ `main`
- [ ] يدوي Deploy للـ Production بعد الموافقة

**Handover:**
- [ ] دليل مستخدم بالعربية لمدير الموقع (PDF)
- [ ] تدريب موظف الكلية على الـ CMS (4 ساعات)
- [ ] توثيق وتسليم بيانات الاعتماد بشكل آمن
- [ ] إنشاء حساب مدير أول للكلية

### Deliverable
الموقع يعمل على الـ Domain الرسمي + الكلية تستطيع إدارته بشكل مستقل

---

## ملخص الـ Phases

| Phase | الوصف | المدة المقدرة |
|-------|-------|--------------|
| Phase 0 | Project Setup | 2-3 أيام |
| Phase 1 | Backend: Auth | 4-5 أيام |
| Phase 2 | Backend: Core Data | 5-7 أيام |
| Phase 3 | Backend: Academic | 5-7 أيام |
| Phase 4 | Backend: Content | 4-5 أيام |
| Phase 5 | Backend: Conferences & Search | 5-6 أيام |
| Phase 6 | Frontend: Public Website | 10-14 أيام |
| Phase 7 | Frontend: Dashboards | 10-12 أيام |
| Phase 8 | Integration & Security | 5-7 أيام |
| Phase 9 | Performance & SEO | 3-4 أيام |
| Phase 10 | Deploy & Handover | 3-4 أيام |
| **المجموع** | | **~56-74 يوم** |

---

## GitHub Branch Strategy

```
main        →  Production (محمي — لا push مباشر)
develop     →  Staging (integration branch)
feature/*   →  كل feature في branch مستقل

أمثلة:
  phase-1/auth-system
  phase-2/departments-api
  phase-6/department-cards
  phase-7/student-dashboard
```

---

*نهاية المستند — الإصدار 1.0*
