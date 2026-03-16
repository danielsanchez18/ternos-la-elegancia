import { z } from "zod";

export const customerIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCustomerSchema = z.object({
  nombres: z.string().trim().min(1).max(120),
  apellidos: z.string().trim().min(1).max(120),
  email: z.string().email(),
  celular: z.string().trim().min(6).max(20).optional(),
  dni: z.string().trim().min(8).max(20),
  password: z.string().min(8).max(72),
});

export const updateCustomerSchema = z
  .object({
    nombres: z.string().trim().min(1).max(120).optional(),
    apellidos: z.string().trim().min(1).max(120).optional(),
    email: z.string().email().optional(),
    celular: z.union([z.string().trim().min(6).max(20), z.null()]).optional(),
    dni: z.string().trim().min(8).max(20).optional(),
    password: z.string().min(8).max(72).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
