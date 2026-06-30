import { Request, Response } from 'express';
import { qualityService } from './quality.service';
import {
  createBoardMemberSchema,
  updateBoardMemberSchema,
  createDocumentSchema,
  updateDocumentSchema,
  listBoardMembersQuerySchema,
  listDocumentsQuerySchema,
} from './quality.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class QualityController {
  // ─── BOARD MEMBERS ────────────────────────────────────────────────────────

  listBoardMembers = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listBoardMembersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await qualityService.listBoardMembers(parsed.data));
  });

  getBoardMember = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await qualityService.getBoardMemberById(req.params.id));
  });

  createBoardMember = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createBoardMemberSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await qualityService.createBoardMember(parsed.data), 'Board member created');
  });

  updateBoardMember = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateBoardMemberSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await qualityService.updateBoardMember(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteBoardMember = asyncHandler(async (req: Request, res: Response) => {
    await qualityService.deleteBoardMember(req.params.id);
    sendSuccess(res, null, 'Board member deleted');
  });

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await qualityService.listDocuments(parsed.data));
  });

  getDocument = asyncHandler(async (req: Request, res: Response) => {
    const isPublicView = !req.user;
    sendSuccess(res, await qualityService.getDocumentById(req.params.id, isPublicView));
  });

  createDocument = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await qualityService.createDocument(parsed.data), 'Document created');
  });

  updateDocument = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateDocumentSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await qualityService.updateDocument(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    await qualityService.deleteDocument(req.params.id);
    sendSuccess(res, null, 'Document deleted');
  });

  publishDocument = asyncHandler(async (req: Request, res: Response) => {
    await qualityService.toggleDocumentPublish(req.params.id, true);
    sendSuccess(res, null, 'Document published');
  });

  unpublishDocument = asyncHandler(async (req: Request, res: Response) => {
    await qualityService.toggleDocumentPublish(req.params.id, false);
    sendSuccess(res, null, 'Document unpublished');
  });
}

export const qualityController = new QualityController();
