import { z } from "zod";

export const minimumReportsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  topRentedLimit: z.coerce.number().int().min(1).max(50).optional(),
  recurrentMinOrders: z.coerce.number().int().min(2).max(20).optional(),
  stockLimit: z.coerce.number().int().min(1).max(200).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
