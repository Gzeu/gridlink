import { z } from 'zod';

// Google Sheets validation
export const SheetUrlSchema = z.object({
  sheetUrl: z.string()
    .url('Invalid URL format')
    .regex(
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/,
      'Invalid Google Sheets URL format'
    ),
});

export const SheetPostSchema = z.object({
  sheetUrl: z.string()
    .url('Invalid URL format')
    .regex(
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/,
      'Invalid Google Sheets URL format'
    ),
  values: z.array(z.string()).min(1, 'Values array cannot be empty'),
  egldAddress: z.string()
    .regex(/^erd1[a-z0-9]{58}$/, 'Invalid EGLD address format')
    .optional(),
});

// Payment validation
export const PaymentSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,18})?$/, 'Invalid amount format')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  recipientAddress: z.string()
    .regex(/^erd1[a-z0-9]{58}$/, 'Invalid recipient EGLD address'),
  egldAddress: z.string()
    .regex(/^erd1[a-z0-9]{58}$/, 'Invalid sender EGLD address'),
  description: z.string().max(200, 'Description too long').optional(),
});

// Dashboard query validation
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// Error response helper
export function formatZodError(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// Success response helper
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    message,
    data,
  };
}

// Error response helper
export function errorResponse(message: string, statusCode: number = 400) {
  return {
    success: false,
    error: message,
    statusCode,
  };
}
