import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().trim().min(1, "Name cannot be empty").max(120, "Name is too long"),
});

export const updateUserSchema = z
  .object({
    email: z.string().email("Invalid email format").optional(),
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(120, "Name is too long")
      .optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: "At least one field is required",
  });

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id format"),
});

export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
