import { CustomOrderStatus, FabricPriceMode, MeasurementGarmentType } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const queryDateSchema = z.string().datetime({ offset: true }).transform((value) => new Date(value));

export const customOrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listCustomOrdersQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(CustomOrderStatus).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  requiresMeasurement: queryBooleanSchema.optional(),
  firstPurchaseFlow: queryBooleanSchema.optional(),
  createdFrom: queryDateSchema.optional(),
  createdTo: queryDateSchema.optional(),
  promisedFrom: queryDateSchema.optional(),
  promisedTo: queryDateSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.enum(["createdAt", "promisedDeliveryAt", "total"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const createCustomOrderSelectionSchema = z
  .object({
    definitionId: z.number().int().positive(),
    optionId: z.number().int().positive().optional(),
    valueText: z.string().trim().max(500).optional(),
    valueNumber: z.number().optional(),
    valueBoolean: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.optionId !== undefined ||
      data.valueText !== undefined ||
      data.valueNumber !== undefined ||
      data.valueBoolean !== undefined,
    "Selection requires optionId or a value"
  );

const createCustomOrderPartSchema = z.object({
  productId: z.number().int().positive().optional(),
  garmentType: z.nativeEnum(MeasurementGarmentType),
  label: z.string().trim().min(1).max(120),
  workMode: z.nativeEnum(FabricPriceMode).optional(),
  measurementProfileId: z.number().int().positive().optional(),
  measurementProfileGarmentId: z.number().int().positive().optional(),
  fabricId: z.number().int().positive().optional(),
  unitPrice: z.number().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
  selections: z.array(createCustomOrderSelectionSchema).optional(),
});

const createCustomOrderItemSchema = z.object({
  productId: z.number().int().positive().optional(),
  itemNameSnapshot: z.string().trim().min(1).max(200).optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
  parts: z.array(createCustomOrderPartSchema).min(1),
});

export const createCustomOrderSchema = z.object({
  customerId: z.number().int().positive(),
  firstPurchaseFlow: z.boolean().optional(),
  requestedDeliveryAt: z.coerce.date().optional(),
  promisedDeliveryAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  items: z.array(createCustomOrderItemSchema).min(1),
});

export const customOrderActionSchema = z.object({
  action: z.enum([
    "CONFIRM_RESERVATION",
    "MARK_MEASUREMENTS_TAKEN",
    "START_CONFECTION",
    "START_FITTING",
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
