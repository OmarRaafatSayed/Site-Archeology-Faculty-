# كلية الآثار — جامعة القاهرة | Faculty of Archaeology — Cairo University

إعادة بناء كاملة للموقع الرسمي لكلية الآثار بجامعة القاهرة بتكنولوجيا حديثة.

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Cache | Redis |
| Auth | JWT + bcrypt |

## هيكل المشروع

```
fa-arch-new/
├── backend/        ← Node.js + Express API
├── frontend/       ← Next.js 14
└── docs/           ← التوثيق الكامل
    ├── BRD.md      ← Business Requirements
    ├── FRD.md      ← Functional Requirements
    ├── SRS.md      ← Software Requirements Specification
    └── PHASES.md   ← خطة التطوير (Phase 0 → 10)
```

## التوثيق

- [BRD — متطلبات الأعمال](./docs/BRD.md)
- [FRD — المتطلبات الوظيفية](./docs/FRD.md)
- [SRS — المواصفات التقنية](./docs/SRS.md)
- [PHASES — خطة التطوير](./docs/PHASES.md)

## البدء

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
