import { DiscountType, Prisma, PromotionScope } from "@prisma/client";

export type PublicPromotion = {
  id: string;
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
    productId: string;
  }>;
};

export type PublicCoupon = {
  id: string;
  code: string;
  promotionId: string | null;
  bundleId: string | null;
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
    id: string;
    nombre: string;
    scope: PromotionScope;
    active: boolean;
    productTargets: Array<{
      productId: string;
    }>;
  } | null;
  bundle: {
    id: string;
    nombre: string;
    slug: string;
    active: boolean;
  } | null;
};

export type PublicCouponUse = {
  id: string;
  couponId: string;
  saleOrderId: string | null;
  customOrderId: string | null;
  rentalOrderId: string | null;
  alterationOrderId: string | null;
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
  promotionId?: string;
  bundleId?: string;
};

export type CreatePromotionInput = {
  nombre: string;
  scope: PromotionScope;
  discountType: DiscountType;
  value: number;
  startsAt: Date;
  endsAt?: Date | null;
  active?: boolean;
  productIds?: string[];
};

export type UpdatePromotionInput = {
  nombre?: string;
  scope?: PromotionScope;
  discountType?: DiscountType;
  value?: number;
  startsAt?: Date;
  endsAt?: Date | null;
  active?: boolean;
  productIds?: string[];
};

export type CreateCouponInput = {
  code: string;
  promotionId?: string | null;
  bundleId?: string | null;
  discountType: DiscountType;
  value: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
};

export type UpdateCouponInput = {
  code?: string;
  promotionId?: string | null;
  bundleId?: string | null;
  discountType?: DiscountType;
  value?: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
};

export type CouponOrderType = "sale" | "custom" | "rental" | "alteration";

export type ApplyCouponToOrderInput = {
  couponId: string;
  orderType: CouponOrderType;
  orderId: string;
};

export type AppliedCouponToOrderResult = {
  couponUse: PublicCouponUse;
  order: {
    id: string;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
};

export type RevertedCouponUseResult = {
  couponUse: PublicCouponUse;
  order: {
    id: string;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
};

export type ListAvailableCouponsForOrderInput = {
  orderType: CouponOrderType;
  orderId: string;
};

export type AvailableCouponForOrder = {
  coupon: {
    id: string;
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
    id: string;
    code: string;
    discountType: DiscountType;
    value: Prisma.Decimal;
  };
  order: {
    id: string;
    code: string;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
  };
  appliedAmount: Prisma.Decimal;
  resultingDiscountTotal: Prisma.Decimal;
  resultingTotal: Prisma.Decimal;
};
