import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Middleware: Audit Log
 * يُسجَّل تلقائياً على كل Write operations (POST / PUT / DELETE)
 * يُوضع بعد الـ auth middleware حتى يعرف من فعل العملية
 *
 * @param entityType - نوع الـ entity (faculty / student / news / ...)
 *
 * @example
 * router.post('/faculty', auth, authorize(['admin']), auditLog('faculty'), controller.create);
 */
export function auditLog(entityType: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // نعمل patch على res.json عشان نلتقط الـ response بعد تنفيذ الـ controller
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // بس نسجل لو العملية نجحت (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const req = _req;
        const method = req.method.toUpperCase();
        const action = method === 'POST' ? 'CREATE' : method === 'PUT' || method === 'PATCH' ? 'UPDATE' : 'DELETE';

        // استخراج الـ entityId من الـ params أو الـ response body
        const entityId = req.params?.id || (body as Record<string, unknown>)?.id as string | undefined || undefined;

        // نسجل بشكل async بدون ما نعطّل الـ response
        setImmediate(async () => {
          try {
            await prisma.auditLog.create({
              data: {
                userId: req.user?.userId ?? null,
                action,
                entityType,
                entityId: entityId ?? null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newData: action !== 'DELETE' ? (req.body as any) : undefined,
                ipAddress: (req.ip ?? req.socket?.remoteAddress ?? null) as string | null,
              },
            });
          } catch {
            // Audit log failure should never break the main flow
          }
        });
      }

      return originalJson(body);
    };

    next();
  };
}
