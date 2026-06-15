import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/** إرسال response ناجح */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(body);
}

/** إرسال response بعد إنشاء resource جديد */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

/** إرسال response خطأ */
export function sendError(res: Response, message: string, statusCode = 500): Response {
  const body: ApiResponse = { success: false, error: message };
  return res.status(statusCode).json(body);
}

/** إرسال response مع pagination */
export function sendPaginated<T>(
  res: Response,
  result: PaginatedResponse<T>,
  message?: string,
): Response {
  const body: ApiResponse<PaginatedResponse<T>> = { success: true, data: result, message };
  return res.status(200).json(body);
}
