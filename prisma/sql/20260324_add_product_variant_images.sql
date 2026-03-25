CREATE TABLE IF NOT EXISTS "ProductVariantImage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "variantId" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductVariantImage_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ProductVariantImage_variantId_fkey'
  ) THEN
    ALTER TABLE "ProductVariantImage"
      ADD CONSTRAINT "ProductVariantImage_variantId_fkey"
      FOREIGN KEY ("variantId")
      REFERENCES "ProductVariant"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "ProductVariantImage_variantId_sortOrder_idx"
  ON "ProductVariantImage"("variantId", "sortOrder");
