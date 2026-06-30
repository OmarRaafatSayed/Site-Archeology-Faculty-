import { Request, Response } from 'express';
import { conferencesService } from './conferences.service';
import {
  createConferenceSchema,
  updateConferenceSchema,
  listConferencesQuerySchema,
  registerConferenceSchema,
  updateRegistrationSchema,
  listRegistrationsQuerySchema,
} from './conferences.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class ConferencesController {

  /** GET /api/conferences */
  listConferences = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listConferencesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await conferencesService.listConferences(parsed.data));
  });

  /** GET /api/conferences/:slug */
  getConference = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await conferencesService.getConferenceBySlug(req.params.slug));
  });

  /** POST /api/conferences (Admin) */
  createConference = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createConferenceSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(
      res,
      await conferencesService.createConference(parsed.data),
      'Conference created with pages',
    );
  });

  /** PUT /api/conferences/:id (Admin) */
  updateConference = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateConferenceSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(
      res,
      await conferencesService.updateConference(req.params.id, parsed.data),
      'Conference updated',
    );
  });

  /** POST /api/conferences/:id/register (Public) */
  register = asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerConferenceSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(
      res,
      await conferencesService.registerForConference(req.params.id, parsed.data),
      'Registration submitted successfully',
    );
  });

  /** GET /api/conferences/:id/registrations (Admin) */
  listRegistrations = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listRegistrationsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(
      res,
      await conferencesService.getConferenceRegistrations(req.params.id, parsed.data),
    );
  });

  /** PUT /api/conferences/:id/registrations/:regId (Admin) */
  updateRegistration = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateRegistrationSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(
      res,
      await conferencesService.updateRegistrationStatus(req.params.id, req.params.regId, parsed.data),
      'Registration status updated',
    );
  });
}

export const conferencesController = new ConferencesController();
