import { Request, Response } from 'express';
import { studentServicesService } from './student-services.service';
import {
  createServiceSchema,
  updateServiceSchema,
  createEventSchema,
  updateEventSchema,
  listServicesQuerySchema,
  listEventsQuerySchema,
} from './student-services.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class StudentServicesController {
  // ─── SERVICES ─────────────────────────────────────────────────────────────

  listServices = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listServicesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await studentServicesService.listServices(parsed.data));
  });

  getService = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await studentServicesService.getServiceById(req.params.id));
  });

  createService = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createServiceSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await studentServicesService.createService(parsed.data), 'Service created');
  });

  updateService = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await studentServicesService.updateService(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteService = asyncHandler(async (req: Request, res: Response) => {
    await studentServicesService.deleteService(req.params.id);
    sendSuccess(res, null, 'Service deleted');
  });

  // ─── EVENTS ───────────────────────────────────────────────────────────────

  listEvents = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listEventsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await studentServicesService.listEvents(parsed.data));
  });

  getEvent = asyncHandler(async (req: Request, res: Response) => {
    const isPublicView = !req.user;
    sendSuccess(res, await studentServicesService.getEventById(req.params.id, isPublicView));
  });

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await studentServicesService.createEvent(parsed.data), 'Event created');
  });

  updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await studentServicesService.updateEvent(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    await studentServicesService.deleteEvent(req.params.id);
    sendSuccess(res, null, 'Event deleted');
  });

  publishEvent = asyncHandler(async (req: Request, res: Response) => {
    await studentServicesService.toggleEventPublish(req.params.id, true);
    sendSuccess(res, null, 'Event published');
  });

  unpublishEvent = asyncHandler(async (req: Request, res: Response) => {
    await studentServicesService.toggleEventPublish(req.params.id, false);
    sendSuccess(res, null, 'Event unpublished');
  });
}

export const studentServicesController = new StudentServicesController();
