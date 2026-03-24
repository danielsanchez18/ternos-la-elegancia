"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import Link from "next/link";
import { 
  Ruler, 
  Calendar, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  History,
  Info,
  ChevronDown,
  ArrowRight,
  Plus,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminCreateMeasurementProfileForm from "@/components/admin/AdminCreateMeasurementProfileForm";
import AdminMeasurementProfileActions from "@/components/admin/AdminMeasurementProfileActions";
import type { MeasurementProfileActionData } from "@/components/admin/AdminMeasurementProfileActions";
import { MeasurementValuesModal } from "@/components/admin/AdminMeasurementValuesForm";
import type { MeasurementGarmentType } from "@/components/admin/AdminMeasurementValuesForm";
import { formatDate } from "@/components/admin/customers/formatters";

interface AdminCustomerMeasurementsViewProps {
  customerId: number;
  customerName: string;
  profiles: any[];
}

export default function AdminCustomerMeasurementsView({ 
  customerId, 
  customerName, 
  profiles 
}: AdminCustomerMeasurementsViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGarment, setEditingGarment] = useState<{ profileId: number; garmentType: MeasurementGarmentType } | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Header & Back */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/clientes/perfil/${customerId}`}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 hover:bg-white/[0.06] hover:text-white transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Expediente de Medidas</span>
              <ChevronRight className="size-3 text-stone-700" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">{customerName}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Mediciones</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? "ghost" : "outline"} 
            className={isCreating ? "text-stone-400 hover:text-white" : "border-white/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}
          >
            {isCreating ? (
              <>
                <X className="mr-2 size-4" />
                Cancelar
              </>
            ) : (
              <>
                <Calendar className="mr-2 size-4" />
                Nueva Toma de Medidas
              </>
            )}
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="max-w-4xl mx-auto">
          <AdminCreateMeasurementProfileForm 
            customerId={customerId} 
            customerName={customerName} 
            onSuccess={() => {
              setIsCreating(false);
            }}
          />
        </div>
      )}

      <div className="grid gap-8">
        {profiles.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02] py-24 text-center">
            <Ruler className="size-16 text-stone-700 mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-semibold text-stone-400">Sin registros de medidas</h3>
            <p className="mt-2 text-stone-500 max-w-sm mx-auto">Este cliente aún no cuenta con un historial de mediciones técnicas para confección.</p>
            {!isCreating && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="mt-8 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                <Plus className="mr-2 size-4" />
                Registrar Primer Perfil
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {profiles.map((profile, idx) => (
              <section key={profile.id} className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] overflow-hidden">
                {/* Profile Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`rounded-2xl p-4 ${profile.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-stone-500/10 text-stone-500"}`}>
                      <History className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-xl font-bold text-white leading-none">Perfil del {formatDate(profile.takenAt)}</h3>
                         {idx === 0 && profile.isActive && (
                           <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Vigente</span>
                         )}
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-2">
                        <Clock className="size-3" />
                        Vence el {formatDate(profile.validUntil)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {profile.notes && (
                      <div className="hidden lg:flex max-w-md px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 items-start gap-3">
                        <Info className="size-4 text-stone-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-stone-400 leading-relaxed italic">"{profile.notes}"</p>
                      </div>
                    )}
                    
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

                {/* Garments & Values Grid */}
                <div className="p-8 grid gap-6 grid-cols-1">
                  {profile.garments.map((garment: any) => (
                    <div 
                      key={garment.id} 
                      onClick={() => setEditingGarment({ profileId: profile.id, garmentType: garment.garmentType as MeasurementGarmentType })}
                      className="group cursor-pointer rounded-3xl border border-white/5 bg-black/20 p-6 space-y-5 transition hover:border-emerald-500/40 hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          {garment.garmentType.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-stone-600 uppercase tracking-[0.2em]">{garment.values.length} Medidas</span>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">Editar →</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-3">
                        {garment.values.map((v: any) => (
                          <div key={v.id} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest">{v.definition.label}</span>
                            <span className="text-sm font-semibold text-white">{v.value.toFixed(1)} <span className="text-[10px] text-stone-600 font-normal">cm</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {editingGarment && (
        <MeasurementValuesModal
          profileId={editingGarment.profileId}
          customerName={customerName}
          garmentType={editingGarment.garmentType}
          onClose={() => setEditingGarment(null)}
        />
      )}
    </div>
  );
}
