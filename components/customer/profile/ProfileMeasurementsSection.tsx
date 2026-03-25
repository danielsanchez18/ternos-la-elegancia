"use client";

import { useEffect, useState } from "react";

import {
  getMyMeasurementProfiles,
  type CustomerMeasurementProfile,
  type CustomerMeasurementValue,
} from "@/lib/storefront-customer-api";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatGarmentType(type: string): string {
  const map: Record<string, string> = {
    SACO: "Saco",
    PANTALON: "Pantalón",
    CAMISA: "Camisa",
    CHALECO: "Chaleco",
  };
  return map[type] ?? type;
}

export default function ProfileMeasurementsSection({
  customerId,
}: {
  customerId: string;
}) {
  const [profiles, setProfiles] = useState<CustomerMeasurementProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [profileValues, setProfileValues] = useState<
    Record<string, CustomerMeasurementValue[]>
  >({});
  const [loadingValues, setLoadingValues] = useState<Set<string>>(new Set());

  const toggleProfile = async (rowId: string, profileId: string, garmentType: string) => {
    setExpandedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
        return next;
      }
      next.add(rowId);
      return next;
    });

    if (!profileValues[rowId] && !expandedProfiles.has(rowId)) {
      setLoadingValues((prev) => new Set(prev).add(rowId));
      try {
        const { getMyMeasurementProfileValues } = await import("@/lib/storefront-customer-api");
        const data = await getMyMeasurementProfileValues(profileId, garmentType);
        setProfileValues((prev) => ({ ...prev, [rowId]: data.values }));
      } catch (err) {
        console.error("Failed to fetch values for profile", rowId, err);
      } finally {
        setLoadingValues((prev) => {
          const next = new Set(prev);
          next.delete(rowId);
          return next;
        });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const result = await getMyMeasurementProfiles(customerId);
        if (!isMounted) return;
        setProfiles(result);
      } catch {
        if (isMounted) setError("No se pudieron cargar tus medidas.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const activeProfiles = profiles.filter((p) => p.isActive);
  const inactiveProfiles = profiles.filter((p) => !p.isActive);

  return (
    <article className="border border-black/10 bg-white p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Mis medidas
      </p>
      <h2 className="mt-2 text-2xl font-oswald uppercase text-neutral-950">
        Perfiles de medidas
      </h2>

      {isLoading ? (
        <p className="mt-6 text-sm text-neutral-500">Cargando medidas...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-amber-700">{error}</p>
      ) : profiles.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          Aun no tienes perfiles de medidas. Se crearán cuando te tomen medidas en nuestro taller.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {activeProfiles.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Perfiles Activos
              </p>
              <div className="space-y-3">
                {activeProfiles.flatMap((profile) => 
                  profile.garments.map((garment) => {
                    const rowId = `${profile.id}-${garment.id}`;
                    const isExpanded = expandedProfiles.has(rowId);
                    const isValuesLoading = loadingValues.has(rowId);
                    const values = profileValues[rowId];

                    return (
                      <div key={rowId} className="border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => toggleProfile(rowId, profile.id, garment.garmentType)}
                          className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              Perfil de {formatGarmentType(garment.garmentType)}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              Creado: {formatDate(profile.takenAt || profile.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="inline-flex border border-emerald-300/30 bg-emerald-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-700">
                              Activo
                            </span>
                            <span className="text-neutral-400 text-xs">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 py-4 border-t border-neutral-200 bg-white">
                            <p className="text-xs font-semibold uppercase text-neutral-900 mb-3">Medidas Registradas</p>
                            {isValuesLoading ? (
                              <p className="text-sm text-neutral-500">Cargando valores...</p>
                            ) : !values || values.length === 0 ? (
                              <p className="text-sm text-neutral-500">No hay medidas registradas para esta prenda.</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {values.map((v) => (
                                  <div key={v.fieldLabel} className="bg-neutral-50 p-3 border border-neutral-100">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{v.fieldLabel}</p>
                                    <p className="text-sm font-medium text-neutral-900">
                                      {v.valueText || v.valueNumber?.toString() || "-"} {v.unit || ""}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {inactiveProfiles.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Historial (Inactivos)
              </p>
              <div className="space-y-3">
                {inactiveProfiles.flatMap((profile) => 
                  profile.garments.map((garment) => {
                    const rowId = `${profile.id}-${garment.id}`;
                    const isExpanded = expandedProfiles.has(rowId);
                    const isValuesLoading = loadingValues.has(rowId);
                    const values = profileValues[rowId];

                    return (
                      <div key={rowId} className="border border-neutral-200 opacity-80">
                        <button
                          type="button"
                          onClick={() => toggleProfile(rowId, profile.id, garment.garmentType)}
                          className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-700">
                              Perfil de {formatGarmentType(garment.garmentType)}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              Creado: {formatDate(profile.takenAt || profile.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="inline-flex border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                              Inactivo
                            </span>
                            <span className="text-neutral-400 text-xs">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 py-4 border-t border-neutral-200 bg-white">
                            <p className="text-xs font-semibold uppercase text-neutral-700 mb-3">Medidas Registradas</p>
                            {isValuesLoading ? (
                              <p className="text-sm text-neutral-500">Cargando valores...</p>
                            ) : !values || values.length === 0 ? (
                              <p className="text-sm text-neutral-500">No hay medidas registradas para esta prenda.</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {values.map((v) => (
                                  <div key={v.fieldLabel} className="bg-neutral-50 p-3 border border-neutral-100 grayscale">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{v.fieldLabel}</p>
                                    <p className="text-sm font-medium text-neutral-700">
                                      {v.valueText || v.valueNumber?.toString() || "-"} {v.unit || ""}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
