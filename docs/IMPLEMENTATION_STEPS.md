# Step-by-Step Implementation Guide
## Adding Missing Features to fa-arch-new

**Version:** 1.0  
**Date:** June 29, 2026

---

## Phase 1: Database Schema Update (Day 1)

### Step 1.1: Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

**Action:** Add all new models from `schema-additions.prisma` to the main schema file

**Critical Points:**
- Add new enums before models
- Add relations to existing Department model:
  ```prisma
  model Department {
    // ... existing fields ...
    excavationSites ExcavationSite[]  // NEW
  }
  ```
- Add relation to FacultyMember model:
  ```prisma
  model FacultyMember {
    // ... existing fields ...
    qualityBoardMember QualityBoardMember?  // NEW
  }
  ```

### Step 1.2: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_missing_features
```

### Step 1.3: Update Seed Data

**File:** `backend/prisma/seed.ts`

**Add seed data for:**
1. Quality Assurance board members (minimal)
2. Student Services (bookstore, youth care, training, cultural)
3. Excavation Sites (Saqqara + 8 others from old site)
4. Special Programs (AIS, Archaeological Guidance)
5. Research Centers (Conservation Center, Luxor Center)
6. External Links (Blackboard + social media)

---

## Phase 2: Backend API Development (Days 2-5)

### Module Structure Template

For each new feature, create modular structure:

```
backend/src/modules/{feature}/
  ├── {feature}.routes.ts
  ├── {feature}.controller.ts
  ├── {feature}.service.ts
  └── {feature}.types.ts
```

### 2.1 Quality Assurance Module (Day 2 Morning)

**Files to create:**
- `backend/src/modules/quality/quality.routes.ts`
- `backend/src/modules/quality/quality.controller.ts`
- `backend/src/modules/quality/quality.service.ts`
- `backend/src/modules/quality/quality.types.ts`

**API Endpoints:**
```typescript
// Public routes
GET    /api/quality/board              → List board members
GET    /api/quality/documents           → List documents (published only)

// Admin routes (CMS_ROLES)
POST   /api/quality/board               → Add board member
PUT    /api/quality/board/:id           → Update board member
DELETE /api/quality/board/:id           → Delete board member
POST   /api/quality/documents           → Upload document
PUT    /api/quality/documents/:id       → Update document
DELETE /api/quality/documents/:id       → Delete document
PUT    /api/quality/documents/:id/publish → Publish/unpublish
```


**Key Implementation Details:**
- Use same pattern as `news` module
- Apply `auth`, `authorize([CMS_ROLES])`, `auditLog` middleware for admin routes
- Bilingual content support (Ar/En)
- File upload support for documents (PDF)

### 2.2 Student Services Module (Day 2 Afternoon)

**Files to create:**
- `backend/src/modules/student-services/student-services.routes.ts`
- `backend/src/modules/student-services/student-services.controller.ts`
- `backend/src/modules/student-services/student-services.service.ts`
- `backend/src/modules/student-services/student-services.types.ts`

**API Endpoints:**
```typescript
// Public routes
GET    /api/student-services            → List all services
GET    /api/student-services/:id        → Service details
GET    /api/student-services/events     → Upcoming events

// Admin routes
POST   /api/student-services            → Create service
PUT    /api/student-services/:id        → Update service
DELETE /api/student-services/:id        → Delete service
POST   /api/student-services/events     → Create event
PUT    /api/student-services/events/:id → Update event
DELETE /api/student-services/events/:id → Delete event
```

**Implementation Pattern:**
```typescript
// student-services.routes.ts
import { Router } from 'express';
import { studentServicesController } from './student-services.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

// Public
router.get('/', studentServicesController.listServices);
router.get('/events', studentServicesController.listEvents);
router.get('/:id', studentServicesController.getService);

// Admin
router.post('/', auth, authorize(CMS_ROLES), auditLog('student_services'), 
  studentServicesController.createService);
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('student_services'), 
  studentServicesController.updateService);
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('student_services'), 
  studentServicesController.deleteService);

