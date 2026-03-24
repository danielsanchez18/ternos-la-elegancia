import { AlterationOrderStatus } from "@prisma/client";
import { z } from "zod";

export const alterationOrderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAlterationOrdersQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: z.nativeEnum(AlterationOrderStatus).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  receivedFrom: z.coerce.date().optional(),
  receivedTo: z.coerce.date().optional(),
  promisedFrom: z.coerce.date().optional(),
  promisedTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.enum(["createdAt", "receivedAt", "promisedAt", "total"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const createAlterationOrderSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  garmentDescription: z.string().trim().min(1).max(500),
  workDescription: z.string().trim().min(1).max(2000),
  initialCondition: z.string().trim().max(1000).optional(),
  receivedAt: z.coerce.date().optional(),
  promisedAt: z.coerce.date().optional(),
  subtotal: z.number().min(0).optional(),
  discountTotal: z.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const alterationOrderActionSchema = z.object({
  action: z.enum([
    "START_EVALUATION",
    "START_WORK",
    "MARK_READY",
    "MARK_DELIVERED",
    "CANCEL",
  ]),
  note: z.string().trim().max(1000).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
