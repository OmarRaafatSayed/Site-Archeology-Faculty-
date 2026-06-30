import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { env } from '../config/env';

/**
 * تعريف الـ MIME types المسموح بها لكل نوع رفع
 */
const ALLOWED_MIME: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  document: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  material: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
};

/**
 * توليد اسم فريد للملف عشان نمنع التعارض
 * صيغة: {timestamp}-{random16chars}.{ext}
 */
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${random}${ext}`;
}

/**
 * Storage factory — يحدد مجلد الرفع بناءً على النوع
 */
function createStorage(subDir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(env.UPLOAD_PATH, subDir));
    },
    filename: (_req, file, cb) => {
      cb(null, generateFileName(file.originalname));
    },
  });
}

/**
 * Filter factory — يسمح فقط بالـ MIME types المحددة
 */
function createFileFilter(allowedTypes: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Accepted: ${allowedTypes.join(', ')}`));
    }
  };
}

// ─── Multer instances ─────────────────────────────────────────────────────────

/** رفع صور أعضاء التدريس */
export const uploadPhoto = multer({
  storage: createStorage('photos'),
  fileFilter: createFileFilter(ALLOWED_MIME.image),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/** رفع مواد المقررات (PDF/PPT/DOC + صور) */
export const uploadMaterial = multer({
  storage: createStorage('materials'),
  fileFilter: createFileFilter(ALLOWED_MIME.material),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/** رفع ملفات Excel للاستيراد (مؤقتة) */
export const uploadExcel = multer({
  storage: createStorage('temp'),
  fileFilter: createFileFilter(ALLOWED_MIME.excel),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/** رفع ملفات PDF للاستخراج */
export const uploadPdf = multer({
  storage: createStorage('temp'),
  fileFilter: createFileFilter(['application/pdf']),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

/** رفع أبحاث المنشورات (PDF فقط) */
export const uploadPublication = multer({
  storage: createStorage('publications'),
  fileFilter: createFileFilter(['application/pdf']),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
