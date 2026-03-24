import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const noteIdParamSchema = z.object({
  noteId: z.string().uuid(),
});

export const fileIdParamSchema = z.object({
  fileId: z.string().uuid(),
});

export const createCustomerNoteSchema = z.object({
  note: z.string().trim().min(1).max(4000),
  adminUserId: z.string().uuid().nullable().optional(),
});

export const updateCustomerNoteSchema = z
  .object({
    note: z.string().trim().min(1).max(4000).optional(),
    adminUserId: z.string().uuid().nullable().optional(),
  })
  .refine((value) => value.note !== undefined || value.adminUserId !== undefined, {
    message: "At least one field is required",
  });

export const createCustomerFileSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().trim().url().max(2048),
  mimeType: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).max(1000).optional(),
});

export const updateCustomerFileSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255).optional(),
    fileUrl: z.string().trim().url().max(2048).optional(),
    mimeType: z.string().trim().min(1).max(255).nullable().optional(),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
  })
  .refine(
    (value) =>
      value.fileName !== undefined ||
      value.fileUrl !== undefined ||
      value.mimeType !== undefined ||
      value.description !== undefined,
    {
      message: "At least one field is required",
    }
  );

export const formatZodIssues = (issues: z.ZodIssue[]): string =>
  issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ");
