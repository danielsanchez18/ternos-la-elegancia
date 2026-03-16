-- CreateTable
CREATE TABLE "PromotionProductTarget" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionProductTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionProductTarget_productId_idx" ON "PromotionProductTarget"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionProductTarget_promotionId_productId_key" ON "PromotionProductTarget"("promotionId", "productId");

-- AddForeignKey
ALTER TABLE "PromotionProductTarget" ADD CONSTRAINT "PromotionProductTarget_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProductTarget" ADD CONSTRAINT "PromotionProductTarget_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
