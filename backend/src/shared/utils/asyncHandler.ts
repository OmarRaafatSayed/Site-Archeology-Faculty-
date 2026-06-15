import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper لـ async route handlers عشان يلتقط الـ errors تلقائياً
 * بدل ما تكتب try/catch في كل controller
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
