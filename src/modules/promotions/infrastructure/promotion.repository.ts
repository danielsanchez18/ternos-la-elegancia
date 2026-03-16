import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  AppliedCouponToOrderResult,
  CouponOrderType,
  CreateCouponInput,
  CreatePromotionInput,
  ListCouponsFilters,
  ListPromotionsFilters,
  PublicCoupon,
  PublicCouponUse,
  PublicPromotion,
  RevertedCouponUseResult,
  UpdateCouponInput,
  UpdatePromotionInput,
} from "@/src/modules/promotions/domain/promotion.types";

const publicPromotionSelect = {
  id: true,
  nombre: true,
  scope: true,
  discountType: true,
  value: true,
  startsAt: true,
  endsAt: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  productTargets: {
    select: {
      productId: true,
    },
    orderBy: {
      productId: "asc",
    },
  },
} satisfies Prisma.PromotionSelect;

const publicCouponSelect = {
  id: true,
  code: true,
  promotionId: true,
  bundleId: true,
  discountType: true,
  value: true,
  maxUses: true,
  usedCount: true,
  startsAt: true,
  endsAt: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  promotion: {
    select: {
      id: true,
      nombre: true,
      scope: true,
      active: true,
      productTargets: {
        select: {
          productId: true,
        },
        orderBy: {
          productId: "asc",
        },
      },
    },
  },
  bundle: {
    select: {
      id: true,
      nombre: true,
      slug: true,
      active: true,
    },
  },
} satisfies Prisma.CouponSelect;

const publicCouponUseSelect = {
  id: true,
  couponId: true,
  saleOrderId: true,
  customOrderId: true,
  rentalOrderId: true,
  alterationOrderId: true,
  appliedAmount: true,
  createdAt: true,
} satisfies Prisma.OrderCouponUseSelect;

export class PromotionRepository {
  async getProductDiscountableSubtotal(
    orderType: CouponOrderType,
    orderId: number,
    eligibleProductIds?: number[]
  ): Promise<Prisma.Decimal | null> {
    if (eligibleProductIds && eligibleProductIds.length === 0) {
      return new Prisma.Decimal(0);
    }

    if (orderType === "sale") {
      const result = await prisma.saleOrderItem.aggregate({
        where: {
          saleOrderId: orderId,
          productId:
            eligibleProductIds && eligibleProductIds.length > 0
              ? { in: eligibleProductIds }
              : { not: null },
        },
        _sum: {
          subtotal: true,
        },
      });

      return result._sum.subtotal ?? new Prisma.Decimal(0);
    }

    if (orderType === "custom") {
      const result = await prisma.customOrderItem.aggregate({
        where: {
          customOrderId: orderId,
          productId:
            eligibleProductIds && eligibleProductIds.length > 0
              ? { in: eligibleProductIds }
              : { not: null },
        },
        _sum: {
          subtotal: true,
        },
      });

      return result._sum.subtotal ?? new Prisma.Decimal(0);
    }

    return null;
  }

  private isFinalOrderStatus(orderType: CouponOrderType, status: string): boolean {
    if (orderType === "sale") {
      return status === "ENTREGADO" || status === "CANCELADO";
    }

    if (orderType === "custom") {
      return status === "ENTREGADO" || status === "CANCELADO";
    }

    if (orderType === "rental") {
      return status === "CERRADO" || status === "CANCELADO";
    }

    return status === "ENTREGADO" || status === "CANCELADO";
  }

