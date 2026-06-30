import { Router } from 'express';
import { searchController } from './search.controller';
import { searchLimiter } from '../../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/search
 * محرك البحث المركزي — عام بدون مصادقة
 * Rate limited: 30 req / دقيقة (من SRS 4.3)
 *
 * Query params:
 *   q     — نص البحث (مطلوب، 2+ أحرف)
 *   type  — all | news | faculty | publication | course | library | conference
 *   lang  — ar | en  (default: ar)
 *   page  — رقم الصفحة
 *   limit — عدد النتائج (max 50)
 */
router.get('/', searchLimiter, searchController.search);

export default router;
