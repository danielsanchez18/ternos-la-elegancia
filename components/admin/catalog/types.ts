export type DecimalLike = string | number;

export type AdminProductVariantImage = {
  id: string;
  variantId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminBrand = {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductVariant = {
  id: string;
  sku: string;
  talla: string | null;
  tallaSecundaria: string | null;
  color: string | null;
  colorCodigo: string | null;
  stock: number;
  minStock: number;
  salePrice: DecimalLike;
  compareAtPrice: DecimalLike | null;
  active: boolean;
  images: AdminProductVariantImage[];
};

export type AdminProduct = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  kind: string;
  gender: string | null;
  status: string;
  stockTrackingMode: string;
  requiresMeasurement: boolean;
  allowsSale: boolean;
  allowsRental: boolean;
  allowsCustomization: boolean;
  isFeatured: boolean;
  isNew: boolean;
  active: boolean;
  brandId: string | null;
  brand: {
    id: string;
    nombre: string;
    activo: boolean;
  } | null;
  variants: AdminProductVariant[];
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminBundleItem = {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  product: {
    id: string;
    nombre: string;
    slug: string;
    active: boolean;
  };
};

export type AdminBundleVariantItem = {
  id: string;
  bundleId: string;
  variantId: string;
  quantity: number;
  sortOrder: number;
  variant: {
    id: string;
    sku: string;
    active: boolean;
    product: {
      id: string;
      nombre: string;
      slug: string;
      active: boolean;
    };
  };
};

export type AdminBundle = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  price: DecimalLike;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  items: AdminBundleItem[];
  variantItems: AdminBundleVariantItem[];
};

export type AdminCatalogAttributeOption = {
  id: string;
  definitionId: string;
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

export type AdminCatalogAttributeDefinition = {
  id: string;
  code: string;
  label: string;
  scope: string;
  inputType: string;
  appliesToKind: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  options: AdminCatalogAttributeOption[];
};
