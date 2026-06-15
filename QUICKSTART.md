# ⚡ Quick Start Guide

دليل سريع لتشغيل المشروع محلياً.

---

## 1️⃣ شغّل PostgreSQL و Redis

```bash
docker compose up -d
```

✅ PostgreSQL: `localhost:5432`  
✅ Redis: `localhost:6379`  
✅ pgAdmin (اختياري): `http://localhost:5050`

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**عدّل `.env` وحط JWT secrets:**

```bash
# على Windows
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# على Linux/Mac
openssl rand -hex 32
```

انسخ الناتج في `.env`:
```env
JWT_ACCESS_SECRET="الناتج_هنا"
JWT_REFRESH_SECRET="ناتج_تاني_هنا"
```

**شغّل Migration + Seed:**

```bash
npm run db:migrate
npm run db:seed
```

**شغّل Backend:**

```bash
npm run dev
```

✅ Backend: `http://localhost:3001/health`

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend: `http://localhost:3000`

---

## 🎉 تم!

- **الصفحة الرئيسية:** http://localhost:3000
- **API Health Check:** http://localhost:3001/health
- **pgAdmin:** http://localhost:5050 (user: admin@fa-arch.local / pass: admin)

---

## 🔑 Default Admin

- Email: `admin@fa-arch.cu.edu.eg`
- Password: `Admin@123456`

---

## 🛑 إيقاف كل حاجة

```bash
# إيقاف Backend و Frontend (Ctrl+C في كل terminal)

# إيقاف Docker
docker compose down

# إيقاف + مسح البيانات (⚠️ احذر!)
docker compose down -v
```

---

## 🐛 مشاكل شائعة

**PostgreSQL ما بيشتغلش:**
```bash
docker compose down
docker compose up -d postgres
```

**Prisma ما بيلاقيش الـ DB:**
```bash
cd backend
npm run db:generate
npm run db:migrate
```

**Redis connection failed:**
```bash
docker compose restart redis
```

---

راجع [README.md](./README.md) للتفاصيل الكاملة.
