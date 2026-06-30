import { Router } from 'express';
import { studentServicesController } from './student-services.controller';
import { auth } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { auditLog } from '../../middleware/auditLog';
import { UserRole } from '@prisma/client';

const router = Router();
const CMS_ROLES = [UserRole.admin, UserRole.content_manager];

// ─── SERVICES ─────────────────────────────────────────────────────────────────

/** GET /api/student-services */
router.get('/', studentServicesController.listServices);

/** GET /api/student-services/:id */
router.get('/:id', studentServicesController.getService);

/** POST /api/student-services */
router.post('/', auth, authorize(CMS_ROLES), auditLog('student_services'), studentServicesController.createService);

/** PUT /api/student-services/:id */
router.put('/:id', auth, authorize(CMS_ROLES), auditLog('student_services'), studentServicesController.updateService);

/** DELETE /api/student-services/:id */
router.delete('/:id', auth, authorize(CMS_ROLES), auditLog('student_services'), studentServicesController.deleteService);

// ─── EVENTS ───────────────────────────────────────────────────────────────────

/** GET /api/student-services/events */
router.get('/events/list', studentServicesController.listEvents);

/** GET /api/student-services/events/:id */
router.get('/events/:id', studentServicesController.getEvent);

/** POST /api/student-services/events */
router.post('/events', auth, authorize(CMS_ROLES), auditLog('student_events'), studentServicesController.createEvent);

/** PUT /api/student-services/events/:id */
router.put('/events/:id', auth, authorize(CMS_ROLES), auditLog('student_events'), studentServicesController.updateEvent);

/** DELETE /api/student-services/events/:id */
router.delete('/events/:id', auth, authorize(CMS_ROLES), auditLog('student_events'), studentServicesController.deleteEvent);

/** PUT /api/student-services/events/:id/publish */
router.put('/events/:id/publish', auth, authorize(CMS_ROLES), auditLog('student_events'), studentServicesController.publishEvent);

/** PUT /api/student-services/events/:id/unpublish */
router.put('/events/:id/unpublish', auth, authorize(CMS_ROLES), auditLog('student_events'), studentServicesController.unpublishEvent);

export default router;
