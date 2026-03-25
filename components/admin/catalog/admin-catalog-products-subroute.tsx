"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Power,
  RefreshCw,
  Ruler,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
  apiPost,
  parseApiError,
} from "@/components/admin/catalog/api";
import { catalogPanel, catalogStatCard } from "@/components/admin/catalog/catalog-ui";
import type {
  AdminBrand,
  AdminProduct,
  AdminProductVariant,
  AdminProductVariantImage,
} from "@/components/admin/catalog/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRODUCT_KINDS = [
  "TERNO",
  "SACO",
  "PANTALON",
  "CAMISA",
  "BLUSA",
  "CHALECO",
  "ACCESORIO",
  "SMOKING",
  "BUNDLE",
] as const;

type ProductDraft = {
  nombre: string;
  slug: string;
  kind: (typeof PRODUCT_KINDS)[number];
  brandId: string;
  descripcion: string;
  allowsSale: boolean;
  allowsRental: boolean;
  allowsCustomization: boolean;
  requiresMeasurement: boolean;
  active: boolean;
  isFeatured: boolean;
  isNew: boolean;
};

type VariantDraft = {
  sku: string;
  talla: string;
  tallaSecundaria: string;
  color: string;
  colorCodigo: string;
  stock: string;
  minStock: string;
  salePrice: string;
  compareAtPrice: string;
  active: boolean;
};

const DEFAULT_PRODUCT_DRAFT: ProductDraft = {
  nombre: "",
  slug: "",
  kind: "TERNO",
  brandId: "",
  descripcion: "",
  allowsSale: true,
  allowsRental: false,
  allowsCustomization: false,
  requiresMeasurement: false,
  active: true,
  isFeatured: false,
  isNew: false,
};

const DEFAULT_VARIANT_DRAFT: VariantDraft = {
  sku: "",
  talla: "",
  tallaSecundaria: "",
  color: "",
  colorCodigo: "",
  stock: "1",
  minStock: "0",
  salePrice: "0",
  compareAtPrice: "",
  active: true,
};

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatMoney(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "S/ 0.00";
  }
  return `S/ ${parsed.toFixed(2)}`;
}

function buildPriceRange(variants: AdminProductVariant[]) {
  if (variants.length === 0) {
    return "Sin variantes";
  }

  const prices = variants.map((variant) => Number(variant.salePrice));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return "Sin precio";
  }

  if (min === max) {
    return formatMoney(min);
  }

  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

function isHexColor(value: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(value.trim());
}

function getPrimarySizeLabel(kind: (typeof PRODUCT_KINDS)[number]) {
  switch (kind) {
    case "TERNO":
    case "SACO":
    case "SMOKING":
      return "Talla de saco";
    case "PANTALON":
      return "Talla de pantalon";
    case "CAMISA":
      return "Talla de camisa";
    case "BLUSA":
      return "Talla de blusa";
    case "CHALECO":
      return "Talla de chaleco";
    case "ACCESORIO":
      return "Talla o medida";
    default:
      return "Talla principal";
  }
}

function formatVariantSizes(
  variant: AdminProductVariant,
  productKind: (typeof PRODUCT_KINDS)[number]
) {
  if (productKind === "TERNO") {
    const saco = variant.talla?.trim() || "--";
    const pantalon = variant.tallaSecundaria?.trim() || "--";
    return `Saco: ${saco} / Pantalon: ${pantalon}`;
  }

  return variant.talla?.trim() || "Sin talla";
}

