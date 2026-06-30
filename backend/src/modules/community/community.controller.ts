import { Request, Response } from 'express';
import { communityService } from './community.service';
import { createProjectSchema, updateProjectSchema, listProjectsQuerySchema } from './community.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';

export class CommunityController {
  listProjects = asyncHandler(async (req: Request, res: Response) => {
    const parsed = listProjectsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendPaginated(res, await communityService.listProjects(parsed.data));
  });

  getProject = asyncHandler(async (req: Request, res: Response) => {
    const isPublicView = !req.user;
    sendSuccess(res, await communityService.getProjectById(req.params.id, isPublicView));
  });

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendCreated(res, await communityService.createProject(parsed.data), 'Project created');
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
    sendSuccess(res, await communityService.updateProject(req.params.id, parsed.data), 'Updated successfully');
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await communityService.deleteProject(req.params.id);
    sendSuccess(res, null, 'Project deleted');
  });

  publishProject = asyncHandler(async (req: Request, res: Response) => {
    await communityService.togglePublish(req.params.id, true);
    sendSuccess(res, null, 'Project published');
  });

  unpublishProject = asyncHandler(async (req: Request, res: Response) => {
    await communityService.togglePublish(req.params.id, false);
    sendSuccess(res, null, 'Project unpublished');
  });
}

export const communityController = new CommunityController();
