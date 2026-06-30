import { Router } from 'express';
import { libraryController } from './library.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { uploadExcel } from '../../middleware/upload';
import { UserRole } from '@prisma/client';

const router = Router();

const ADMIN_CM = [UserRole.admin, UserRole.content_manager];

/** GET /api/library — عام، فلترة: type / q / departmentId / publishYear */
router.get('/', libraryController.listBooks);

/** GET /api/library/:id — عام */
router.get('/:id', libraryController.getBook);

/**
 * POST /api/library/import
 * Phase 1 — Validate Excel فهرس المكتبة
 * ⚠️ قبل /:id عشان ما يتعارضش
 */
router.post('/import', auth, authorize(ADMIN_CM), uploadExcel.single('file'), libraryController.validateImport);

/**
 * POST /api/library/import/confirm
 * Phase 2 — تنفيذ الاستيراد
 */
router.post(
  '/import/confirm',
  auth,
  authorize(ADMIN_CM),
  auditLog('library_book'),
  uploadExcel.single('file'),
  libraryController.confirmImport,
);

/** POST /api/library — Admin / CM */
router.post('/', auth, authorize(ADMIN_CM), auditLog('library_book'), libraryController.createBook);

/** PUT /api/library/:id — Admin / CM */
router.put('/:id', auth, authorize(ADMIN_CM), auditLog('library_book'), libraryController.updateBook);

/** DELETE /api/library/:id — Admin */
router.delete('/:id', auth, authorize([UserRole.admin]), auditLog('library_book'), libraryController.deleteBook);

export default router;
