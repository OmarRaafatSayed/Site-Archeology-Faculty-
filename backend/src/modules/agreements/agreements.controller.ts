import { Request, Response } from 'express';
import { agreementsService } from './agreements.service';
import { createAgreementSchema, updateAgreementSchema, listAgreementsQuerySchema } from './agreements.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class AgreementsController {
  listAgreements = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listAgreementsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await agreementsService.listAgreements(parsed.data));
  });

  getAgreement = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await agreementsService.getAgreementById(req.params.id));
  });

  createAgreement = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAgreementSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await agreementsService.createAgreement(parsed.data), 'Agreement created');
  });

  updateAgreement = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateAgreementSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await agreementsService.updateAgreement(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteAgreement = asyncHandler(async (req: Request, res: Response) => {
    await agreementsService.deleteAgreement(req.params.id);
    sendSuccess(res, null, 'Agreement deleted');
  });
}

export const agreementsController = new AgreementsController();