export default router;
```

### 2.3 Excavation Sites Module (Day 3)

**Files to create:**
- `backend/src/modules/excavations/excavations.routes.ts`
- `backend/src/modules/excavations/excavations.controller.ts`
- `backend/src/modules/excavations/excavations.service.ts`
- `backend/src/modules/excavations/excavations.types.ts`

**API Endpoints:**
```typescript
// Public routes
GET    /api/excavations                 → List all sites
GET    /api/excavations/:slug           → Site details
GET    /api/excavations/:slug/seasons   → Seasons for site
GET    /api/excavations/:slug/findings  → Findings for site
GET    /api/excavations/:slug/gallery   → Gallery for site

// Admin routes
POST   /api/excavations                 → Create site
PUT    /api/excavations/:id             → Update site
DELETE /api/excavations/:id             → Delete site
POST   /api/excavations/:id/seasons     → Add season
POST   /api/excavations/:id/findings    → Add finding
POST   /api/excavations/:id/gallery     → Add gallery image
```

**Key Features:**
- Slug-based routing for SEO
- Support for external URLs (Saqqara site)
- Department association
- Image gallery management
- Seasonal data tracking


### 2.4 Community Service Module (Day 3 Afternoon)

**Files to create:**
- `backend/src/modules/community/community.routes.ts`
- `backend/src/modules/community/community.controller.ts`
- `backend/src/modules/community/community.service.ts`
- `backend/src/modules/community/community.types.ts`

**API Endpoints:**
```typescript
GET    /api/community/projects          → List projects (public)
GET    /api/community/projects/:id      → Project details
POST   /api/community/projects          → Create project (admin)
PUT    /api/community/projects/:id      → Update project (admin)
DELETE /api/community/projects/:id      → Delete project (admin)
```

### 2.5 Special Programs Module (Day 4 Morning)

**Files to create:**
- `backend/src/modules/special-programs/special-programs.routes.ts`
- `backend/src/modules/special-programs/special-programs.controller.ts`
- `backend/src/modules/special-programs/special-programs.service.ts`
- `backend/src/modules/special-programs/special-programs.types.ts`

**API Endpoints:**
```typescript
GET    /api/special-programs            → List programs
GET    /api/special-programs/:slug      → Program details
POST   /api/special-programs            → Create program (admin)
PUT    /api/special-programs/:id        → Update program (admin)
DELETE /api/special-programs/:id        → Delete program (admin)
```

### 2.6 Protocols & Agreements Module (Day 4 Afternoon)

**Files to create:**
- `backend/src/modules/agreements/agreements.routes.ts`
- `backend/src/modules/agreements/agreements.controller.ts`
- `backend/src/modules/agreements/agreements.service.ts`
- `backend/src/modules/agreements/agreements.types.ts`

**API Endpoints:**
```typescript
GET    /api/agreements                  → List agreements
GET    /api/agreements/:id              → Agreement details
POST   /api/agreements                  → Create agreement (admin)
PUT    /api/agreements/:id              → Update agreement (admin)
DELETE /api/agreements/:id              → Delete agreement (admin)
```

### 2.7 Research Centers Module (Day 5 Morning)

**Files to create:**
- `backend/src/modules/centers/centers.routes.ts`
- `backend/src/modules/centers/centers.controller.ts`
- `backend/src/modules/centers/centers.service.ts`
- `backend/src/modules/centers/centers.types.ts`

**API Endpoints:**
```typescript
GET    /api/centers                     → List centers
GET    /api/centers/:slug               → Center details
POST   /api/centers                     → Create center (admin)
PUT    /api/centers/:id                 → Update center (admin)
DELETE /api/centers/:id                 → Delete center (admin)
```

### 2.8 External Links Module (Day 5 Afternoon)

**Files to create:**
- `backend/src/modules/external-links/external-links.routes.ts`
- `backend/src/modules/external-links/external-links.controller.ts`
- `backend/src/modules/external-links/external-links.service.ts`
- `backend/src/modules/external-links/external-links.types.ts`

**API Endpoints:**
```typescript
GET    /api/external-links              → List all links
GET    /api/external-links/category/:category → Links by category
POST   /api/external-links              → Create link (admin)
PUT    /api/external-links/:id          → Update link (admin)
DELETE /api/external-links/:id          → Delete link (admin)
```

**Special Note:** This handles Blackboard, social media, and other external links

### 2.9 Update app.ts (Day 5 End)

**File:** `backend/src/app.ts`

**Add after existing routes:**
```typescript
// Phase X — Missing Features
import qualityRoutes from './modules/quality/quality.routes';
import studentServicesRoutes from './modules/student-services/student-services.routes';
import excavationsRoutes from './modules/excavations/excavations.routes';
import communityRoutes from './modules/community/community.routes';
import specialProgramsRoutes from './modules/special-programs/special-programs.routes';
import agreementsRoutes from './modules/agreements/agreements.routes';
import centersRoutes from './modules/centers/centers.routes';
import externalLinksRoutes from './modules/external-links/external-links.routes';

