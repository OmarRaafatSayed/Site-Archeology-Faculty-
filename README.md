# Faculty of Archaeology Website — كلية الآثار

الموقع الرسمي لكلية الآثار بجامعة القاهرة — إعادة بناء كاملة من الصفر.

## 📚 المستندات

- [BRD — Business Requirements](./docs/BRD.md)
- [FRD — Functional Requirements](./docs/FRD.md)
- [SRS — System Requirements](./docs/SRS.md)
- [PHASES — خطة التطوير](./docs/PHASES.md)

## 🛠️ Tech Stack

**Backend:**
- Node.js 20 + Express.js + TypeScript
- PostgreSQL 16 + Prisma ORM
- Redis 7 (caching & sessions)
- JWT Authentication + bcrypt
- Zod (validation) + Multer (file uploads)

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + next-intl (AR/EN)
- TanStack Query + Zustand

**Infrastructure:**
- Docker Compose (Development & Production)
- Nginx (Reverse Proxy في Production)
- GitHub Actions (CI/CD)

---

## 🚀 Development Setup

### المتطلبات الأساسية

```bash
- Node.js 20+
- Docker & Docker Compose
- Git
```

### 1️⃣ Clone المشروع

```bash
git clone https://github.com/OmarRaafatSayed/Site-Archeology-Faculty-.git
cd fa-arch-new
```

### 2️⃣ شغّل PostgreSQL و Redis بـ Docker

```bash
docker compose up -d
```

يشغّل:
- PostgreSQL على `localhost:5432`
- Redis على `localhost:6379`
- pgAdmin على `http://localhost:5050` (اختياري — استخدم `--profile tools`)

### 3️⃣ إعداد Backend

```bash
cd backend
npm install
cp .env.example .env
```

**عدّل `.env` وحط قيم صحيحة للـ JWT secrets:**

```env
JWT_ACCESS_SECRET="your_256_bit_random_string_here"
JWT_REFRESH_SECRET="another_256_bit_random_string_here"
```

**شغّل Prisma Migration + Seed:**

```bash
npm run db:migrate
npm run db:seed
```

**شغّل Backend:**

```bash
npm run dev
```

Backend يشتغل على: `http://localhost:3001`  
Health check: `http://localhost:3001/health`

### 4️⃣ إعداد Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

**شغّل Frontend:**

```bash
npm run dev
```

Frontend يشتغل على: `http://localhost:3000`

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                # كل الـ tests
npm run test:coverage   # مع تقرير الـ coverage
```

---

## 📦 Production Build

### باستخدام Docker Compose

```bash
# انسخ الـ production env template
cp .env.prod.example .env.prod

# عدّل .env.prod وحط قيم حقيقية

# شغّل كل الخدمات في containers
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

الموقع يبقى متاح على `http://localhost` (Nginx reverse proxy).

---

## 📂 Project Structure

```
fa-arch-new/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database, Redis, Env validation
│   │   ├── middleware/        # Auth, RBAC, Rate limiting (Phase 1+)
│   │   ├── modules/           # Feature modules (Phase 1+)
│   │   └── shared/            # Errors, Types, Utils
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Initial data
│   └── tests/                 # Unit & integration tests
├── frontend/                   # Next.js 14 App
│   ├── app/
│   │   └── [locale]/          # i18n routing (ar/en)
│   ├── components/            # UI components (Phase 6+)
│   ├── lib/                   # API client, utils
│   └── messages/              # i18n translations
├── docs/                       # مستندات المشروع
├── nginx/                      # Nginx config للـ production
├── docker-compose.yml          # Development services
├── docker-compose.prod.yml     # Production full stack
└── README.md
```

---

## 🌍 Localization (i18n)

الموقع يدعم لغتين:
- العربية (`/ar`) — اللغة الافتراضية
- الإنجليزية (`/en`)

**إضافة ترجمات:**
1. عدّل `frontend/messages/ar.json`
2. عدّل `frontend/messages/en.json`
3. استخدم `useTranslations('key')` في الـ component

---

## 🔒 Default Admin Credentials

بعد الـ seed:
- **Email:** `admin@fa-arch.cu.edu.eg`
- **Password:** `Admin@123456`

⚠️ **يجب تغيير كلمة المرور فوراً في Production!**

---

## 📅 Development Phases

| Phase | الوصف | الحالة |
|-------|-------|--------|
| **Phase 0** | Project Setup | ✅ مكتمل |
| Phase 1 | Backend: Auth System | 🔜 قادم |
| Phase 2 | Backend: Core Data | 🔜 |
| Phase 3 | Backend: Academic System | 🔜 |
| Phase 4 | Backend: Content System | 🔜 |
| Phase 5 | Backend: Conferences & Search | 🔜 |
| Phase 6 | Frontend: Public Website | 🔜 |
| Phase 7 | Frontend: Dashboards | 🔜 |
| Phase 8 | Integration & Security | 🔜 |
| Phase 9 | Performance & SEO | 🔜 |
| Phase 10 | Deploy & Handover | 🔜 |

راجع [PHASES.md](./docs/PHASES.md) للتفاصيل الكاملة.

---

## 🤝 Contributing

هذا مشروع تعليمي تحت التطوير النشط. للمساهمة:
1. Fork المشروع
2. أنشئ branch من `develop`
3. Commit تغييراتك
4. Push وافتح Pull Request

---

## 📄 License

المشروع مفتوح المصدر للأغراض التعليمية.

**المحتوى:** حقوق النشر محفوظة لكلية الآثار — جامعة القاهرة.

---

Built with ❤️ for Faculty of Archaeology — Cairo University
