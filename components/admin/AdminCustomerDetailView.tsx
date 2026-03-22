"use client";

import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  Fingerprint, 
  Calendar, 
  ShoppingBag, 
  Ruler, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Plus,
  MessageSquare,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" });

interface AdminCustomerDetailViewProps {
  customer: any;
}

export default function AdminCustomerDetailView({ customer }: AdminCustomerDetailViewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Header & Back */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clientes/listado"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 hover:bg-white/[0.06] hover:text-white transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                customer.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-stone-500/20 bg-stone-500/10 text-stone-400"
              }`}>
                {customer.isActive ? "Cliente Activo" : "Cliente Inactivo"}
              </span>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest">Registrado {dateFormatter.format(new Date(customer.createdAt))}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{customer.fullName}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/admin/clientes/perfil/${customer.id}/medidas`}>
            <Button variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <Ruler className="mr-2 size-4" />
              Ver Medidas
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Info Card */}
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-8 space-y-6">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Información de Contacto</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="rounded-xl bg-white/5 p-2.5 text-stone-400">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-white truncate">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="rounded-xl bg-white/5 p-2.5 text-stone-400">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Celular</p>
                  <p className="text-white">{customer.celular || "No registrado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="rounded-xl bg-white/5 p-2.5 text-stone-400">
                  <Fingerprint className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">DNI / Documento</p>
                  <p className="text-white">{customer.dni}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-8 space-y-6">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Resumen de Actividad</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Ventas</p>
                <p className="text-2xl font-bold text-white">{customer.saleOrders.length}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Confecciones</p>
                <p className="text-2xl font-bold text-white">{customer.customOrders.length}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Center & Right Column: History/Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Combined */}
          <section className="rounded-[2rem] border border-white/8 bg-black/40 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Ordenes Recientes</h3>
                <p className="text-xs text-stone-500 mt-1">Últimos pedidos de venta y confección.</p>
              </div>
              <Link href="/admin/ordenes/venta" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition uppercase tracking-widest">Ver Todas</Link>
            </div>
            
            <div className="divide-y divide-white/5">
              {[...customer.saleOrders, ...customer.customOrders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((order: any) => (
                  <Link 
                    key={order.id + (order.total ? 's' : 'c')} 
                    href={`/admin/ordenes/${order.total ? 'venta' : 'personalizadas'}/${order.id}`}
                    className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-xl p-2.5 ${order.total ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        <ShoppingBag className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition">{order.code}</p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">
                          {order.total ? 'Venta Regular' : 'Confección a Medida'} · {dateFormatter.format(new Date(order.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">S/ {order.total?.toFixed(2) || "0.00"}</p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">{order.status.replace(/_/g, ' ')}</p>
                      </div>
                      <ChevronRight className="size-4 text-stone-700 group-hover:text-white transition" />
                    </div>
                  </Link>
                ))}
              
              {customer.saleOrders.length === 0 && customer.customOrders.length === 0 && (
                <div className="p-12 text-center text-stone-600 italic text-sm">
                  No se han registrado ordenes vinculadas a este cliente.
                </div>
              )}
            </div>
          </section>

          {/* Appointments & Notes grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Appointments */}
            <section className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Citas Recientes</h3>
                <Calendar className="size-4 text-stone-500" />
              </div>
              
              <div className="space-y-4">
                {customer.appointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-start gap-4">
                    <div className="shrink-0 rounded-full bg-indigo-500/10 p-1.5 mt-1">
                      <Clock className="size-3 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-200">{dateTimeFormatter.format(new Date(apt.scheduledAt))}</p>
                      <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider">{apt.type.replace(/_/g, ' ')} · {apt.status.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
                {customer.appointments.length === 0 && (
                  <p className="text-sm italic text-stone-600 py-4 text-center">No hay citas registradas</p>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Notas de Seguimiento</h3>
                <MessageSquare className="size-4 text-stone-500" />
              </div>
              
              <div className="space-y-5">
                {customer.notes.map((note: any) => (
                  <div key={note.id} className="space-y-2 border-l border-white/8 pl-4">
                    <p className="text-sm text-stone-300 leading-relaxed italic">"{note.note}"</p>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-widest">
                      <span>{note.adminUser?.nombres || "Admin"}</span>
                      <span>{dateFormatter.format(new Date(note.createdAt))}</span>
                    </div>
                  </div>
                ))}
                {customer.notes.length === 0 && (
                  <p className="text-sm italic text-stone-600 py-4 text-center">No hay notas registradas</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