app.use('/api/quality', qualityRoutes);
app.use('/api/student-services', studentServicesRoutes);
app.use('/api/excavations', excavationsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/special-programs', specialProgramsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/external-links', externalLinksRoutes);
```

---

## Phase 3: Frontend Development (Days 6-9)

### 3.1 Quality Assurance Pages (Day 6 Morning)

**Create directory structure:**
```
frontend/app/[locale]/quality/
  ├── page.tsx                     → Main QA page
  ├── board/
  │   └── page.tsx                 → Board members list
  └── documents/
      └── page.tsx                 → Documents list
```

**Public Pages Pattern:**
```typescript
// app/[locale]/quality/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function QualityPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'quality' });
  
  // Fetch from API
  const boardMembers = await fetch(`${API_URL}/api/quality/board`).then(r => r.json());
  const documents = await fetch(`${API_URL}/api/quality/documents`).then(r => r.json());

  return (
    <div>
      <h1>{t('title')}</h1>
      {/* Render board members */}
      {/* Render documents */}
    </div>
  );
}
```


### 3.2 Student Services Pages (Day 6 Afternoon)

**Create directory structure:**
```
frontend/app/[locale]/students/
  ├── services/
  │   ├── page.tsx                → Services list
  │   └── [id]/page.tsx           → Service details
  └── events/
      └── page.tsx                → Events list
```

### 3.3 Excavations Pages (Day 7)

**Create directory structure:**
```
frontend/app/[locale]/excavations/
  ├── page.tsx                    → Excavation sites list
  └── [slug]/
      ├── page.tsx                → Site details
      ├── seasons/page.tsx        → Seasons history
      ├── findings/page.tsx       → Discoveries
      └── gallery/page.tsx        → Photo gallery
```

**Key Features:**
- Image galleries with lightbox
- Timeline of seasons
- Findings showcase
- External link handling (Saqqara)

### 3.4 Community Service Pages (Day 7 Afternoon)

**Create directory structure:**
```
frontend/app/[locale]/community/
  ├── page.tsx                    → Community service overview
  └── projects/
      ├── page.tsx                → Projects list
      └── [id]/page.tsx           → Project details
```

### 3.5 Special Programs Pages (Day 8 Morning)

**Create directory structure:**
```
frontend/app/[locale]/programs/
  ├── special/
  │   ├── page.tsx                → Special programs list
  │   └── [slug]/page.tsx         → Program details (AIS, Guidance)
```

### 3.6 Protocols & Centers Pages (Day 8 Afternoon)

**Create directory structures:**
```
frontend/app/[locale]/about/
  ├── agreements/
  │   └── page.tsx                → International agreements
  └── centers/
      ├── page.tsx                → Research centers list
      └── [slug]/page.tsx         → Center details (Conservation, Luxor)
