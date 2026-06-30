# دليل التسليم — كلية الآثار جامعة القاهرة
## Handover Document — Phase 10

**الإصدار:** 1.0  
**التاريخ:** يونيو 2026  
**المطوّر:** [اسم الفريق]  
**المُسلَّم إليه:** كلية الآثار — جامعة القاهرة

---

## 1. نظرة عامة على المشروع

الموقع الرسمي لكلية الآثار بجامعة القاهرة — إعادة بناء كاملة. يتضمن:

| المكوّن | التقنية | الوصف |
|---------|---------|-------|
| Backend API | Node.js 20 + Express + TypeScript | جميع الـ APIs |
| قاعدة البيانات | PostgreSQL 16 + Prisma ORM | جميع البيانات |
| التخزين المؤقت | Redis 7 | Cache + JWT Blacklist |
| Frontend | Next.js 14 + React 18 + Tailwind | الواجهة AR/EN |
| الخادم العكسي | Nginx + SSL | HTTPS + Rate Limiting |
| الـ CI/CD | GitHub Actions | Test → Build → Deploy |

---

## 2. بيانات الاعتماد — Credentials

> ⚠️ **هذا القسم يجب تعبئته بعد الـ seed وتسليمه بشكل مشفر (لا يُرسَل بـ email عادي)**

### 2.1 Admin Dashboard

| الحقل | القيمة |
|-------|--------|
| URL | https://fa-arch.cu.edu.eg/ar/admin/dashboard |
| Email | admin@fa-arch.cu.edu.eg |
| Password | **[يُعبَّأ بعد أول تسجيل دخول وتغيير كلمة المرور]** |

### 2.2 Content Manager

| الحقل | القيمة |
|-------|--------|
| Email | content@fa-arch.cu.edu.eg |
| Password | **[يُعبَّأ بعد تغيير كلمة المرور]** |

### 2.3 Server Access

| الحقل | القيمة |
|-------|--------|
| Server IP | **[يُضاف هنا]** |
| SSH User | **[يُضاف هنا]** |
| SSH Key | **[يُسلَّم بشكل منفصل]** |
| SSH Port | 22 |

### 2.4 Domain & DNS

| السجل | القيمة |
|-------|--------|
| Domain | fa-arch.cu.edu.eg |
| DNS Provider | **[يُضاف هنا]** |
| A Record | **[Server IP]** |

### 2.5 GitHub Repository

| الحقل | القيمة |
|-------|--------|
| Repository | https://github.com/OmarRaafatSayed/Site-Archeology-Faculty- |
| Main Branch | `main` |
| GitHub Secrets | JWT secrets + Server SSH key + Host IP |

---

## 3. إدارة السيرفر

### 3.1 تشغيل / إيقاف الخدمات

```bash
# الانتقال لمجلد المشروع
cd /var/www/fa-arch-new

# تشغيل كل الخدمات
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# إيقاف كل الخدمات
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# إعادة تشغيل خدمة واحدة (مثال: backend)
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend

# عرض حالة الخدمات
docker compose -f docker-compose.prod.yml ps
```

### 3.2 مشاهدة الـ Logs

```bash
# Backend logs
docker logs fa_arch_backend_prod -f --tail=100

# Frontend logs
docker logs fa_arch_frontend_prod -f --tail=100

# Nginx logs
docker logs fa_arch_nginx_prod -f --tail=100

# كل الخدمات معاً
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

### 3.3 Health Check

```bash
bash /opt/fa-arch/scripts/healthcheck.sh
```

### 3.4 النسخ الاحتياطي اليدوي

```bash
# نسخة احتياطية فورية
bash /opt/fa-arch/scripts/backup.sh

# عرض النسخ المتاحة
ls -lh /var/backups/fa-arch/

# استعادة من نسخة احتياطية
gunzip -c /var/backups/fa-arch/fa_arch_YYYYMMDD_HHMMSS.sql.gz \
  | docker exec -i fa_arch_postgres_prod psql -U fa_arch_user fa_arch_db
```

---

## 4. تحديث الموقع

### 4.1 النشر التلقائي (Staging)
أي push لـ `main` branch يُنشَّر تلقائياً على Staging عبر GitHub Actions.

### 4.2 النشر على Production (يدوي)
1. اذهب إلى: GitHub → Actions → "Deploy — Production"
2. اضغط "Run workflow"
3. أدخل رقم الإصدار والكلمة `DEPLOY`
4. وافق على الـ approval request
5. راقب الـ logs

---

## 5. تجديد SSL Certificate

شهادة SSL تتجدد تلقائياً بـ cron job (مرتين يومياً).
للتجديد اليدوي:

```bash
certbot renew --force-renewal
docker exec fa_arch_nginx_prod nginx -s reload
```

---

## 6. إضافة مستخدم جديد

```bash
# الدخول على لوحة التحكم Admin
# Admin Dashboard → المستخدمون → إضافة مستخدم جديد
# حدد الدور: admin / content_manager / faculty / student
```

أو من الـ API:
```bash
curl -X POST https://fa-arch.cu.edu.eg/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@cu.edu.eg","role":"content_manager","password":"Temp@12345"}'
```

---

## 7. حل المشاكل الشائعة

| المشكلة | الحل |
|---------|------|
| الموقع لا يفتح | `bash /opt/fa-arch/scripts/healthcheck.sh` |
| خطأ 502 | `docker compose restart backend` |
| قاعدة البيانات بطيئة | راجع `performance_indexes.sql` |
| رسائل البريد لا تُرسَل | تحقق من `SMTP_*` في `.env.prod` |
| انتهت مساحة الديسك | `find /var/backups/fa-arch -mtime +30 -delete` |
| SSL منتهي الصلاحية | `certbot renew --force-renewal` |

---

## 8. ملفات مهمة على السيرفر

| المسار | الوصف |
|--------|-------|
| `/var/www/fa-arch-new/` | الكود المصدري |
| `/var/www/fa-arch-new/.env.prod` | بيانات الاعتماد (محمي 600) |
| `/var/www/fa-arch-new/nginx/ssl/` | شهادات SSL |
| `/var/backups/fa-arch/` | النسخ الاحتياطية |
| `/opt/fa-arch/scripts/` | السكريبتات |
| `/var/log/fa-arch/` | Logs |

---

## 9. جهات الاتصال للدعم التقني

| الدور | الاسم | البريد |
|-------|-------|--------|
| المطوّر الرئيسي | [اسم المطور] | [البريد] |
| المشرف التقني | [اسم المشرف] | [البريد] |

---

*تاريخ التسليم: يونيو 2026*
