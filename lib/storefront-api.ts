export type StorefrontProduct = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  kind: string;
  status: string;
  allowsRental: boolean;
  allowsCustomization: boolean;
  requiresMeasurement: boolean;
  isFeatured: boolean;
  isNew: boolean;
  allowsSale: boolean;
  active: boolean;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    talla: string | null;
    tallaSecundaria: string | null;
    color: string | null;
    stock: number;
    salePrice: string | number;
    compareAtPrice: string | number | null;
    active: boolean;
  }>;
};

export type StorefrontBundle = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  price: string | number;
  active: boolean;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    sortOrder: number;
    product: {
      id: string;
      nombre: string;
      slug: string;
      active: boolean;
    };
  }>;
  variantItems?: Array<{
    id: string;
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
  }>;
};

async function getJson<T>(input: string): Promise<T> {
  const response = await fetch(input, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  return getJson<StorefrontProduct[]>("/api/products?active=true&allowsSale=true");
}

export async function getStorefrontProductBySlug(
  slug: string
): Promise<StorefrontProduct> {
  return getJson<StorefrontProduct>(`/api/products/slug/${slug}`);
}

export async function getStorefrontBundles(): Promise<StorefrontBundle[]> {
  return getJson<StorefrontBundle[]>("/api/bundles?active=true");
}

export async function getStorefrontBundleBySlug(
  slug: string
): Promise<StorefrontBundle | null> {
  const bundles = await getJson<StorefrontBundle[]>(
    `/api/bundles?active=true&search=${encodeURIComponent(slug)}`
  );

  return bundles.find((bundle) => bundle.slug === slug) ?? null;
}