```

### 3.7 Update Navigation (Day 9 Morning)

**File:** `frontend/components/layout/PublicNavbar.tsx`

**Add new menu items:**
```typescript
const navItems = [
  // ... existing items ...
  {
    label: t('nav.quality'),
    href: '/quality',
  },
  {
    label: t('nav.students'),
    children: [
      { label: t('nav.services'), href: '/students/services' },
      { label: t('nav.events'), href: '/students/events' },
    ],
  },
  {
    label: t('nav.excavations'),
    href: '/excavations',
  },
  {
    label: t('nav.community'),
    href: '/community',
  },
  // ... rest
];
```

### 3.8 Add Blackboard Integration (Day 9 Afternoon)

**Update Student Dashboard:**
```typescript
// frontend/app/[locale]/student/dashboard/page.tsx

// Add quick links section
const quickLinks = await fetch(`${API_URL}/api/external-links/category/academic_system`);

// Render Blackboard link prominently
<QuickLinksSection links={quickLinks} />
```

**Update Faculty Dashboard:**
```typescript
// frontend/app/[locale]/faculty/dashboard/page.tsx

// Add same quick links
```

---

## Phase 4: Admin CMS Integration (Days 10-12)

### 4.1 Admin Dashboard Pages Structure

**Create admin pages for each feature:**

```
frontend/app/[locale]/admin/
  ├── quality/
  │   ├── board/
  │   │   ├── page.tsx           → List board members
  │   │   └── new/page.tsx       → Add member
  │   └── documents/
  │       ├── page.tsx           → List documents
  │       └── new/page.tsx       → Upload document
  ├── student-services/
  │   ├── page.tsx               → List services
  │   ├── new/page.tsx           → Create service
  │   └── events/
  │       ├── page.tsx           → List events
  │       └── new/page.tsx       → Create event
  ├── excavations/
  │   ├── page.tsx               → List sites
  │   ├── new/page.tsx           → Create site
  │   └── [id]/
  │       ├── seasons/page.tsx   → Manage seasons
  │       ├── findings/page.tsx  → Manage findings
  │       └── gallery/page.tsx   → Manage gallery
  ├── community/
  │   ├── page.tsx               → List projects
  │   └── new/page.tsx           → Create project
  ├── special-programs/
  │   ├── page.tsx               → List programs
  │   └── new/page.tsx           → Create program
  ├── agreements/
  │   ├── page.tsx               → List agreements
  │   └── new/page.tsx           → Create agreement
  ├── centers/
  │   ├── page.tsx               → List centers
  │   └── new/page.tsx           → Create center
  └── external-links/
      ├── page.tsx               → Manage all links
      └── new/page.tsx           → Add link
