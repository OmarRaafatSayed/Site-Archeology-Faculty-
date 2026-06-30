import { Router } from 'express';
import { newsController } from './news.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();

const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

/** GET /api/news  — عام، فلترة: page / category / search / published / lang */
router.get('/', newsController.listNews);

/** GET /api/news/:id — عام (الزوار يرون المنشور فقط) */
router.get('/:id', newsController.getNews);

/** POST /api/news — Content Manager+ */
router.post('/', auth, authorize(CMS_ROLES), auditLog('news'), newsController.createNews);

/** PUT /api/news/:id — Content Manager+ (صاحب الخبر أو Admin) */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('news'), newsController.updateNews);

/** DELETE /api/news/:id — Content Manager+ */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('news'), newsController.deleteNews);

/** PUT /api/news/:id/publish — نشر */
router.put('/:id/publish', auth, authorize(CMS_ROLES), auditLog('news'), newsController.publishNews);

/** PUT /api/news/:id/unpublish — إلغاء النشر */
router.put('/:id/unpublish', auth, authorize(CMS_ROLES), auditLog('news'), newsController.unpublishNews);

export default router;
