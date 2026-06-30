import { Request, Response } from 'express';
import { excavationsService } from './excavations.service';
import {
  createSiteSchema,
  updateSiteSchema,
  createSeasonSchema,
  updateSeasonSchema,
  createFindingSchema,
  updateFindingSchema,
  createGalleryImageSchema,
  updateGalleryImageSchema,
  listSitesQuerySchema,
  listSeasonsQuerySchema,
  listFindingsQuerySchema,
  listGalleryQuerySchema,
} from './excavations.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class ExcavationsController {
  // ─── SITES ────────────────────────────────────────────────────────────────

  listSites = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listSitesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await excavationsService.listSites(parsed.data));
  });

  getSite = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await excavationsService.getSiteBySlug(req.params.slug));
  });

  getSiteById = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await excavationsService.getSiteById(req.params.id));
  });

  createSite = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createSiteSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await excavationsService.createSite(parsed.data), 'Excavation site created');
  });

  updateSite = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateSiteSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await excavationsService.updateSite(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteSite = asyncHandler(async (req: Request, res: Response) => {
    await excavationsService.deleteSite(req.params.id);
    sendSuccess(res, null, 'Excavation site deleted');
  });

  // ─── SEASONS ──────────────────────────────────────────────────────────────

  listSeasons = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listSeasonsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await excavationsService.listSeasons(parsed.data));
  });

  getSeason = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await excavationsService.getSeasonById(req.params.id));
  });

  createSeason = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createSeasonSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await excavationsService.createSeason(parsed.data), 'Season created');
  });

  updateSeason = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateSeasonSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await excavationsService.updateSeason(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteSeason = asyncHandler(async (req: Request, res: Response) => {
    await excavationsService.deleteSeason(req.params.id);
    sendSuccess(res, null, 'Season deleted');
  });

  // ─── FINDINGS ─────────────────────────────────────────────────────────────

  listFindings = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listFindingsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await excavationsService.listFindings(parsed.data));
  });

  getFinding = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await excavationsService.getFindingById(req.params.id));
  });

  createFinding = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createFindingSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await excavationsService.createFinding(parsed.data), 'Finding created');
  });

  updateFinding = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateFindingSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await excavationsService.updateFinding(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteFinding = asyncHandler(async (req: Request, res: Response) => {
    await excavationsService.deleteFinding(req.params.id);
    sendSuccess(res, null, 'Finding deleted');
  });

  // ─── GALLERY ──────────────────────────────────────────────────────────────

  listGallery = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listGalleryQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await excavationsService.listGalleryImages(parsed.data));
  });

  getGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await excavationsService.getGalleryImageById(req.params.id));
  });

  createGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createGalleryImageSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await excavationsService.createGalleryImage(parsed.data), 'Gallery image added');
  });

  updateGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateGalleryImageSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await excavationsService.updateGalleryImage(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    await excavationsService.deleteGalleryImage(req.params.id);
    sendSuccess(res, null, 'Gallery image deleted');
  });
}

export const excavationsController = new ExcavationsController();
