import { Router } from 'express';
import { excavationsController } from './excavations.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

// ─── SITES ────────────────────────────────────────────────────────────────────

/** GET /api/excavations/sites */
router.get('/sites', excavationsController.listSites);

/** GET /api/excavations/sites/slug/:slug */
router.get('/sites/slug/:slug', excavationsController.getSite);

/** GET /api/excavations/sites/:id */
router.get('/sites/:id', excavationsController.getSiteById);

/** POST /api/excavations/sites */
router.post('/sites', auth, authorize(CMS_ROLES), auditLog('excavation_sites'), excavationsController.createSite);

/** PUT /api/excavations/sites/:id */
router.put('/sites/:id', auth, authorize(CMS_ROLES), auditLog('excavation_sites'), excavationsController.updateSite);

/** DELETE /api/excavations/sites/:id */
router.delete('/sites/:id', auth, authorize(CMS_ROLES), auditLog('excavation_sites'), excavationsController.deleteSite);

// ─── SEASONS ──────────────────────────────────────────────────────────────────

/** GET /api/excavations/seasons */
router.get('/seasons', excavationsController.listSeasons);

/** GET /api/excavations/seasons/:id */
router.get('/seasons/:id', excavationsController.getSeason);

/** POST /api/excavations/seasons */
router.post('/seasons', auth, authorize(CMS_ROLES), auditLog('excavation_seasons'), excavationsController.createSeason);

/** PUT /api/excavations/seasons/:id */
router.put('/seasons/:id', auth, authorize(CMS_ROLES), auditLog('excavation_seasons'), excavationsController.updateSeason);

/** DELETE /api/excavations/seasons/:id */
router.delete('/seasons/:id', auth, authorize(CMS_ROLES), auditLog('excavation_seasons'), excavationsController.deleteSeason);

// ─── FINDINGS ─────────────────────────────────────────────────────────────────

/** GET /api/excavations/findings */
router.get('/findings', excavationsController.listFindings);

/** GET /api/excavations/findings/:id */
router.get('/findings/:id', excavationsController.getFinding);

/** POST /api/excavations/findings */
router.post('/findings', auth, authorize(CMS_ROLES), auditLog('excavation_findings'), excavationsController.createFinding);

/** PUT /api/excavations/findings/:id */
router.put('/findings/:id', auth, authorize(CMS_ROLES), auditLog('excavation_findings'), excavationsController.updateFinding);

/** DELETE /api/excavations/findings/:id */
router.delete('/findings/:id', auth, authorize(CMS_ROLES), auditLog('excavation_findings'), excavationsController.deleteFinding);

// ─── GALLERY ──────────────────────────────────────────────────────────────────

/** GET /api/excavations/gallery */
router.get('/gallery', excavationsController.listGallery);

/** GET /api/excavations/gallery/:id */
router.get('/gallery/:id', excavationsController.getGalleryImage);

/** POST /api/excavations/gallery */
router.post('/gallery', auth, authorize(CMS_ROLES), auditLog('excavation_gallery'), excavationsController.createGalleryImage);

/** PUT /api/excavations/gallery/:id */
router.put('/gallery/:id', auth, authorize(CMS_ROLES), auditLog('excavation_gallery'), excavationsController.updateGalleryImage);

/** DELETE /api/excavations/gallery/:id */
router.delete('/gallery/:id', auth, authorize(CMS_ROLES), auditLog('excavation_gallery'), excavationsController.deleteGalleryImage);

export default router;
