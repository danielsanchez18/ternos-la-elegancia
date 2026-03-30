"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, Clock } from "lucide-react";
import AdminCreateCustomerForm from "@/components/admin/AdminCreateCustomerForm";
import AdminCustomerActions from "@/components/admin/AdminCustomerActions";
import type { CustomerActionData } from "@/components/admin/AdminCustomerActions";
import AdminCustomerProfilesModal from "@/components/admin/AdminCustomerProfilesModal";
import {
  formatDate,
  formatDateTime,
  statusChipClasses,
} from "@/components/admin/customers/formatters";

type CustomerListItem = {
  id: number;
  fullName: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  orderCount: number;
  profileCount: number;
  notesCount: number;
  filesCount: number;
  validMeasurementUntil: Date | string | null;
  lastAppointmentAt: Date | string | null;
};

export default function AdminCustomerListLayout({
  customers,
}: {
  customers: CustomerListItem[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProfileCustomer, setSelectedProfileCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"recientes" | "a_z" | "z_a">("recientes");
  const [filterType, setFilterType] = useState<"todos" | "con_medidas" | "sin_medidas">("todos");

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.dni?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }

    if (filterType === "con_medidas") {
      result = result.filter((c) => Boolean(c.validMeasurementUntil));
    } else if (filterType === "sin_medidas") {
      result = result.filter((c) => !c.validMeasurementUntil);
    }

    if (sortOrder === "a_z") {
      result.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortOrder === "z_a") {
      result.sort((a, b) => b.fullName.localeCompare(a.fullName));
    }

    return result;
  }, [customers, searchQuery, filterType, sortOrder]);

  return (
    <div className="relative flex w-full flex-col items-start gap-4 overflow-hidden 2xl:flex-row">
      <AnimatePresence>
        {isFormOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0, x: -50 }}
            animate={{ opacity: 1, width: "380px", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -50 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full shrink-0 sm:w-[380px]"
          >
            <div className="w-full sm:w-[380px]">
              <AdminCreateCustomerForm onClose={() => setIsFormOpen(false)} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        className="min-w-0 w-full grow 2xl:w-auto"
      >
        <div className="flex min-w-0 flex-col rounded-[1.75rem] border border-white/8 bg-[#0e0e0e]">
          <div className="flex flex-col gap-4 border-b border-white/5 p-6 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Listado operativo de clientes
                </h3>
              </div>

              {!isFormOpen ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <UserPlus className="size-4" />
                  <span className="hidden sm:inline">Nuevo Cliente</span>
                </motion.button>
              ) : null}
            </div>

            {/* Filtros Rápido */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2 pl-4 pr-10 text-sm text-stone-300 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="todos">Todos los clientes</option>
                    <option value="con_medidas">Con medidas activas</option>
                    <option value="sin_medidas">Sin medidas (Vencidas)</option>
                  </select>
                  <SlidersHorizontal className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2 pl-4 pr-10 text-sm text-stone-300 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="recientes">Actividad Reciente</option>
                    <option value="a_z">Alfabético (A-Z)</option>
                    <option value="z_a">Alfabético (Z-A)</option>
                  </select>
                  {sortOrder === "recientes" && <Clock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500 pointer-events-none" />}
                  {sortOrder === "a_z" && <ArrowDownAZ className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500 pointer-events-none" />}
                  {sortOrder === "z_a" && <ArrowUpZA className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-500 pointer-events-none" />}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:px-8">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500">
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Medidas</th>
                    <th className="px-4 py-3 font-medium">Actividad</th>
                    <th className="px-4 py-3 font-medium">Expediente</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCustomers.length > 0 ? (
                    filteredAndSortedCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-white/6 align-top">
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/clientes/perfil/${customer.id}`}
                            className="font-medium text-white underline-offset-4 transition hover:text-emerald-400 hover:underline"
                          >
                            {customer.fullName}
                          </Link>
                          <p className="mt-1 text-xs text-stone-500">DNI {customer.dni}</p>
                        </td>
                        <td className="px-4 py-4 text-stone-300">
                          <p>{customer.email}</p>
                          <p className="mt-1 text-stone-500">
                            {customer.celular ?? "Sin celular"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${statusChipClasses(
                              customer.isActive,
                              "table"
                            )}`}
                          >
                            {customer.isActive ? "Activo" : "Inactivo"}
                          </span>
                          <p className="mt-2 text-xs text-stone-500">
                            Alta {formatDate(customer.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-stone-300">
                          <button
                            onClick={() =>
                              setSelectedProfileCustomer({
                                id: customer.id,
                                name: customer.fullName,
                              })
                            }
                            className="-ml-2 rounded-md bg-emerald-400/10 px-2 py-0.5 font-medium text-emerald-300 transition hover:text-emerald-200"
                          >
                            {customer.profileCount} perfiles
                          </button>
                          <p className="mt-1 text-stone-500">
                            {customer.validMeasurementUntil
                              ? `Vigente hasta ${formatDate(customer.validMeasurementUntil)}`
                              : "Sin perfil vigente"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-stone-300">
                          <p>{customer.orderCount} ordenes</p>
                          <p className="mt-1 text-stone-500">
                            {customer.lastAppointmentAt
                              ? `Ultima cita ${formatDateTime(customer.lastAppointmentAt)}`
                              : "Sin citas registradas"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-stone-300">
                          <p>{customer.notesCount} notas</p>
                          <p className="mt-1 text-stone-500">{customer.filesCount} archivos</p>
                        </td>
                        <td className="px-4 py-4">
                          <AdminCustomerActions
                            customer={
                              {
                                id: customer.id,
                                nombres: customer.nombres,
                                apellidos: customer.apellidos,
                                email: customer.email,
                                celular: customer.celular,
                                dni: customer.dni,
                                isActive: customer.isActive,
                              } satisfies CustomerActionData
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-stone-500">
                        No se encontraron clientes que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {selectedProfileCustomer ? (
        <AdminCustomerProfilesModal
          customerId={selectedProfileCustomer.id}
          customerName={selectedProfileCustomer.name}
          onClose={() => setSelectedProfileCustomer(null)}
        />
      ) : null}
    </div>
  );
}
