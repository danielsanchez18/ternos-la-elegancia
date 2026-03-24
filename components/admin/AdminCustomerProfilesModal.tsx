"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Ruler, X } from "lucide-react";
import AdminMeasurementGarmentChips from "@/components/admin/AdminMeasurementGarmentChips";
import AdminMeasurementProfileActions from "@/components/admin/AdminMeasurementProfileActions";
import type { MeasurementProfileActionData } from "@/components/admin/AdminMeasurementProfileActions";
import {
  formatDate,
  statusChipClasses,
} from "@/components/admin/customers/formatters";

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
        const response = await fetch(`/api/customers/${customerId}/measurement-profiles`);
        if (!response.ok) {
          throw new Error("Error fetching profiles");
        }

        const data = (await response.json()) as ProfileResponse[];
        if (active) {
          setProfiles(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los perfiles.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchProfiles();

    return () => {
      active = false;
    };
  }, [customerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 my-auto w-full max-w-4xl">
        <div className="flex max-h-[90vh] flex-col rounded-[2rem] border border-white/8 bg-[#0e0e0e]">
          <div className="shrink-0 border-b border-white/5 p-6">
            <div className="flex items-start justify-between">
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
          </div>

          <div className="overflow-y-auto p-6">
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
                  const garmentTypes = profile.garments.map((garment) => garment.garmentType);
                  const totalValues = profile.garments.reduce(
                    (total, garment) => total + garment.values.length,
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
                              profile.isActive,
                              "table"
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
