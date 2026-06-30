import { z } from 'zod';
import { AgreementType } from '@prisma/client';

export const createAgreementSchema = z.object({
  titleAr: z.string().min(5).max(500),
  titleEn: z.string().min(5).max(500).optional(),
  partnerNameAr: z.string().min(3).max(500),
  partnerNameEn: z.string().min(3).max(500).optional(),
  country: z.string().max(100).optional().nullable(),
  agreementType: z.nativeEnum(AgreementType),
  signDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  documentUrl: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;

export const updateAgreementSchema = createAgreementSchema.partial();
export type UpdateAgreementInput = z.infer<typeof updateAgreementSchema>;

export const listAgreementsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z.nativeEnum(AgreementType).optional(),
  country: z.string().optional(),
  isActive: z.string().optional().transform((v) => v === 'false' ? false : true),
});

export type ListAgreementsQuery = z.infer<typeof listAgreementsQuerySchema>;
