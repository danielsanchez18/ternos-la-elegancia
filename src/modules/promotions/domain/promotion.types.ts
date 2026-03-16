import { DiscountType, Prisma, PromotionScope } from "@prisma/client";

export type PublicPromotion = {
  id: number;
  nombre: string;
  scope: PromotionScope;
  discountType: DiscountType;
  value: Prisma.Decimal;
  startsAt: Date;
  endsAt: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTargets: Array<{
    productId: number;
  }>;
};

export type PublicCoupon = {
  id: number;
  code: string;
  promotionId: number | null;
  bundleId: number | null;
  discountType: DiscountType;
  value: Prisma.Decimal;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  promotion: {
    id: number;
    nombre: string;
    scope: PromotionScope;
    active: boolean;
    productTargets: Array<{
      productId: number;
    }>;
  } | null;
  bundle: {
    id: number;
    nombre: string;
    slug: string;
    active: boolean;
  } | null;
};

export type PublicCouponUse = {
  id: number;
  couponId: number;
  saleOrderId: number | null;
  customOrderId: number | null;
  rentalOrderId: number | null;
  alterationOrderId: number | null;
  appliedAmount: Prisma.Decimal;
  createdAt: Date;
};

export type ListPromotionsFilters = {
  search?: string;
  scope?: PromotionScope;
  active?: boolean;
};

export type ListCouponsFilters = {
  search?: string;
  active?: boolean;
  promotionId?: number;
  bundleId?: number;
};

export type CreatePromotionInput = {
  nombre: string;
  scope: PromotionScope;
  discountType: DiscountType;
  value: number;
  startsAt: Date;
  endsAt?: Date | null;
  active?: boolean;
  productIds?: number[];
};

export type UpdatePromotionInput = {
  nombre?: string;
  scope?: PromotionScope;
  discountType?: DiscountType;
  value?: number;
  startsAt?: Date;
  endsAt?: Date | null;
  active?: boolean;
  productIds?: number[];
};

export type CreateCouponInput = {
  code: string;
  promotionId?: number | null;
  bundleId?: number | null;
  discountType: DiscountType;
  value: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
};

export type UpdateCouponInput = {
  code?: string;
  promotionId?: number | null;
  bundleId?: number | null;
  discountType?: DiscountType;
  value?: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
};

export type CouponOrderType = "sale" | "custom" | "rental" | "alteration";

export type ApplyCouponToOrderInput = {
  couponId: number;
  orderType: CouponOrderType;
  orderId: number;
};

export type AppliedCouponToOrderResult = {
  couponUse: PublicCouponUse;
  order: {
    id: number;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
};

export type RevertedCouponUseResult = {
  couponUse: PublicCouponUse;
  order: {
    id: number;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
};

export type ListAvailableCouponsForOrderInput = {
  orderType: CouponOrderType;
  orderId: number;
};

export type AvailableCouponForOrder = {
  coupon: {
    id: number;
    code: string;
    discountType: DiscountType;
    value: Prisma.Decimal;
  };
  appliedAmount: Prisma.Decimal;
  resultingDiscountTotal: Prisma.Decimal;
  resultingTotal: Prisma.Decimal;
};

export type PreviewCouponForOrderResult = {
  coupon: {
    id: number;
    code: string;
    discountType: DiscountType;
    value: Prisma.Decimal;
  };
  order: {
    id: number;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
  appliedAmount: Prisma.Decimal;
  resultingDiscountTotal: Prisma.Decimal;
  resultingTotal: Prisma.Decimal;
};
