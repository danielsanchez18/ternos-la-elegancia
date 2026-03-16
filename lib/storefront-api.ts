export type StorefrontProduct = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  kind: string;
  isFeatured: boolean;
  isNew: boolean;
  allowsSale: boolean;
  active: boolean;
  images: Array<{
    id: number;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
  variants: Array<{
    id: number;
    salePrice: string | number;
    active: boolean;
  }>;
};

export type StorefrontBundle = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string | null;
  price: string | number;
  active: boolean;
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

export async function getStorefrontBundles(): Promise<StorefrontBundle[]> {
  return getJson<StorefrontBundle[]>("/api/bundles?active=true");
}