```

### 4.2 Admin Components Pattern

**Example: Quality Board Member Form**

```typescript
// frontend/app/[locale]/admin/quality/board/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBoardMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    positionAr: '',
    positionEn: '',
    email: '',
    facultyId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/quality/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (res.ok) {
      router.push('/admin/quality/board');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 4.3 Update Admin Sidebar Navigation

**File:** `frontend/components/layout/AdminSidebar.tsx`

**Add new menu sections:**
```typescript
const menuItems = [
  // ... existing items ...
  {
    label: 'Quality Assurance',
    icon: 'CheckCircle',
    children: [
      { label: 'Board Members', href: '/admin/quality/board' },
      { label: 'Documents', href: '/admin/quality/documents' },
    ],
  },
  {
    label: 'Student Services',
    icon: 'Users',
    children: [
      { label: 'Services', href: '/admin/student-services' },
      { label: 'Events', href: '/admin/student-services/events' },
    ],
  },
  {
    label: 'Excavations',
    icon: 'MapPin',
    href: '/admin/excavations',
  },
  {
    label: 'Community Service',
    icon: 'Heart',
    href: '/admin/community',
  },
  {
    label: 'Special Programs',
    icon: 'GraduationCap',
    href: '/admin/special-programs',
  },
  {
    label: 'Research & Partnerships',
    icon: 'Globe',
    children: [
      { label: 'Agreements', href: '/admin/agreements' },
      { label: 'Centers', href: '/admin/centers' },
    ],
  },
  {
    label: 'External Links',
    icon: 'ExternalLink',
    href: '/admin/external-links',
  },
];
```

---

## Phase 5: i18n Translations (Day 13)

### Add translations for all new features

**Files to update:**
- `frontend/messages/ar.json`
- `frontend/messages/en.json`

**Example structure:**
```json
{
  "quality": {
    "title": "وحدة ضمان الجودة والاعتماد",
    "board": "أعضاء مجلس الجودة",
    "documents": "المستندات",
    "accreditation": "الاعتماد"
  },
  "studentServices": {
    "title": "خدمات الطلاب",
    "bookstore": "بيع الكتب",
    "youthCare": "رعاية الشباب",
    "training": "التدريب العملي",
    "cultural": "المواسم الثقافية"
  },
  "excavations": {
    "title": "حفائر الكلية",
    "sites": "مواقع الحفائر",
    "seasons": "المواسم",
    "findings": "الاكتشافات",
    "gallery": "معرض الصور"
  }
}
```


---

## Phase 6: Testing & Quality Assurance (Days 14-15)

### 6.1 Backend API Tests

**Create test files for each module:**

```typescript
// backend/tests/quality.test.ts

describe('Quality Assurance API', () => {
  describe('GET /api/quality/board', () => {
    it('should return list of board members', async () => {
      const res = await request(app).get('/api/quality/board');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/quality/board (Admin)', () => {
    it('should create board member with auth', async () => {
      const res = await request(app)
        .post('/api/quality/board')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nameAr: 'أ.د. محمد أحمد',
          positionAr: 'رئيس وحدة الجودة',
        });
      expect(res.status).toBe(201);
    });

    it('should reject without auth', async () => {
      const res = await request(app).post('/api/quality/board').send({});
      expect(res.status).toBe(401);
    });
  });
});
```

### 6.2 Integration Tests

**Test complete workflows:**
1. Admin creates QA board member → Public sees it
2. Admin uploads document → Publishes → Student dashboard shows link
3. Admin creates excavation site → Public page displays correctly
4. Blackboard link appears in student/faculty dashboards

### 6.3 Manual Testing Checklist

**For each feature:**
- [ ] Public pages render correctly
- [ ] Arabic/English switching works
- [ ] Admin can create/edit/delete
- [ ] Audit logs are created
- [ ] Images upload and display correctly
- [ ] External links work
- [ ] Mobile responsive
- [ ] SEO metadata present

---

## Phase 7: Data Migration (Day 16)

### 7.1 Migrate Content from Old Site

**Create migration scripts:**

```bash
backend/scripts/
  ├── migrate-qa-content.ts
  ├── migrate-excavation-sites.ts
  ├── migrate-services.ts
  └── migrate-external-links.ts
```

**Example migration script:**

```typescript
// backend/scripts/migrate-excavation-sites.ts

import { prisma } from '../src/config/database';

const sitesFromOldSite = [
  {
    slug: 'saqqara',
    nameAr: 'حفائر سقارة',
    nameEn: 'Saqqara Excavations',
    descriptionAr: '...',
    externalUrl: 'http://saqqara.fa-arch.cu.edu.eg',
    departmentId: 'egyptology_dept_id',
  },
  {
    slug: 'anbiba',
    nameAr: 'حفائر عنبية',
    nameEn: 'Anbiba Excavations',
    // ... other sites
  },
];

async function migrate() {
  for (const site of sitesFromOldSite) {
    await prisma.excavationSite.create({ data: site });
    console.log(`✅ Migrated: ${site.nameAr}`);
  }
}

migrate();
```

### 7.2 Migrate Images and Files

**Steps:**
1. Copy images from old site to `backend/uploads/excavations/`
2. Copy PDFs to `backend/uploads/quality/`
3. Update database URLs to point to new locations
4. Verify all files are accessible

---

## Phase 8: Deployment & Documentation (Day 17)

### 8.1 Update Documentation

**Files to update:**
- `README.md` → Add new features to feature list
- `docs/FRD.md` → Document new modules
- `docs/SRS.md` → Add technical specifications
- `docs/API.md` → Document new API endpoints

### 8.2 Update Postman Collection

**Add new endpoints to:**
- `postman/Faculty-of-Archaeology-API.json`

### 8.3 Deployment Checklist

- [ ] Run all tests: `npm test`
- [ ] Run migrations on production DB
- [ ] Run seed script to populate initial data
- [ ] Upload images to production storage
- [ ] Update environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Smoke test all new pages
- [ ] Verify admin CMS functions

---

## Critical Implementation Notes

### 1. Maintain Consistency

**Always follow existing patterns:**
- Use same middleware order: `auth` → `authorize` → `auditLog`
- Use same error handling approach
- Use same response format: `{ success: boolean, data?: any, error?: string }`
- Use same naming conventions (camelCase for TS, snake_case for DB)

### 2. Bilingual Support

**Every text field needs both:**
```typescript
{
  titleAr: string;    // Required
  titleEn?: string;   // Optional, fallback to Ar
  descriptionAr?: string;
  descriptionEn?: string;
}
```

### 3. Audit Logging

**All CMS write operations must log:**
```typescript
router.post('/', 
  auth, 
  authorize(CMS_ROLES), 
  auditLog('entity_name'),  // ← This logs the operation
  controller.create
);
```

### 4. Image Upload Handling

**Follow existing upload middleware:**
```typescript
import { uploadSingle } from '../../middleware/upload';

router.post('/:id/image', 
  auth, 
  authorize(CMS_ROLES), 
  uploadSingle('image', 'excavations'),  // category
  controller.uploadImage
);
```

### 5. Pagination

**For list endpoints, add pagination:**
```typescript
// In service
async listItems(page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.count({ where: filters }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### 6. Security Best Practices

**Never skip middleware:**
```typescript
// ❌ WRONG - allows unauthorized access
router.delete('/:id', controller.delete);

// ✅ CORRECT - protected route
router.delete('/:id', auth, authorize([UserRole.admin]), auditLog('entity'), controller.delete);
```

### 7. Frontend Data Fetching

**Use Next.js patterns:**
```typescript
// Server component (default)
export default async function Page() {
  const data = await fetch(API_URL).then(r => r.json());
  return <div>{data}</div>;
}

// Client component (interactive)
'use client';
export default function Page() {
  const { data } = useQuery({ queryKey: ['key'], queryFn: fetchData });
  return <div>{data}</div>;
}
```

---

## Rollback Plan

If issues arise during implementation:

1. **Database rollback:**
   ```bash
   npx prisma migrate reset  # Drops DB and re-runs all migrations
   ```

2. **Code rollback:**
   ```bash
   git revert <commit-hash>
   ```

3. **Partial deployment:**
   - Deploy features incrementally
   - Test each module before proceeding
   - Keep old site running in parallel initially

---

## Success Criteria

✅ **All features implemented:**
- Quality Assurance pages functional
- Student Services accessible
- Excavation sites with galleries
- Community Service projects visible
- Special Programs documented
- Agreements listed
- Research Centers detailed
- Blackboard integrated in dashboards

✅ **Admin CMS complete:**
- All features manageable from admin panel
- Audit logs working
- File uploads functional

✅ **Quality checks passed:**
- All tests passing
- No console errors
- Mobile responsive
- i18n working
- SEO metadata present

✅ **Performance maintained:**
- Page load times < 2s
- Database queries optimized
- Images optimized

---

## Timeline Summary

| Phase | Days | Description |
|-------|------|-------------|
| Phase 1 | 1 | Database schema update |
| Phase 2 | 4 | Backend API development (8 modules) |
| Phase 3 | 4 | Frontend public pages |
| Phase 4 | 3 | Admin CMS integration |
| Phase 5 | 1 | i18n translations |
| Phase 6 | 2 | Testing & QA |
| Phase 7 | 1 | Data migration |
| Phase 8 | 1 | Deployment & docs |
| **Total** | **17 days** | **Complete implementation** |

---

**Document Version:** 1.0  
**Last Updated:** June 29, 2026  
**Status:** Ready for Development
