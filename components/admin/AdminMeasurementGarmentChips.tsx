"use client";

import { useState } from "react";
import { MeasurementValuesModal } from "@/components/admin/AdminMeasurementValuesForm";
import type { MeasurementGarmentType } from "@/components/admin/AdminMeasurementValuesForm";
import { GARMENT_LABELS } from "@/components/admin/customers/measurement-garments";

export default function AdminMeasurementGarmentChips({
  profileId,
  customerName,
  garments,
}: {
  profileId: number;
  customerName: string;
  garments: string[];
}) {
  const [activeGarment, setActiveGarment] = useState<MeasurementGarmentType | null>(null);

  if (!garments.length) {
    return <p className="mt-2 text-sm text-white">Sin prendas</p>;
  }

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {garments.map((garment) => (
          <button
            key={garment}
            onClick={() => setActiveGarment(garment as MeasurementGarmentType)}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white transition hover:bg-white/10"
          >
            {GARMENT_LABELS[garment as MeasurementGarmentType] ?? garment.toLowerCase()}
          </button>
        ))}
      </div>

      {activeGarment ? (
        <MeasurementValuesModal
          profileId={profileId}
          customerName={customerName}
          garmentType={activeGarment}
          onClose={() => setActiveGarment(null)}
        />
      ) : null}
    </>
  );
}

