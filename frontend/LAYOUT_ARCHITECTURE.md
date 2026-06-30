# Layout Architecture - Next.js 14 Route Groups

## المشكلة التي تم حلها (Problem Solved)

كانت المشكلة أن بعض الصفحات (مثل Login و Forgot Password) كانت ترث الـ Navbar والـ Footer من الـ root layout، مما أدى إلى:
1. ظهور navbar/footer في صفحات تسجيل الدخول (غير مرغوب)
2. Hydration errors بسبب استخدام `usePathname()` في client component
3. Double wrappers بسبب nested layouts

**The problem was:** Some pages (like Login and Forgot Password) were inheriting Navbar and Footer from root layout, causing:
1. Navbar/footer appearing on login pages (undesired)
2. Hydration errors from using `usePathname()` in client component
3. Double wrappers from nested layouts

## الحل (Solution)

استخدام **Next.js Route Groups** لفصل الـ layouts بشكل صحيح:

**Using Next.js Route Groups** to properly separate layouts:

```
app/[locale]/
├── layout.tsx                    → Root layout (wraps all with NextIntlClientProvider)
├── LayoutContent.tsx             → Default layout (Navbar + Footer)
├── page.tsx                      → Homepage (has navbar/footer)
│
├── (auth)/                       → AUTH ROUTE GROUP - No navbar/footer
│   ├── layout.tsx                → Custom HTML/body without navbar/footer
│   ├── login/
│   │   ├── layout.tsx            → Centered container
│   │   ├── page.tsx              → Login form
│   │   └── LoginForm.tsx
│   └── forgot-password/
│       ├── layout.tsx            → Centered container
│       ├── page.tsx              → Password recovery form
│       └── ForgotPasswordForm.tsx
│
├── admin/dashboard/              → Dashboard pages (inherit root but DashboardShell overrides)
│   ├── layout.tsx                → DashboardGuard + AdminNavWrapper
│   └── ...
│
├── student/dashboard/            → Student dashboard
│   ├── layout.tsx                → DashboardGuard + StudentNavWrapper
│   └── ...
│
├── faculty/dashboard/            → Faculty dashboard
│   ├── layout.tsx                → DashboardGuard + FacultyNavWrapper
│   └── ...
│
├── about/                        → Public pages (have navbar/footer from LayoutContent)
├── news/
├── departments/
└── ...
```

## كيف تعمل Route Groups (How Route Groups Work)

### 1. `(auth)` Route Group
- **الملف:** `app/[locale]/(auth)/layout.tsx`
- **الوظيفة:** يستبدل الـ root layout بالكامل (html, body)
- **النتيجة:** صفحات Login و Forgot Password **بدون** navbar/footer
- **URL:** `(auth)` لا يظهر في الـ URL → `/ar/login` و `/ar/forgot-password`

**File:** `app/[locale]/(auth)/layout.tsx`
**Function:** Replaces root layout completely (html, body)
**Result:** Login and Forgot Password pages **WITHOUT** navbar/footer
**URL:** `(auth)` doesn't appear in URL → `/ar/login` and `/ar/forgot-password`

### 2. Public Pages (Default)
- **الملف:** `app/[locale]/layout.tsx` → calls `LayoutContent.tsx`
- **الوظيفة:** يضيف Navbar + Footer لكل الصفحات الأخرى
- **النتيجة:** صفحات About، News، Departments، إلخ **بها** navbar/footer

**File:** `app/[locale]/layout.tsx` → calls `LayoutContent.tsx`
**Function:** Adds Navbar + Footer to all other pages
**Result:** About, News, Departments, etc. pages **HAVE** navbar/footer

### 3. Dashboard Pages
- **الملفات:** `admin/dashboard/layout.tsx`, etc.
- **الوظيفة:** DashboardShell يخلق full-screen layout خاص
- **النتيجة:** Dashboard pages لها navigation خاص بها (sidebar)
- **ملاحظة:** technically ترث root layout لكن DashboardShell بياخد full screen

**Files:** `admin/dashboard/layout.tsx`, etc.
**Function:** DashboardShell creates own full-screen layout
**Result:** Dashboard pages have their own navigation (sidebar)
**Note:** Technically inherit root layout but DashboardShell takes full screen

## مميزات الحل (Benefits)

✅ **لا hydration errors** - كل layout server component
✅ **فصل نظيف** - كل نوع صفحة لها structure خاص
✅ **Performance** - Next.js يحسن بناءً على route groups
✅ **Maintainable** - واضح أي صفحة لها أي layout
✅ **SEO-friendly** - Server-side rendering للكل

✅ **No hydration errors** - All layouts are server components
✅ **Clean separation** - Each page type has its own structure
✅ **Performance** - Next.js optimizes based on route groups
✅ **Maintainable** - Clear which pages have which layout
✅ **SEO-friendly** - Server-side rendering for all

## Testing Checklist

### Auth Pages (No Navbar/Footer)
- [ ] `/ar/login` - يجب **عدم** ظهور navbar/footer
- [ ] `/en/login` - Should **NOT** show navbar/footer
- [ ] `/ar/forgot-password` - يجب **عدم** ظهور navbar/footer
- [ ] `/en/forgot-password` - Should **NOT** show navbar/footer

### Public Pages (With Navbar/Footer)
- [ ] `/ar` - Homepage **مع** navbar/footer
- [ ] `/ar/about/history` - يجب ظهور navbar/footer
- [ ] `/ar/news` - يجب ظهور navbar/footer
- [ ] `/ar/departments` - يجب ظهور navbar/footer
- [ ] `/ar/faculty` - Public faculty listing **مع** navbar/footer

### Dashboard Pages (Own Navigation)
- [ ] `/ar/admin/dashboard` - يجب ظهور **sidebar** فقط (لا public navbar)
- [ ] `/ar/student/dashboard` - يجب ظهور **sidebar** فقط
- [ ] `/ar/faculty/dashboard` - يجب ظهور **sidebar** فقط

### No Errors
- [ ] No hydration errors in console
- [ ] No layout shift
- [ ] Smooth transitions between pages

## إذا احتجت إضافة صفحة جديدة (Adding New Pages)

### صفحة عامة مع navbar/footer (Public page with navbar/footer)
```bash
# Simply create in app/[locale]/
app/[locale]/new-page/page.tsx
```

### صفحة auth بدون navbar/footer (Auth page without navbar/footer)
```bash
# Create inside (auth) route group
app/[locale]/(auth)/new-auth-page/page.tsx
```

### صفحة dashboard (Dashboard page)
```bash
# Already have DashboardGuard handling it
app/[locale]/admin/dashboard/new-feature/page.tsx
```

## الملفات المهمة (Key Files)

1. **`app/[locale]/layout.tsx`** - Root layout with i18n
2. **`app/[locale]/LayoutContent.tsx`** - Default wrapper (Navbar + Footer)
3. **`app/[locale]/(auth)/layout.tsx`** - Auth layout (NO navbar/footer)
4. **`components/layout/PublicNavbar.tsx`** - Public navigation
5. **`components/layout/Footer.tsx`** - Public footer
6. **`components/dashboard/DashboardShell.tsx`** - Dashboard wrapper

---

**Date Fixed:** 2026-06-29
**Issue:** Hydration error + navbar/footer on auth pages
**Solution:** Next.js Route Groups with separate layout structures