  async listPromotions(filters: ListPromotionsFilters): Promise<PublicPromotion[]> {
    return prisma.promotion.findMany({
      where: {
        ...(filters.search
          ? { nombre: { contains: filters.search, mode: "insensitive" } }
          : {}),
        ...(filters.scope ? { scope: filters.scope } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: publicPromotionSelect,
    });
  }

  async findPromotionById(id: number): Promise<PublicPromotion | null> {
    return prisma.promotion.findUnique({ where: { id }, select: publicPromotionSelect });
  }

  async createPromotion(input: CreatePromotionInput): Promise<PublicPromotion> {
    return prisma.promotion.create({
      data: {
        nombre: input.nombre,
        scope: input.scope,
        discountType: input.discountType,
        value: new Prisma.Decimal(input.value),
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        active: input.active,
        productTargets:
          input.productIds && input.productIds.length > 0
            ? {
                createMany: {
                  data: input.productIds.map((productId) => ({ productId })),
                },
              }
            : undefined,
      },
      select: publicPromotionSelect,
    });
  }

  async updatePromotionById(id: number, input: UpdatePromotionInput): Promise<PublicPromotion> {
    return prisma.$transaction(async (tx) => {
      await tx.promotion.update({
        where: { id },
        data: {
          nombre: input.nombre,
          scope: input.scope,
          discountType: input.discountType,
          value: input.value !== undefined ? new Prisma.Decimal(input.value) : undefined,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          active: input.active,
        },
        select: { id: true },
      });

      if (input.productIds !== undefined) {
        await tx.promotionProductTarget.deleteMany({
          where: { promotionId: id },
        });

        if (input.productIds.length > 0) {
          await tx.promotionProductTarget.createMany({
            data: input.productIds.map((productId) => ({
              promotionId: id,
              productId,
            })),
          });
        }
      }

      return tx.promotion.findUniqueOrThrow({
        where: { id },
        select: publicPromotionSelect,
      });
    });
  }

  async listCoupons(filters: ListCouponsFilters): Promise<PublicCoupon[]> {
    return prisma.coupon.findMany({
      where: {
        ...(filters.search ? { code: { contains: filters.search, mode: "insensitive" } } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(filters.promotionId !== undefined ? { promotionId: filters.promotionId } : {}),
        ...(filters.bundleId !== undefined ? { bundleId: filters.bundleId } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: publicCouponSelect,
    });
  }

  async listActiveCouponsForDate(now: Date): Promise<PublicCoupon[]> {
    return prisma.coupon.findMany({
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: "desc" },
      select: publicCouponSelect,
    });
  }

  async findCouponById(id: number): Promise<PublicCoupon | null> {
    return prisma.coupon.findUnique({ where: { id }, select: publicCouponSelect });
  }

  async createCoupon(input: CreateCouponInput): Promise<PublicCoupon> {
    return prisma.coupon.create({
      data: {
        code: input.code,
        promotionId: input.promotionId,
        bundleId: input.bundleId,
        discountType: input.discountType,
        value: new Prisma.Decimal(input.value),
        maxUses: input.maxUses,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        active: input.active,
      },
      select: publicCouponSelect,
    });
  }

  async updateCouponById(id: number, input: UpdateCouponInput): Promise<PublicCoupon> {
    return prisma.coupon.update({
      where: { id },
      data: {
        code: input.code,
        promotionId: input.promotionId,
        bundleId: input.bundleId,
        discountType: input.discountType,
        value: input.value !== undefined ? new Prisma.Decimal(input.value) : undefined,
        maxUses: input.maxUses,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        active: input.active,
      },
      select: publicCouponSelect,
    });
  }

  async listCouponUses(couponId: number): Promise<PublicCouponUse[]> {
    return prisma.orderCouponUse.findMany({
      where: { couponId },
      orderBy: { createdAt: "desc" },
      select: publicCouponUseSelect,
    });
  }

  async getCouponUseById(couponUseId: number): Promise<PublicCouponUse | null> {
    return prisma.orderCouponUse.findUnique({
      where: { id: couponUseId },
      select: publicCouponUseSelect,
    });
  }

  async getOrderCouponBase(orderType: CouponOrderType, orderId: number): Promise<{
    id: number;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  } | null> {
    if (orderType === "sale") {
      return prisma.saleOrder.findUnique({
        where: { id: orderId },
        select: { id: true, code: true, subtotal: true, discountTotal: true, total: true },
      });
    }

    if (orderType === "custom") {
      return prisma.customOrder.findUnique({
        where: { id: orderId },
        select: { id: true, code: true, subtotal: true, discountTotal: true, total: true },
      });
    }

    if (orderType === "rental") {
      return prisma.rentalOrder.findUnique({
        where: { id: orderId },
        select: { id: true, code: true, subtotal: true, discountTotal: true, total: true },
      });
    }

    return prisma.alterationOrder.findUnique({
      where: { id: orderId },
      select: { id: true, code: true, subtotal: true, discountTotal: true, total: true },
    });
  }

  async saleOrderHasBundle(saleOrderId: number, bundleId: number): Promise<boolean> {
    const row = await prisma.saleOrderItem.findFirst({
      where: {
        saleOrderId,
        bundleId,
      },
      select: { id: true },
    });

    return Boolean(row);
  }

  async couponAlreadyUsedOnOrder(
    couponId: number,
    orderType: CouponOrderType,
    orderId: number
  ): Promise<boolean> {
    const where: Prisma.OrderCouponUseWhereInput =
      orderType === "sale"
        ? { couponId, saleOrderId: orderId }
        : orderType === "custom"
          ? { couponId, customOrderId: orderId }
          : orderType === "rental"
            ? { couponId, rentalOrderId: orderId }
            : { couponId, alterationOrderId: orderId };

    const row = await prisma.orderCouponUse.findFirst({
      where,
      select: { id: true },
    });

    return Boolean(row);
  }

  async listUsedCouponIdsOnOrder(
    orderType: CouponOrderType,
    orderId: number
  ): Promise<Set<number>> {
    const where: Prisma.OrderCouponUseWhereInput =
      orderType === "sale"
        ? { saleOrderId: orderId }
        : orderType === "custom"
          ? { customOrderId: orderId }
          : orderType === "rental"
            ? { rentalOrderId: orderId }
            : { alterationOrderId: orderId };

    const rows = await prisma.orderCouponUse.findMany({
      where,
      select: { couponId: true },
    });

    return new Set(rows.map((row) => row.couponId));
  }

  async applyCouponToOrder(input: {
    couponId: number;
    orderType: CouponOrderType;
    orderId: number;
    appliedAmount: Prisma.Decimal;
  }): Promise<AppliedCouponToOrderResult> {
    return prisma.$transaction(async (tx) => {
      const base = await this.getOrderCouponBase(input.orderType, input.orderId);
      if (!base) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const nextDiscountTotal = base.discountTotal.add(input.appliedAmount);
      const nextTotal = base.subtotal.sub(nextDiscountTotal);

      let updatedOrder: AppliedCouponToOrderResult["order"];

      if (input.orderType === "sale") {
        updatedOrder = await tx.saleOrder.update({
          where: { id: input.orderId },
          data: {
            discountTotal: nextDiscountTotal,
            total: nextTotal,
          },
          select: {
            id: true,
            code: true,
            subtotal: true,
            discountTotal: true,
            total: true,
          },
        });
      } else if (input.orderType === "custom") {
        updatedOrder = await tx.customOrder.update({
          where: { id: input.orderId },
          data: {
            discountTotal: nextDiscountTotal,
            total: nextTotal,
          },
          select: {
            id: true,
            code: true,
            subtotal: true,
            discountTotal: true,
            total: true,
          },
        });
      } else if (input.orderType === "rental") {
        updatedOrder = await tx.rentalOrder.update({
          where: { id: input.orderId },
          data: {
            discountTotal: nextDiscountTotal,
            total: nextTotal,
          },
          select: {
            id: true,
            code: true,
            subtotal: true,
            discountTotal: true,
            total: true,
          },
        });
      } else {
        updatedOrder = await tx.alterationOrder.update({
          where: { id: input.orderId },
          data: {
            discountTotal: nextDiscountTotal,
            total: nextTotal,
          },
          select: {
            id: true,
            code: true,
            subtotal: true,
            discountTotal: true,
            total: true,
          },
        });
      }

      const createdUse = await tx.orderCouponUse.create({
        data: {
          couponId: input.couponId,
          saleOrderId: input.orderType === "sale" ? input.orderId : null,
          customOrderId: input.orderType === "custom" ? input.orderId : null,
          rentalOrderId: input.orderType === "rental" ? input.orderId : null,
          alterationOrderId: input.orderType === "alteration" ? input.orderId : null,
          appliedAmount: input.appliedAmount,
        },
        select: publicCouponUseSelect,
      });

      await tx.coupon.update({
        where: { id: input.couponId },
        data: {
          usedCount: { increment: 1 },
        },
      });

      return {
        couponUse: createdUse,
        order: updatedOrder,
      };
    });
  }

  async revertCouponUse(couponUseId: number): Promise<RevertedCouponUseResult> {
    return prisma.$transaction(async (tx) => {
      const couponUse = await tx.orderCouponUse.findUnique({
        where: { id: couponUseId },
        select: publicCouponUseSelect,
      });

      if (!couponUse) {
        throw new Error("COUPON_USE_NOT_FOUND");
      }

      const orderType: CouponOrderType = couponUse.saleOrderId
        ? "sale"
        : couponUse.customOrderId
          ? "custom"
          : couponUse.rentalOrderId
            ? "rental"
            : "alteration";

      const orderId =
        couponUse.saleOrderId ??
        couponUse.customOrderId ??
        couponUse.rentalOrderId ??
        couponUse.alterationOrderId;

      if (!orderId) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const order =
        orderType === "sale"
          ? await tx.saleOrder.findUnique({
              where: { id: orderId },
              select: {
                id: true,
                code: true,
                status: true,
                subtotal: true,
                discountTotal: true,
                total: true,
              },
            })
          : orderType === "custom"
            ? await tx.customOrder.findUnique({
                where: { id: orderId },
                select: {
                  id: true,
                  code: true,
                  status: true,
                  subtotal: true,
                  discountTotal: true,
                  total: true,
                },
              })
            : orderType === "rental"
              ? await tx.rentalOrder.findUnique({
                  where: { id: orderId },
                  select: {
                    id: true,
                    code: true,
                    status: true,
                    subtotal: true,
                    discountTotal: true,
                    total: true,
                  },
                })
              : await tx.alterationOrder.findUnique({
                  where: { id: orderId },
                  select: {
                    id: true,
                    code: true,
                    status: true,
                    subtotal: true,
                    discountTotal: true,
                    total: true,
                  },
                });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (this.isFinalOrderStatus(orderType, order.status)) {
        throw new Error("ORDER_FINALIZED");
      }

      const nextDiscountTotal = order.discountTotal.sub(couponUse.appliedAmount);
      if (nextDiscountTotal.lt(new Prisma.Decimal(0))) {
        throw new Error("INVALID_DISCOUNT_STATE");
      }

      const nextTotal = order.subtotal.sub(nextDiscountTotal);

      const updatedOrder =
        orderType === "sale"
          ? await tx.saleOrder.update({
              where: { id: orderId },
              data: {
                discountTotal: nextDiscountTotal,
                total: nextTotal,
              },
              select: {
                id: true,
                code: true,
                subtotal: true,
                discountTotal: true,
                total: true,
              },
            })
          : orderType === "custom"
            ? await tx.customOrder.update({
                where: { id: orderId },
                data: {
                  discountTotal: nextDiscountTotal,
                  total: nextTotal,
                },
                select: {
                  id: true,
                  code: true,
                  subtotal: true,
                  discountTotal: true,
                  total: true,
                },
              })
            : orderType === "rental"
              ? await tx.rentalOrder.update({
                  where: { id: orderId },
                  data: {
                    discountTotal: nextDiscountTotal,
                    total: nextTotal,
                  },
                  select: {
                    id: true,
                    code: true,
                    subtotal: true,
                    discountTotal: true,
                    total: true,
                  },
                })
              : await tx.alterationOrder.update({
                  where: { id: orderId },
                  data: {
                    discountTotal: nextDiscountTotal,
                    total: nextTotal,
                  },
                  select: {
                    id: true,
                    code: true,
                    subtotal: true,
                    discountTotal: true,
                    total: true,
                  },
                });

      await tx.orderCouponUse.delete({ where: { id: couponUseId } });

      const coupon = await tx.coupon.findUnique({
        where: { id: couponUse.couponId },
        select: { id: true, usedCount: true },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: coupon.usedCount > 0 ? { decrement: 1 } : 0,
          },
        });
      }

      return {
        couponUse,
        order: updatedOrder,
      };
    });
  }

  async promotionExists(promotionId: number): Promise<boolean> {
    const row = await prisma.promotion.findUnique({ where: { id: promotionId }, select: { id: true } });
    return Boolean(row);
  }

  async productsExist(productIds: number[]): Promise<boolean> {
    const uniqueProductIds = Array.from(new Set(productIds));
    if (uniqueProductIds.length === 0) {
      return true;
    }

    const count = await prisma.product.count({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
    });

    return count === uniqueProductIds.length;
  }

  async bundleExists(bundleId: number): Promise<boolean> {
    const row = await prisma.bundle.findUnique({ where: { id: bundleId }, select: { id: true } });
    return Boolean(row);
  }
}
