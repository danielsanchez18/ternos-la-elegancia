import { Prisma } from "@prisma/client";

import {
  CouponConflictError,
  CouponNotFoundError,
  CouponUseNotFoundError,
  PromotionConflictError,
  PromotionNotFoundError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  AvailableCouponForOrder,
  AppliedCouponToOrderResult,
  ApplyCouponToOrderInput,
  CreateCouponInput,
  ListAvailableCouponsForOrderInput,
  CreatePromotionInput,
  ListCouponsFilters,
  ListPromotionsFilters,
  PublicCoupon,
  PublicCouponUse,
  PublicPromotion,
  PreviewCouponForOrderResult,
  RevertedCouponUseResult,
  UpdateCouponInput,
  UpdatePromotionInput,
} from "@/src/modules/promotions/domain/promotion.types";
import { PromotionRepository } from "@/src/modules/promotions/infrastructure/promotion.repository";

export class PromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async listPromotions(filters: ListPromotionsFilters): Promise<PublicPromotion[]> {
    return this.promotionRepository.listPromotions(filters);
  }

  async getPromotionById(id: string): Promise<PublicPromotion> {
    const promotion = await this.promotionRepository.findPromotionById(id);
    if (!promotion) {
      throw new PromotionNotFoundError();
    }

    return promotion;
  }

  async createPromotion(input: CreatePromotionInput): Promise<PublicPromotion> {
    this.assertDateRange(input.startsAt, input.endsAt);
    const normalizedProductIds = this.normalizeProductIds(input.productIds);
    await this.assertPromotionTargeting(input.scope, normalizedProductIds ?? []);

    try {
      return await this.promotionRepository.createPromotion({
        ...input,
        productIds: normalizedProductIds,
      });
    } catch (error: unknown) {
      this.handlePromotionPersistenceError(error);
    }
  }

  async updatePromotion(id: string, input: UpdatePromotionInput): Promise<PublicPromotion> {
    const existing = await this.getPromotionById(id);
    const finalScope = input.scope ?? existing.scope;

    const normalizedProductIds = this.normalizeProductIds(input.productIds);
    const resolvedProductIds =
      normalizedProductIds ?? existing.productTargets.map((target) => target.productId);

    const productIdsForPersistence =
      finalScope === "PRODUCTO" ? resolvedProductIds : [];

    await this.assertPromotionTargeting(finalScope, productIdsForPersistence);

    const startsAt = input.startsAt ?? existing.startsAt;
    const endsAt = input.endsAt !== undefined ? input.endsAt : existing.endsAt;
    this.assertDateRange(startsAt, endsAt);

    try {
      return await this.promotionRepository.updatePromotionById(id, {
        ...input,
        productIds: productIdsForPersistence,
      });
    } catch (error: unknown) {
      this.handlePromotionPersistenceError(error);
    }
  }

  async deactivatePromotion(id: string): Promise<PublicPromotion> {
    return this.updatePromotion(id, { active: false });
  }

  async listCoupons(filters: ListCouponsFilters): Promise<PublicCoupon[]> {
    return this.promotionRepository.listCoupons(filters);
  }

  async getCouponById(id: string): Promise<PublicCoupon> {
    const coupon = await this.promotionRepository.findCouponById(id);
    if (!coupon) {
      throw new CouponNotFoundError();
    }

    return coupon;
  }

  async createCoupon(input: CreateCouponInput): Promise<PublicCoupon> {
    this.assertCouponRelations(input.promotionId, input.bundleId);
    await this.assertCouponRelationsExist(input.promotionId, input.bundleId);
    this.assertDateRange(input.startsAt ?? null, input.endsAt ?? null);

    try {
      return await this.promotionRepository.createCoupon(input);
    } catch (error: unknown) {
      this.handleCouponPersistenceError(error);
    }
  }

  async updateCoupon(id: string, input: UpdateCouponInput): Promise<PublicCoupon> {
    const existing = await this.getCouponById(id);

    const promotionId = input.promotionId !== undefined ? input.promotionId : existing.promotionId;
    const bundleId = input.bundleId !== undefined ? input.bundleId : existing.bundleId;
    this.assertCouponRelations(promotionId, bundleId);
    await this.assertCouponRelationsExist(promotionId, bundleId);

    const startsAt = input.startsAt !== undefined ? input.startsAt : existing.startsAt;
    const endsAt = input.endsAt !== undefined ? input.endsAt : existing.endsAt;
    this.assertDateRange(startsAt, endsAt);

    try {
      return await this.promotionRepository.updateCouponById(id, input);
    } catch (error: unknown) {
      this.handleCouponPersistenceError(error);
    }
  }

  async deactivateCoupon(id: string): Promise<PublicCoupon> {
    return this.updateCoupon(id, { active: false });
  }

  async listCouponUses(couponId: string): Promise<PublicCouponUse[]> {
    await this.getCouponById(couponId);
    return this.promotionRepository.listCouponUses(couponId);
  }

  async applyCouponToOrder(
    input: ApplyCouponToOrderInput
  ): Promise<AppliedCouponToOrderResult> {
    const calculation = await this.calculateCouponApplication(input);

    return this.promotionRepository.applyCouponToOrder({
      couponId: input.couponId,
      orderType: input.orderType,
      orderId: input.orderId,
      appliedAmount: calculation.appliedAmount,
    });
  }

  async previewCouponForOrder(
    input: ApplyCouponToOrderInput
  ): Promise<PreviewCouponForOrderResult> {
    const calculation = await this.calculateCouponApplication(input);

    return {
      coupon: {
        id: calculation.coupon.id,
        code: calculation.coupon.code,
        discountType: calculation.coupon.discountType,
        value: calculation.coupon.value,
      },
      order: calculation.order,
      appliedAmount: calculation.appliedAmount,
      resultingDiscountTotal: calculation.order.discountTotal.add(calculation.appliedAmount),
      resultingTotal: calculation.order.total.sub(calculation.appliedAmount),
    };
  }

  async listAvailableCouponsForOrder(
    input: ListAvailableCouponsForOrderInput
  ): Promise<AvailableCouponForOrder[]> {
    const order = await this.promotionRepository.getOrderCouponBase(
      input.orderType,
      input.orderId
    );

    if (!order) {
      const entity =
        input.orderType === "sale"
          ? "saleOrder"
          : input.orderType === "custom"
            ? "customOrder"
            : input.orderType === "rental"
              ? "rentalOrder"
              : "alterationOrder";
      throw new PromotionRelatedEntityNotFoundError(entity);
    }

    const remainingDiscountable = order.subtotal.sub(order.discountTotal);
    if (remainingDiscountable.lte(new Prisma.Decimal(0))) {
      return [];
    }

    const now = new Date();
    const coupons = await this.promotionRepository.listActiveCouponsForDate(now);
    const usedCouponIds = await this.promotionRepository.listUsedCouponIdsOnOrder(
      input.orderType,
      input.orderId
    );

    const available: AvailableCouponForOrder[] = [];

    for (const coupon of coupons) {
      if (usedCouponIds.has(coupon.id)) {
        continue;
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        continue;
      }

      if (coupon.promotion) {
        if (!coupon.promotion.active) {
          continue;
        }

        if (
          coupon.promotion.scope === "PRODUCTO" &&
          (input.orderType !== "sale" && input.orderType !== "custom")
        ) {
          continue;
        }

        if (coupon.promotion.scope === "BUNDLE" && input.orderType !== "sale") {
          continue;
        }
      }

      if (coupon.bundleId !== null) {
        if (input.orderType !== "sale") {
          continue;
        }

        const hasBundle = await this.promotionRepository.saleOrderHasBundle(
          input.orderId,
          coupon.bundleId
        );

        if (!hasBundle) {
          continue;
        }
      }

      const discountBase =
        coupon.promotion?.scope === "PRODUCTO"
          ? await this.promotionRepository.getProductDiscountableSubtotal(
              input.orderType,
              input.orderId,
              coupon.promotion.productTargets.map((target) => target.productId)
            ) ?? new Prisma.Decimal(0)
          : order.subtotal;

      if (discountBase.lte(new Prisma.Decimal(0))) {
        continue;
      }

      const rawDiscount =
        coupon.discountType === "PORCENTAJE"
          ? discountBase.mul(coupon.value).div(new Prisma.Decimal(100))
          : coupon.value;

      const appliedAmount = rawDiscount.gt(remainingDiscountable)
        ? remainingDiscountable
        : rawDiscount;

      if (appliedAmount.lte(new Prisma.Decimal(0))) {
        continue;
      }

      available.push({
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
        },
        appliedAmount,
        resultingDiscountTotal: order.discountTotal.add(appliedAmount),
        resultingTotal: order.total.sub(appliedAmount),
      });
    }

    return available;
  }

  async revertCouponUse(couponUseId: string): Promise<RevertedCouponUseResult> {
    try {
      return await this.promotionRepository.revertCouponUse(couponUseId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "COUPON_USE_NOT_FOUND") {
        throw new CouponUseNotFoundError();
      }

      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        throw new PromotionValidationError("Target order for coupon use not found");
      }

      if (error instanceof Error && error.message === "ORDER_FINALIZED") {
        throw new PromotionValidationError(
          "Cannot revert coupon use for a finalized order"
        );
      }

      if (error instanceof Error && error.message === "INVALID_DISCOUNT_STATE") {
        throw new PromotionValidationError("Invalid discount state for coupon reversal");
      }

      throw error;
    }
  }

  private assertDateRange(startsAt: Date | null | undefined, endsAt: Date | null | undefined): void {
    if (!startsAt || !endsAt) {
      return;
    }

    if (endsAt < startsAt) {
      throw new PromotionValidationError("endsAt must be greater than or equal to startsAt");
    }
  }

  private async calculateCouponApplication(input: ApplyCouponToOrderInput): Promise<{
    coupon: PublicCoupon;
    order: {
      id: string;
      code: string;
      subtotal: Prisma.Decimal;
      discountTotal: Prisma.Decimal;
      total: Prisma.Decimal;
    };
    appliedAmount: Prisma.Decimal;
  }> {
    const coupon = await this.getCouponById(input.couponId);
    const now = new Date();

    if (!coupon.active) {
      throw new PromotionValidationError("Coupon is inactive");
    }

    if (coupon.startsAt && now < coupon.startsAt) {
      throw new PromotionValidationError("Coupon is not active yet");
    }

    if (coupon.endsAt && now > coupon.endsAt) {
      throw new PromotionValidationError("Coupon is expired");
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new PromotionValidationError("Coupon max uses reached");
    }

    if (coupon.promotion) {
      if (!coupon.promotion.active) {
        throw new PromotionValidationError("Promotion is inactive");
      }

      if (
        coupon.promotion.scope === "PRODUCTO" &&
        (input.orderType !== "sale" && input.orderType !== "custom")
      ) {
        throw new PromotionValidationError(
          "PRODUCT scope coupons can only be applied to sale or custom orders"
        );
      }

      if (coupon.promotion.scope === "BUNDLE" && input.orderType !== "sale") {
        throw new PromotionValidationError(
          "BUNDLE scope coupons can only be applied to sale orders"
        );
      }
    }

    if (coupon.bundleId !== null) {
      if (input.orderType !== "sale") {
        throw new PromotionValidationError(
          "Bundle coupons can only be applied to sale orders"
        );
      }

      const hasBundle = await this.promotionRepository.saleOrderHasBundle(
        input.orderId,
        coupon.bundleId
      );

      if (!hasBundle) {
        throw new PromotionValidationError(
          "Sale order does not contain the required bundle"
        );
      }
    }

    const alreadyUsed = await this.promotionRepository.couponAlreadyUsedOnOrder(
      input.couponId,
      input.orderType,
      input.orderId
    );

    if (alreadyUsed) {
      throw new PromotionValidationError("Coupon already applied to this order");
    }

    const order = await this.promotionRepository.getOrderCouponBase(
      input.orderType,
      input.orderId
    );

    if (!order) {
      const entity =
        input.orderType === "sale"
          ? "saleOrder"
          : input.orderType === "custom"
            ? "customOrder"
            : input.orderType === "rental"
              ? "rentalOrder"
              : "alterationOrder";
      throw new PromotionRelatedEntityNotFoundError(entity);
    }

    const remainingDiscountable = order.subtotal.sub(order.discountTotal);
    if (remainingDiscountable.lte(new Prisma.Decimal(0))) {
      throw new PromotionValidationError("Order does not have discountable amount");
    }

    const discountBase =
      coupon.promotion?.scope === "PRODUCTO"
        ? await this.promotionRepository.getProductDiscountableSubtotal(
            input.orderType,
            input.orderId,
            coupon.promotion.productTargets.map((target) => target.productId)
          )
        : order.subtotal;

    if (!discountBase || discountBase.lte(new Prisma.Decimal(0))) {
      throw new PromotionValidationError(
        "Order does not have eligible product amount for PRODUCT scope coupon"
      );
    }

    const rawDiscount =
      coupon.discountType === "PORCENTAJE"
        ? discountBase.mul(coupon.value).div(new Prisma.Decimal(100))
        : coupon.value;

    const appliedAmount = rawDiscount.gt(remainingDiscountable)
      ? remainingDiscountable
      : rawDiscount;

    if (appliedAmount.lte(new Prisma.Decimal(0))) {
      throw new PromotionValidationError("Calculated discount must be greater than 0");
    }

    return {
      coupon,
      order,
      appliedAmount,
    };
  }

  private assertCouponRelations(
    promotionId: string | null | undefined,
    bundleId: string | null | undefined
  ): void {
    if (promotionId && bundleId) {
      throw new PromotionValidationError("Coupon cannot reference promotion and bundle at the same time");
    }
  }

  private async assertCouponRelationsExist(
    promotionId: string | null | undefined,
    bundleId: string | null | undefined
  ): Promise<void> {
    if (promotionId) {
      const exists = await this.promotionRepository.promotionExists(promotionId);
      if (!exists) {
        throw new PromotionRelatedEntityNotFoundError("promotion");
      }
    }

    if (bundleId) {
      const exists = await this.promotionRepository.bundleExists(bundleId);
      if (!exists) {
        throw new PromotionRelatedEntityNotFoundError("bundle");
      }
    }
  }

  private normalizeProductIds(productIds: string[] | undefined): string[] | undefined {
    if (productIds === undefined) {
      return undefined;
    }

    return Array.from(new Set(productIds));
  }

  private async assertPromotionTargeting(
    scope: "ORDEN" | "PRODUCTO" | "BUNDLE",
    productIds: string[]
  ): Promise<void> {
    if (scope === "PRODUCTO") {
      if (productIds.length === 0) {
        throw new PromotionValidationError(
          "PRODUCT scope promotion requires at least one target product"
        );
      }

      const productsExist = await this.promotionRepository.productsExist(productIds);
      if (!productsExist) {
        throw new PromotionRelatedEntityNotFoundError("product");
      }

      return;
    }

    if (productIds.length > 0) {
      throw new PromotionValidationError(
        "Product targets are only allowed for PRODUCT scope promotions"
      );
    }
  }

  private handlePromotionPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new PromotionNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new PromotionConflictError(fields);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new PromotionRelatedEntityNotFoundError("product");
    }

    throw error;
  }

  private handleCouponPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new CouponNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new CouponConflictError(fields);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new PromotionRelatedEntityNotFoundError("promotion");
    }

    throw error;
  }
}

export const promotionService = new PromotionService(new PromotionRepository());
