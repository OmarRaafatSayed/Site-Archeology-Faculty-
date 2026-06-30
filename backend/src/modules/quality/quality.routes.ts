import { Router } from 'express';
import { qualityController } from './quality.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

// ─── BOARD MEMBERS ────────────────────────────────────────────────────────────

/** GET /api/quality/members */
router.get('/members', qualityController.listBoardMembers);

/** GET /api/quality/members/:id */
router.get('/members/:id', qualityController.getBoardMember);

/** POST /api/quality/members */
router.post('/members', auth, authorize(CMS_ROLES), auditLog('quality_board_members'), qualityController.createBoardMember);

/** PUT /api/quality/members/:id */
router.put('/members/:id', auth, authorize(CMS_ROLES), auditLog('quality_board_members'), qualityController.updateBoardMember);

/** DELETE /api/quality/members/:id */
router.delete('/members/:id', auth, authorize(CMS_ROLES), auditLog('quality_board_members'), qualityController.deleteBoardMember);

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

/** GET /api/quality/documents */
router.get('/documents', qualityController.listDocuments);

/** GET /api/quality/documents/:id */
router.get('/documents/:id', qualityController.getDocument);

/** POST /api/quality/documents */
router.post('/documents', auth, authorize(CMS_ROLES), auditLog('quality_documents'), qualityController.createDocument);

/** PUT /api/quality/documents/:id */
router.put('/documents/:id', auth, authorize(CMS_ROLES), auditLog('quality_documents'), qualityController.updateDocument);

/** DELETE /api/quality/documents/:id */
router.delete('/documents/:id', auth, authorize(CMS_ROLES), auditLog('quality_documents'), qualityController.deleteDocument);

/** PUT /api/quality/documents/:id/publish */
router.put('/documents/:id/publish', auth, authorize(CMS_ROLES), auditLog('quality_documents'), qualityController.publishDocument);

/** PUT /api/quality/documents/:id/unpublish */
router.put('/documents/:id/unpublish', auth, authorize(CMS_ROLES), auditLog('quality_documents'), qualityController.unpublishDocument);

export default router;
