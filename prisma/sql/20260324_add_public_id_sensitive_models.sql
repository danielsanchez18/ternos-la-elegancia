CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "AdminUser" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "AdminUser" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "AdminUser" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_publicId_key" ON "AdminUser" ("publicId");

ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "Customer" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "Customer" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Customer" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_publicId_key" ON "Customer" ("publicId");

ALTER TABLE "CustomerFile" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "CustomerFile" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "CustomerFile" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "CustomerFile" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerFile_publicId_key" ON "CustomerFile" ("publicId");

ALTER TABLE "MeasurementProfile" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "MeasurementProfile" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "MeasurementProfile" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "MeasurementProfile" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "MeasurementProfile_publicId_key" ON "MeasurementProfile" ("publicId");

ALTER TABLE "SaleOrder" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "SaleOrder" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "SaleOrder" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "SaleOrder" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "SaleOrder_publicId_key" ON "SaleOrder" ("publicId");

ALTER TABLE "CustomOrder" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "CustomOrder" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "CustomOrder" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "CustomOrder" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "CustomOrder_publicId_key" ON "CustomOrder" ("publicId");

ALTER TABLE "RentalOrder" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "RentalOrder" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "RentalOrder" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "RentalOrder" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "RentalOrder_publicId_key" ON "RentalOrder" ("publicId");

ALTER TABLE "AlterationOrder" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "AlterationOrder" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "AlterationOrder" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "AlterationOrder" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "AlterationOrder_publicId_key" ON "AlterationOrder" ("publicId");

ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "Appointment" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "Appointment" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Appointment" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_publicId_key" ON "Appointment" ("publicId");

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "Payment" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Payment" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_publicId_key" ON "Payment" ("publicId");

ALTER TABLE "Comprobante" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "Comprobante" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "Comprobante" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Comprobante" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Comprobante_publicId_key" ON "Comprobante" ("publicId");

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "publicId" UUID;
UPDATE "Notification" SET "publicId" = gen_random_uuid() WHERE "publicId" IS NULL;
ALTER TABLE "Notification" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Notification" ALTER COLUMN "publicId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_publicId_key" ON "Notification" ("publicId");