export default function AdminCatalogProductsSubroute() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [search, setSearch] = useState("");
  const [productDraft, setProductDraft] = useState<ProductDraft>(
    DEFAULT_PRODUCT_DRAFT
  );
  const [variantDraft, setVariantDraft] = useState<VariantDraft>(
    DEFAULT_VARIANT_DRAFT
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantIdForImages, setSelectedVariantIdForImages] = useState("");
  const [variantImages, setVariantImages] = useState<AdminProductVariantImage[]>([]);
  const [variantImageAltText, setVariantImageAltText] = useState("");
  const [variantImageSortOrder, setVariantImageSortOrder] = useState("0");
  const [variantImageFile, setVariantImageFile] = useState<File | null>(null);
  const [variantImageInputKey, setVariantImageInputKey] = useState(0);
  const [isVariantImagesLoading, setIsVariantImagesLoading] = useState(false);
  const [isVariantImageSaving, setIsVariantImageSaving] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productsResponse, brandsResponse] = await Promise.all([
        apiGet<AdminProduct[]>("/api/products"),
        apiGet<AdminBrand[]>("/api/brands"),
      ]);

      setProducts(productsResponse);
      setBrands(brandsResponse);
      setSelectedProductId((current) =>
        current && !productsResponse.some((product) => product.id === current)
          ? null
          : current
      );
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudo cargar productos."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      [
        product.nombre,
        product.slug,
        product.kind,
        product.brand?.nombre ?? "",
        ...product.variants.map((variant) => variant.sku),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [products, search]);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const selectedProductKind = (selectedProduct?.kind ??
    "TERNO") as (typeof PRODUCT_KINDS)[number];
  const requiresSecondarySize = selectedProductKind === "TERNO";
  const primarySizeLabel = getPrimarySizeLabel(selectedProductKind);
  const selectedVariantForImages =
    selectedProduct?.variants.find((variant) => variant.id === selectedVariantIdForImages) ??
    null;

  const refreshVariantImages = useCallback(async (variantId: string) => {
    setIsVariantImagesLoading(true);
    setError(null);

    try {
      const response = await apiGet<AdminProductVariantImage[]>(
        `/api/products/variants/${variantId}/images`
      );
      setVariantImages(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron cargar imagenes de la variante."
      );
    } finally {
      setIsVariantImagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedProduct || selectedProduct.variants.length === 0) {
      setSelectedVariantIdForImages("");
      setVariantImages([]);
      return;
    }

    setSelectedVariantIdForImages((current) => {
      if (current && selectedProduct.variants.some((variant) => variant.id === current)) {
        return current;
      }

      return selectedProduct.variants[0].id;
    });
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedVariantIdForImages) {
      setVariantImages([]);
      return;
    }

    void refreshVariantImages(selectedVariantIdForImages);
  }, [refreshVariantImages, selectedVariantIdForImages]);

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminProduct>(
        "/api/products",
        {
          nombre: productDraft.nombre.trim(),
          slug: productDraft.slug.trim(),
          descripcion: productDraft.descripcion.trim() || undefined,
          kind: productDraft.kind,
          brandId: productDraft.brandId || null,
          allowsSale: productDraft.allowsSale,
          allowsRental: productDraft.allowsRental,
          allowsCustomization: productDraft.allowsCustomization,
          requiresMeasurement: productDraft.requiresMeasurement,
          active: productDraft.active,
          isFeatured: productDraft.isFeatured,
          isNew: productDraft.isNew,
        },
        "No se pudo crear el producto."
      );

      setProductDraft(DEFAULT_PRODUCT_DRAFT);
      setIsSlugManuallyEdited(false);
      setFeedback("Producto creado correctamente.");
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el producto."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleProductActive = async (product: AdminProduct) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminProduct>(
        `/api/products/${product.id}`,
        {
          active: !product.active,
          status: product.active ? "INACTIVO" : "ACTIVO",
        },
        "No se pudo actualizar el estado del producto."
      );
      setFeedback(
        product.active
          ? "Producto desactivado correctamente."
          : "Producto reactivado correctamente."
      );
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el estado del producto."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleProductRental = async (product: AdminProduct) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminProduct>(
        `/api/products/${product.id}`,
        { allowsRental: !product.allowsRental },
        "No se pudo actualizar el modo de renta."
      );
      setFeedback(
        product.allowsRental
          ? "Producto retirado de renta."
          : "Producto habilitado para renta."
      );
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el modo de renta."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVariant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      setError("Selecciona un producto para registrar la variante.");
      return;
    }

    const isSuit = selectedProduct.kind === "TERNO";
    const normalizedSecondarySize = variantDraft.tallaSecundaria.trim();
    const normalizedColorCode = variantDraft.colorCodigo.trim();

    if (isSuit && !normalizedSecondarySize) {
      setError("Para ternos, registra la talla del pantalon.");
      return;
    }

    if (normalizedColorCode && !isHexColor(normalizedColorCode)) {
      setError("El color HEX debe tener formato #RRGGBB.");
      return;
    }

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminProductVariant>(
        `/api/products/${selectedProduct.id}/variants`,
        {
          sku: variantDraft.sku.trim(),
          talla: variantDraft.talla.trim() || undefined,
          tallaSecundaria: isSuit ? normalizedSecondarySize || undefined : undefined,
          color: variantDraft.color.trim() || undefined,
          colorCodigo: normalizedColorCode || undefined,
          stock: Number.parseInt(variantDraft.stock, 10),
          minStock: Number.parseInt(variantDraft.minStock, 10),
          salePrice: Number.parseFloat(variantDraft.salePrice),
          compareAtPrice: variantDraft.compareAtPrice.trim()
            ? Number.parseFloat(variantDraft.compareAtPrice)
            : null,
          active: variantDraft.active,
        },
        "No se pudo crear la variante."
      );

      setVariantDraft(DEFAULT_VARIANT_DRAFT);
      setFeedback("Variante creada correctamente.");
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear la variante."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVariantActive = async (variant: AdminProductVariant) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminProductVariant>(
        `/api/products/variants/${variant.id}`,
        { active: !variant.active },
        "No se pudo actualizar la variante."
      );

      setFeedback(
        variant.active
          ? "Variante desactivada correctamente."
          : "Variante activada correctamente."
      );
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la variante."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadVariantImage = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedVariantIdForImages) {
      setError("Selecciona una variante para subir imagenes.");
      return;
    }

    if (!variantImageFile) {
      setError("Selecciona una imagen para subir.");
      return;
    }

    const normalizedSortOrder = variantImageSortOrder.trim();
    const parsedSortOrder = normalizedSortOrder
      ? Number.parseInt(normalizedSortOrder, 10)
      : 0;

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      setError("El orden debe ser un numero entero mayor o igual a 0.");
      return;
    }

    setFeedback(null);
    setError(null);
    setIsVariantImageSaving(true);

    const formData = new FormData();
    formData.append("file", variantImageFile);
    formData.append("sortOrder", String(parsedSortOrder));
    if (variantImageAltText.trim()) {
      formData.append("altText", variantImageAltText.trim());
    }

    try {
      const response = await fetch(
        `/api/products/variants/${selectedVariantIdForImages}/images/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "No se pudo subir la imagen de variante.")
        );
      }

      setFeedback("Imagen de variante subida correctamente.");
      setVariantImageAltText("");
      setVariantImageSortOrder("0");
      setVariantImageFile(null);
      setVariantImageInputKey((current) => current + 1);
      await refreshVariantImages(selectedVariantIdForImages);
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo subir la imagen de variante."
      );
    } finally {
      setIsVariantImageSaving(false);
    }
  };

  const handleDeleteVariantImage = async (imageId: string) => {
    setFeedback(null);
    setError(null);
    setIsVariantImageSaving(true);

    try {
      const response = await fetch(`/api/products/variant-images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "No se pudo eliminar la imagen de variante.")
        );
      }

      setFeedback("Imagen de variante eliminada.");
      if (selectedVariantIdForImages) {
        await refreshVariantImages(selectedVariantIdForImages);
      }
      await refreshData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo eliminar la imagen de variante."
      );
    } finally {
      setIsVariantImageSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {catalogStatCard({
          title: "Productos",
          value: products.length,
          detail: "Total en catalogo",
        })}
        {catalogStatCard({
          title: "Activos",
          value: products.filter((product) => product.active).length,
          detail: "Visibles para operacion",
        })}
        {catalogStatCard({
          title: "Con renta",
          value: products.filter((product) => product.allowsRental).length,
          detail: "Habilitados para alquiler",
        })}
        {catalogStatCard({
          title: "Variantes",
          value: products.reduce(
            (accumulator, product) => accumulator + product.variants.length,
            0
          ),
          detail: "Combinaciones registradas",
        })}
      </div>

      {catalogPanel({
        eyebrow: "Alta de producto",
        title: "Registrar producto base",
        children: (
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Nombre
                <input
                  value={productDraft.nombre}
                  onChange={(event) => {
                    const nombre = event.target.value;
                    setProductDraft((current) => ({
                      ...current,
                      nombre,
                      slug: isSlugManuallyEdited ? current.slug : toSlug(nombre),
                    }));
                  }}
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Slug
                <input
                  value={productDraft.slug}
                  onChange={(event) => {
                    setIsSlugManuallyEdited(true);
                    setProductDraft((current) => ({
                      ...current,
                      slug: toSlug(event.target.value),
                    }));
                  }}
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Tipo
                <select
                  value={productDraft.kind}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      kind: event.target.value as ProductDraft["kind"],
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                >
                  {PRODUCT_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Marca
                <select
                  value={productDraft.brandId}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      brandId: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                >
                  <option value="">Sin marca</option>
                  {brands
                    .filter((brand) => brand.activo)
                    .map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.nombre}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Descripcion
              <textarea
                value={productDraft.descripcion}
                onChange={(event) =>
                  setProductDraft((current) => ({
                    ...current,
                    descripcion: event.target.value,
                  }))
                }
                rows={3}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
              />
            </label>

            <TooltipProvider>
              <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.allowsSale}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            allowsSale: event.target.checked,
                          }))
                        }
                      />
                      <ShoppingCart className="size-3.5 text-emerald-300" />
                      Venta
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Permite ofrecer este producto en el flujo de venta.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.allowsRental}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            allowsRental: event.target.checked,
                          }))
                        }
                      />
                      <RefreshCw className="size-3.5 text-cyan-300" />
                      Renta
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Incluye este producto en alquiler y unidades de renta.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.allowsCustomization}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            allowsCustomization: event.target.checked,
                          }))
                        }
                      />
                      <SlidersHorizontal className="size-3.5 text-violet-300" />
                      Personalizacion
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Activa opciones de personalizacion para pedidos a medida.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.requiresMeasurement}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            requiresMeasurement: event.target.checked,
                          }))
                        }
                      />
                      <Ruler className="size-3.5 text-amber-300" />
                      Medidas
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Exige perfil de medidas vigente para avanzar en confeccion.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.isFeatured}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            isFeatured: event.target.checked,
                          }))
                        }
                      />
                      <Star className="size-3.5 text-amber-200" />
                      Destacado
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Prioriza este producto en vitrinas o secciones especiales.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.isNew}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            isNew: event.target.checked,
                          }))
                        }
                      />
                      <Sparkles className="size-3.5 text-fuchsia-300" />
                      Nuevo
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Identifica prendas nuevas para campanas y filtros.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={productDraft.active}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            active: event.target.checked,
                          }))
                        }
                      />
                      <Power className="size-3.5 text-emerald-300" />
                      Activo
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Si esta inactivo, deja de mostrarse en flujos operativos.
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <p className="text-xs text-stone-500">
              Medidas: si esta activo, el flujo de ordenes tratara esta prenda como
              dependiente de perfil de medidas vigente del cliente.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
            >
              {isSaving ? "Guardando..." : "Crear producto"}
            </button>
          </form>
        ),
      })}

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Productos registrados</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, slug, sku..."
              className="w-64 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-stone-500"
            />
            <button
              type="button"
              onClick={() => void refreshData()}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
            >
              Actualizar
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando productos...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Producto</th>
                  <th className="px-3 py-3 font-medium">Tipo</th>
                  <th className="px-3 py-3 font-medium">Marca</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Variantes</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-stone-500">
                      No hay productos para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-white/6 align-top">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{product.nombre}</p>
                        <p className="mt-1 text-xs text-stone-500">{product.slug}</p>
                      </td>
                      <td className="px-3 py-4 text-stone-300">{product.kind}</td>
                      <td className="px-3 py-4 text-stone-300">
                        {product.brand?.nombre ?? "Sin marca"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1 text-xs">
                          <div
                            className={`inline-flex rounded-full border px-2.5 py-1 uppercase tracking-[0.18em] ${
                              product.active
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                : "border-white/12 bg-white/[0.03] text-stone-400"
                            }`}
                          >
                            {product.active ? "Activo" : "Inactivo"}
                          </div>
                          <p className="text-stone-500">
                            {product.allowsSale ? "Venta" : "Sin venta"} |{" "}
                            {product.allowsRental ? "Renta" : "Sin renta"}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-xs text-stone-400">
                        <p>{product.variants.length} variante(s)</p>
                        <p className="mt-1">{buildPriceRange(product.variants)}</p>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProductId((current) =>
                                current === product.id ? null : product.id
                              )
                            }
                            className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/20"
                          >
                            {selectedProductId === product.id
                              ? "Cerrar variantes"
                              : "Variantes"}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleToggleProductActive(product)}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {product.active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleToggleProductRental(product)}
                            className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {product.allowsRental ? "Quitar renta" : "Habilitar renta"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {selectedProduct ? (
        <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Variantes
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {selectedProduct.nombre}
          </h2>

          <form onSubmit={handleCreateVariant} className="mt-5 space-y-4">
            <div
              className={`grid gap-3 ${
                requiresSecondarySize ? "md:grid-cols-5" : "md:grid-cols-4"
              }`}
            >
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                SKU
                <input
                  value={variantDraft.sku}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                {primarySizeLabel}
                <input
                  value={variantDraft.talla}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      talla: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                />
              </label>
              {requiresSecondarySize ? (
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Talla de pantalon
                  <input
                    value={variantDraft.tallaSecundaria}
                    onChange={(event) =>
                      setVariantDraft((current) => ({
                        ...current,
                        tallaSecundaria: event.target.value,
                      }))
                    }
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                    required
                  />
                </label>
              ) : null}
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Nombre de color
                <input
                  value={variantDraft.color}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Codigo HEX
                <div className="flex items-center gap-2">
                  <input
                    value={variantDraft.colorCodigo}
                    onChange={(event) =>
                      setVariantDraft((current) => ({
                        ...current,
                        colorCodigo: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="#1A2B3C"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white placeholder:text-stone-500"
                  />
                  <input
                    type="color"
                    value={isHexColor(variantDraft.colorCodigo) ? variantDraft.colorCodigo : "#000000"}
                    onChange={(event) =>
                      setVariantDraft((current) => ({
                        ...current,
                        colorCodigo: event.target.value.toUpperCase(),
                      }))
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-white/[0.02] p-1"
                    aria-label="Selector de color HEX"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Stock
                <input
                  type="number"
                  min={0}
                  value={variantDraft.stock}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Stock minimo
                <input
                  type="number"
                  min={0}
                  value={variantDraft.minStock}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      minStock: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Precio venta
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={variantDraft.salePrice}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      salePrice: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Precio referencial
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={variantDraft.compareAtPrice}
                  onChange={(event) =>
                    setVariantDraft((current) => ({
                      ...current,
                      compareAtPrice: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-stone-300">
              <input
                type="checkbox"
                checked={variantDraft.active}
                onChange={(event) =>
                  setVariantDraft((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Variante activa
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/50"
            >
              {isSaving ? "Guardando..." : "Crear variante"}
            </button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 font-medium">Tallas</th>
                  <th className="px-3 py-3 font-medium">Color</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Precio</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {selectedProduct.variants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-stone-500">
                      Aun no hay variantes para este producto.
                    </td>
                  </tr>
                ) : (
                  selectedProduct.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-white/6">
                      <td className="px-3 py-3 text-stone-200">{variant.sku}</td>
                      <td className="px-3 py-3 text-stone-400">
                        {formatVariantSizes(variant, selectedProductKind)}
                      </td>
                      <td className="px-3 py-3 text-stone-300">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex size-4 rounded-full border border-white/20"
                            style={{
                              backgroundColor:
                                variant.colorCodigo && isHexColor(variant.colorCodigo)
                                  ? variant.colorCodigo
                                  : "transparent",
                            }}
                          />
                          <div className="leading-tight">
                            <p className="text-xs">{variant.color ?? "Sin nombre"}</p>
                            <p className="text-[11px] text-stone-500">
                              {variant.colorCodigo ?? "Sin HEX"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-stone-400">
                        {variant.stock} (min {variant.minStock})
                      </td>
                      <td className="px-3 py-3 text-stone-400">
                        {formatMoney(variant.salePrice)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                            variant.active
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                              : "border-white/12 bg-white/[0.03] text-stone-400"
                          }`}
                        >
                          {variant.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void handleToggleVariantActive(variant)}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {variant.active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                  Imagenes por variante
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Subir imagen de variante
                </h3>
              </div>
              <label className="flex flex-col gap-1 text-xs text-stone-300">
                Variante
                <select
                  value={selectedVariantIdForImages}
                  onChange={(event) => setSelectedVariantIdForImages(event.target.value)}
                  className="min-w-64 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                >
                  {selectedProduct.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.sku} - {formatVariantSizes(variant, selectedProductKind)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedVariantForImages ? (
              <form
                onSubmit={handleUploadVariantImage}
                className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_0.5fr_auto]"
              >
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Archivo
                  <input
                    key={variantImageInputKey}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={(event) =>
                      setVariantImageFile(event.target.files?.[0] ?? null)
                    }
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white file:mr-2 file:rounded-md file:border-0 file:bg-cyan-500 file:px-2 file:py-1 file:text-xs file:font-medium file:text-black"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Alt text (opcional)
                  <input
                    value={variantImageAltText}
                    onChange={(event) => setVariantImageAltText(event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Orden
                  <input
                    type="number"
                    min={0}
                    value={variantImageSortOrder}
                    onChange={(event) => setVariantImageSortOrder(event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-white"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isVariantImageSaving}
                  className="inline-flex h-[42px] items-center justify-center gap-2 self-end rounded-xl bg-cyan-500 px-4 text-sm font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/50"
                >
                  <ImagePlus className="size-4" />
                  {isVariantImageSaving ? "Subiendo..." : "Subir"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                Esta variante no esta seleccionada.
              </p>
            )}

            {isVariantImagesLoading ? (
              <p className="mt-4 text-sm text-stone-400">Cargando imagenes...</p>
            ) : variantImages.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">
                Aun no hay imagenes para la variante seleccionada.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {variantImages.map((image) => (
                  <article
                    key={image.id}
                    className="rounded-xl border border-white/10 bg-black/25 p-3"
                  >
                    <div className="h-36 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      <img
                        src={image.url}
                        alt={image.altText ?? "Imagen de variante"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="text-xs text-stone-300">
                        <p>{image.altText ?? "Sin alt text"}</p>
                        <p className="mt-1 text-stone-500">Orden: {image.sortOrder}</p>
                      </div>
                      <button
                        type="button"
                        disabled={isVariantImageSaving}
                        onClick={() => void handleDeleteVariantImage(image.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-300/25 bg-rose-300/10 p-2 text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Eliminar imagen de variante"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </article>
      ) : null}

      {feedback ? (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </section>
  );
}
