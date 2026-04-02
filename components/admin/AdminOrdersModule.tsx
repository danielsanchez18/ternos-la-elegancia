"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ScissorsLineDashed,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  History,
  TrendingUp,
  FileText
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
import { formatMediumDate, formatStatusLabel, numberFormatter } from "@/components/admin/orders/custom-order-shared";
import AdminCustomOrderListLayout from "@/components/admin/AdminCustomOrderListLayout";
import AdminRentalOrdersSubroute from "@/components/admin/orders/admin-rental-orders-subroute";
import AdminAlterationOrdersSubroute from "@/components/admin/orders/admin-alteration-orders-subroute";
import AdminAlterationServicesSubroute from "@/components/admin/orders/admin-alteration-services-subroute";

const TABS = [
  { id: "resumen", label: "Resumen", icon: Package, href: "/admin/ordenes" },
  { id: "personalizadas", label: "Personalizadas", icon: ScissorsLineDashed, href: "/admin/ordenes/personalizadas" },
  { id: "rentas", label: "Alquiler", icon: History, href: "/admin/ordenes/rentas" },
  { id: "alteraciones", label: "Alteraciones", icon: Clock, href: "/admin/ordenes/alteraciones" },
  { id: "servicios", label: "Servicios", icon: FileText, href: "/admin/ordenes/servicios" },
];

function AdminOrdersSharedLayout({
  children,
  activeTab
}: {
  children: React.ReactNode;
  activeTab: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-500 font-bold ml-1">Operaciones</p>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-1">Gestión de Órdenes</h1>
        </div>

        <nav className="flex items-center gap-1 border-b border-white/5 pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300"
                  }`}
              >
                <tab.icon className={`size-3.5 ${isActive ? "text-emerald-400" : "text-stone-500"}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabOrders"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {children}
      </main>
    </div>
  );
}

export function AdminOrdersSection() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch("/api/admin/orders/overview", { credentials: "include" });
        if (response.ok) {
          const payload = await response.json();
          setData(payload);
        }
      } catch (err) {
        console.error("Error fetching orders overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchOverview();
  }, []);

  if (isLoading) return <div className="py-20 text-center animate-pulse text-stone-500 font-mono text-xs uppercase tracking-widest">Sincronizando operaciones...</div>;
  if (!data) return <div className="py-20 text-center text-stone-500">No se pudieron cargar los datos de operaciones.</div>;

  const totalOther = Number(data.otherOrders.sales) + Number(data.otherOrders.rentals);

  return (
    <AdminOrdersSharedLayout activeTab="resumen">
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard title="Total Personalizadas" value={data.customOrders.total} detail="Pedidos a medida registrados" />
          <AdminStatCard title="En Confección" value={data.customOrders.active} detail="Prendas en taller o pruebas" />
          <AdminStatCard title="Para Entrega" value={data.customOrders.ready} detail="Pedidos listos para cliente" />
          <AdminStatCard title="Otras Órdenes" value={totalOther} detail={`${data.otherOrders.sales} Ventas, ${data.otherOrders.rentals} Rentas`} />
        </div>

        <Panel eyebrow="Actividad" title="Últimos Pedidos a Medida">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-stone-600 border-b border-white/5">
                <tr>
                  <th className="px-2 py-4 font-bold">Orden / Cliente</th>
                  <th className="px-2 py-4 font-bold text-center">Estado</th>
                  <th className="px-2 py-4 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.customOrders.recent.length > 0 ? data.customOrders.recent.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-2 py-5">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{order.code}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{order.customer.nombres} {order.customer.apellidos}</p>
                    </td>
                    <td className="px-2 py-5 text-center">
                      <span className="inline-flex rounded-lg bg-black/40 border border-white/5 px-2 py-1 text-[10px] font-bold text-stone-400 uppercase">
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-2 py-5 text-right font-mono text-emerald-400 font-bold">
                      S/ {Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-10 text-center text-stone-600 italic">No hay actividad reciente</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <Link href="/admin/ordenes/personalizadas" className="text-[11px] font-bold uppercase tracking-[.2em] text-emerald-400 hover:text-emerald-300 transition-colors">
              Ver todas las confecciones →
            </Link>
          </div>
        </Panel>
      </div>
    </AdminOrdersSharedLayout>
  );
}

export function AdminOrdersSubroute({ subroute }: { subroute: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubrouteData = async () => {
    if (subroute !== "personalizadas") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/orders/custom-list", { credentials: "include" });
      if (response.ok) {
        const payload = await response.json();
        setData(payload);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchSubrouteData(); }, [subroute]);

  const renderContent = () => {
    if (isLoading) return <div className="py-20 text-center animate-pulse text-stone-600 font-mono text-[10px] uppercase tracking-[0.3em]">Cargando módulo operativo...</div>;

    switch (subroute) {
      case "personalizadas":
        return <AdminCustomOrderListLayout orders={data || []} />;
      case "rentas":
        return <AdminRentalOrdersSubroute />;
      case "alteraciones":
        return <AdminAlterationOrdersSubroute />;
      case "servicios":
        return <AdminAlterationServicesSubroute />;
      default:
        return (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-stone-500 italic">Módulo pròximamente disponible</p>
          </div>
        );
    }
  };

  return (
    <AdminOrdersSharedLayout activeTab={subroute}>
      {renderContent()}
    </AdminOrdersSharedLayout>
  );
}
