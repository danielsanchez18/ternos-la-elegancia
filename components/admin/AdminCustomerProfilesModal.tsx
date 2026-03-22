"use client";

import { useState, useEffect } from "react";
import { X, Ruler } from "lucide-react";
import AdminMeasurementProfileActions from "@/components/admin/AdminMeasurementProfileActions";
import type { MeasurementProfileActionData } from "@/components/admin/AdminMeasurementProfileActions";
import AdminMeasurementGarmentChips from "@/components/admin/AdminMeasurementGarmentChips";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateFormatter.format(parsed) : "--";
}

function statusChipClasses(isPositive: boolean) {
  return isPositive
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-stone-500/20 bg-stone-500/10 text-stone-300";
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

// Simplificación del tipo que devuelve el endpoint
type ProfileResponse = {
  id: number;
  customerId: number;
  takenAt: string;
  validUntil: string;
  notes: string | null;
  isActive: boolean;
  garments: Array<{
    id: number;
    garmentType: string;
    values: any[];
  }>;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminCustomerProfilesModal({
  customerId,
  customerName,
  onClose,
}: {
  customerId: number;
  customerName: string;
  onClose: () => void;
}) {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchProfiles() {
      try {
        const res = await fetch(`/api/customers/${customerId}/measurement-profiles`);
        if (!res.ok) throw new Error("Error fetching profiles");
        
        const data = (await res.json()) as ProfileResponse[];
        if (active) {
          setProfiles(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError("No se pudieron cargar los perfiles.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchProfiles();

    return () => {
      active = false;
    };
  }, [customerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-4xl my-auto">
        <div className="rounded-[2rem] border border-white/8 bg-[#0e0e0e] flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/5 p-6 shrink-0">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Historial técnico
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Perfiles de medidas de {customerName}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4 text-sm text-rose-200">
                {error}
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-stone-500">
                Este cliente aún no tiene perfiles de medidas registrados.
              </div>
            ) : (
              <div className="grid gap-4">
                {profiles.map((profile) => {
                  const garmentTypes = profile.garments.map((g) => g.garmentType);
                  const totalValues = profile.garments.reduce(
                    (acc, g) => acc + g.values.length,
                    0
                  );

                  return (
                    <article
                      key={profile.id}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <Ruler className="size-4 text-emerald-200" />
                            <p className="text-base font-semibold text-white">
                              Recopilado el {formatDate(profile.takenAt)}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-stone-400">
                            Vigente hasta {formatDate(profile.validUntil)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${statusChipClasses(
                              profile.isActive
                            )}`}
                          >
                            {profile.isActive ? "Activo" : "Inactivo"}
                          </span>
                          <AdminMeasurementProfileActions
                            profile={
                              {
                                id: profile.id,
                                customerName,
                                notes: profile.notes,
                                isActive: profile.isActive,
                                validUntil: profile.validUntil,
                              } satisfies MeasurementProfileActionData
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Prendas
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {profile.garments.length}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Valores
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {totalValues}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                            Tipos
                          </p>
                          <AdminMeasurementGarmentChips
                            profileId={profile.id}
                            customerName={customerName}
                            garments={garmentTypes}
                          />
                        </div>
                      </div>

                      {profile.notes ? (
                        <p className="mt-4 text-sm leading-6 text-stone-400">
                          {profile.notes}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
