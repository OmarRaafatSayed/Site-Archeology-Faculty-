# Missing Features Implementation Plan
## Professional Integration with Existing Architecture

**Version:** 1.0  
**Date:** June 29, 2026  
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a comprehensive plan to add missing features from the old site
into the new site (fa-arch-new) while maintaining:

- ✅ Existing code architecture and patterns
- ✅ Database schema consistency
- ✅ Backend modular structure (routes/controller/service/types)
- ✅ Frontend i18n and routing conventions
- ✅ Admin CMS integration for all new content
- ✅ Security and audit logging
- ✅ API consistency and documentation

---

## Architecture Analysis

### Current System Structure

**Backend Pattern:**
```
modules/
  ├── {feature}/
  │   ├── {feature}.routes.ts    → Express routes with middleware
  │   ├── {feature}.controller.ts → Request handling
  │   ├── {feature}.service.ts    → Business logic + DB operations
  │   └── {feature}.types.ts      → TypeScript interfaces
```

**Database Pattern:**
- PostgreSQL with Prisma ORM
- Enums for controlled values
- Audit logging for all CMS operations
- Timestamps (createdAt, updatedAt)
- Bilingual content (nameAr/nameEn, contentAr/contentEn)

**Frontend Pattern:**
```
app/[locale]/
  ├── {feature}/
  │   ├── page.tsx               → Server component
  │   └── [id]/page.tsx          → Dynamic route
```

**Admin CMS Pattern:**
- All content manageable through `/admin/dashboard`
- RBAC middleware on all CMS routes
- Audit logging on all write operations
- Excel import support where applicable

---

## Features to Add

### HIGH PRIORITY

1. **Quality Assurance Unit** (الجودة والاعتماد)
2. **Student Services** (خدمات الطلاب)
3. **Excavation Sites** (حفائر الكلية)
4. **Community Service Sector** (قطاع خدمة المجتمع)
5. **Blackboard Integration** (تكامل بلاك بورد)

### MEDIUM PRIORITY

6. **Special Programs** (البرامج الخاصة)
7. **Protocols & Agreements** (الاتفاقيات)
8. **Luxor Study Center** (مركز الدراسات بالأقصر)

---

## Database Schema Extensions

### 1. Quality Assurance (QA) Tables

```prisma
// Add to schema.prisma

enum QADocumentType {
  report
  policy
  accreditation
  meeting_minutes
  improvement_plan
}

model QualityBoardMember {
  id        String   @id @default(uuid()) @db.Uuid
  facultyId String?  @map("faculty_id") @db.Uuid
  nameAr    String   @map("name_ar") @db.VarChar(255)
  nameEn    String?  @map("name_en") @db.VarChar(255)
  position  String   @db.VarChar(255)
