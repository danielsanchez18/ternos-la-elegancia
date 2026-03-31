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
  Search,
  Filter,
} from "lucide-react";

import {
  apiGet,
  apiPatch,
  apiPost,
  parseApiError,
} from "@/components/admin/catalog/api";
import { catalogPanel } from "@/components/admin/catalog/catalog-ui";
import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
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
  const [kindFilter, setKindFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    return products.filter((product) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch = !normalizedSearch || [
        product.nombre,
        product.slug,
        product.kind,
        product.brand?.nombre ?? "",
        ...product.variants.map((v) => v.sku),
      ].some(text => text.toLowerCase().includes(normalizedSearch));

      const matchesKind = kindFilter === "all" || product.kind === kindFilter;
      const matchesBrand = brandFilter === "all" || product.brandId === brandFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? product.active : !product.active);

      return matchesSearch && matchesKind && matchesBrand && matchesStatus;
    });
  }, [products, search, kindFilter, brandFilter, statusFilter]);

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
      <Panel eyebrow="Alta de producto" title="Registrar producto base">
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
                className="rounded-lg border border-white/10 bg-white/2 px-2.5 py-2 text-sm text-white"
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
                className="rounded-lg border border-white/10 bg-white/2 px-2.5 py-2 text-sm text-white"
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
                className="rounded-lg border border-white/10 bg-white/2 px-2.5 py-2 text-sm text-white"
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
                className="rounded-lg border border-white/10 bg-white/2 px-2.5 py-2 text-sm text-white"
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
              className="rounded-lg border border-white/10 bg-white/2 px-2.5 py-2 text-sm text-white"
            />
          </label>

          <TooltipProvider>
            <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
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

          <footer className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Nota: Las prendas marcadas con [Medidas] requerirán perfil de sastre para su venta.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
            >
              {isSaving ? "Guardando..." : "Crear producto"}
            </button>
          </footer>
        </form>
      </Panel>

      <Panel eyebrow="Maestro" title="Listado operativo de catálogo">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, slug, sku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
              >
                <option value="all">Tipos: Todos</option>
                {PRODUCT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
            </div>

            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
              >
                <option value="all">Marcas: Todas</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
              >
                <option value="all">Estado: Todos</option>
                <option value="active">Solo Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center animate-pulse">
            <p className="text-sm text-stone-500 font-mono">Cargando catálogo maestro...</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500 uppercase tracking-widest text-[10px]">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Producto</th>
                  <th className="px-3 py-3 font-medium">Tipo / Marca</th>
                  <th className="px-3 py-3 font-medium text-center">Estado</th>
                  <th className="px-3 py-3 font-medium">Variantes / Precio</th>
                  <th className="px-3 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-20 text-center text-stone-500">
                      No se encontraron productos coincidentes.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-white/2 group">
                      <td className="px-3 py-6">
                        <p className="text-base font-semibold text-white">{product.nombre}</p>
                        <p className="mt-1 font-mono text-[10px] text-emerald-400/60 uppercase tracking-tighter">
                          {product.slug}
                        </p>
                      </td>
                      <td className="px-3 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] w-fit rounded-md bg-stone-800/80 px-2 py-0.5 font-bold text-stone-300 border border-white/5">
                            {product.kind}
                          </span>
                          <span className="text-xs text-stone-500">
                            {product.brand?.nombre ?? "Sin marca asociada"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-6 text-center">
                        <div
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${product.active
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-stone-500"
                            }`}
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </div>
                      </td>
                      <td className="px-3 py-6">
                        <div className="flex flex-col gap-1 text-xs">
                          <p className="text-stone-300">{product.variants.length} variantes</p>
                          <p className="font-semibold text-emerald-200">
                            {buildPriceRange(product.variants)}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId(current => current === product.id ? null : product.id)}
                            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${selectedProductId === product.id
                              ? "border-white/20 bg-white/10 text-white"
                              : "border-white/10 bg-white/5 text-stone-300 hover:bg-white/10"
                              }`}
                          >
                            Variantes
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleProductActive(product)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-stone-300 transition hover:bg-white/10"
                          >
                            {product.active ? "Pausar" : "Activar"}
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
      </Panel>

      {selectedProduct && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Panel eyebrow="Variantes" title={`Configuración de ${selectedProduct.nombre}`}>
            <form onSubmit={handleCreateVariant} className="space-y-6">
              <div
                className={`grid gap-4 ${requiresSecondarySize ? "md:grid-cols-5" : "md:grid-cols-4"
                  }`}
              >
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  SKU / ID Interno
                  <input
                    value={variantDraft.sku}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, sku: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  {primarySizeLabel}
                  <input
                    value={variantDraft.talla}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, talla: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                {requiresSecondarySize && (
                  <label className="flex flex-col gap-1 text-xs text-stone-300">
                    Talla Pantalón
                    <input
                      value={variantDraft.tallaSecundaria}
                      onChange={(e) => setVariantDraft(curr => ({ ...curr, tallaSecundaria: e.target.value }))}
                      className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                      required
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Nombre Color
                  <input
                    value={variantDraft.color}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, color: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Mix Color (HEX)
                  <div className="flex gap-2">
                    <input
                      value={variantDraft.colorCodigo}
                      onChange={(e) => setVariantDraft(curr => ({ ...curr, colorCodigo: e.target.value.toUpperCase() }))}
                      className="w-full rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm uppercase text-white"
                      placeholder="#000000"
                    />
                    <input
                      type="color"
                      value={isHexColor(variantDraft.colorCodigo) ? variantDraft.colorCodigo : "#000000"}
                      onChange={(e) => setVariantDraft(curr => ({ ...curr, colorCodigo: e.target.value.toUpperCase() }))}
                      className="size-[42px] cursor-pointer rounded-lg border border-white/10 bg-white/2 p-1"
                    />
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Stock Actual
                  <input
                    type="number"
                    value={variantDraft.stock}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, stock: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Alerta Stock Mín.
                  <input
                    type="number"
                    value={variantDraft.minStock}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, minStock: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-300">
                  Precio de Venta
                  <input
                    type="number"
                    step="0.01"
                    value={variantDraft.salePrice}
                    onChange={(e) => setVariantDraft(curr => ({ ...curr, salePrice: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/2 px-3 py-2.5 text-sm text-white font-bold"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-[42px] items-center justify-center self-end rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  Registrar Variante
                </button>
              </div>
            </form>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500 uppercase tracking-widest text-[9px]">
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-3 font-medium">SKU</th>
                    <th className="px-3 py-3 font-medium text-center">Color</th>
                    <th className="px-3 py-3 font-medium text-center">Stock</th>
                    <th className="px-3 py-3 font-medium text-center">Precio</th>
                    <th className="px-3 py-3 font-medium text-right">Estado / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedProduct.variants.map((v) => (
                    <tr key={v.id} className="group hover:bg-white/1">
                      <td className="px-3 py-4">
                        <p className="font-mono text-xs text-white">{v.sku}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{formatVariantSizes(v, selectedProductKind)}</p>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className="size-4 rounded-full border border-white/10 ring-1 ring-white/5 shadow-inner"
                            style={{ backgroundColor: (isHexColor(v.colorCodigo ?? "") && v.colorCodigo) || "transparent" }}
                          />
                          <span className="text-[10px] text-stone-400">{v.color ?? "--"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <p className={`text-xs ${Number(v.stock) <= Number(v.minStock) ? "text-rose-400 font-bold" : "text-stone-300"}`}>
                          {v.stock}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-center text-emerald-200/80 font-mono text-xs">
                        {formatMoney(v.salePrice)}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={() => void handleToggleVariantActive(v)}
                          className={`rounded-lg px-2 py-1 text-[10px] uppercase font-bold tracking-tighter transition ${v.active ? "text-stone-500 hover:text-rose-300" : "text-emerald-500 hover:text-emerald-400"
                            }`}
                        >
                          {v.active ? "Desactivar" : "Reactivar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 rounded-2xl border border-white/5 bg-black/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-white">Galería de Imágenes</h4>
                  <p className="text-xs text-stone-500 mt-1">Sube hasta 5 fotos por variante de producto.</p>
                </div>
                <select
                  value={selectedVariantIdForImages}
                  onChange={(e) => setSelectedVariantIdForImages(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-200 outline-none"
                >
                  {selectedProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.sku} - {formatVariantSizes(v, selectedProductKind)}</option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleUploadVariantImage} className="mt-8 flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <input
                    key={variantImageInputKey}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVariantImageFile(e.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-xl border border-dashed border-white/10 bg-white/2 p-4 text-xs text-stone-400 transition hover:border-emerald-500/50"
                  />
                </div>
                <div className="w-48">
                  <p className="mb-1.5 text-[10px] text-stone-500 uppercase tracking-widest pl-1">Alt Text</p>
                  <input
                    value={variantImageAltText}
                    onChange={(e) => setVariantImageAltText(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVariantImageSaving}
                  className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2"
                >
                  <ImagePlus className="size-4" />
                  {isVariantImageSaving ? "Subiendo..." : "Añadir"}
                </button>
              </form>

              {isVariantImagesLoading ? (
                <div className="mt-8 h-32 flex items-center justify-center border border-white/5 rounded-2xl bg-white/2 animate-pulse">
                  <p className="text-xs text-stone-600 uppercase tracking-widest">Cargando galería...</p>
                </div>
              ) : variantImages.length === 0 ? (
                <div className="mt-8 p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/1">
                  <p className="text-sm text-stone-500">No hay imágenes configuradas para esta variante.</p>
                </div>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {variantImages.map((img) => (
                    <article key={img.id} className="relative group rounded-xl overflow-hidden aspect-3/4 border border-white/10 bg-black shadow-2xl">
                      <img src={img.url} alt={img.altText ?? ""} className="size-full object-cover transition duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100 flex flex-col justify-end p-3">
                        <button
                          onClick={() => void handleDeleteVariantImage(img.id)}
                          className="w-full rounded-lg bg-rose-500/80 p-2 text-white text-[10px] font-bold uppercase backdrop-blur-sm transition hover:bg-rose-500"
                        >
                          Eliminar Foto
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
          <p className="text-sm text-rose-300">Error: {error}</p>
        </div>
      ) : null}

      {feedback ? (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
            <Sparkles className="size-4" />
            {feedback}
          </p>
        </div>
      ) : null}
    </section>
  );
}
