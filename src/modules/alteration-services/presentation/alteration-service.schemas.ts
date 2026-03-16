import { z } from "zod";

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const alterationServiceIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listAlterationServicesQuerySchema = z.object({
  active: queryBooleanSchema.optional(),
});

export const createAlterationServiceSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  precioBase: z.number().min(0).optional(),
  activo: z.boolean().optional(),
});

export const updateAlterationServiceSchema = z
  .object({
    nombre: z.string().trim().min(1).max(150).optional(),
    precioBase: z.union([z.number().min(0), z.null()]).optional(),
    activo: z.boolean().optional(),
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
