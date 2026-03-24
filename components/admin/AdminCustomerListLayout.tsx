"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus } from "lucide-react";
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

  return (
    <div className="relative flex w-full flex-col items-start gap-4 overflow-hidden 2xl:flex-row">
      <AnimatePresence>
        {isFormOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0, x: -50 }}
            animate={{ opacity: 1, width: "380px", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -50 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full flex-shrink-0 sm:w-[380px]"
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
        className="min-w-0 w-full flex-grow 2xl:w-auto"
      >
        <div className="flex min-w-0 flex-col rounded-[1.75rem] border border-white/8 bg-[#0e0e0e]">
          <div className="flex items-center justify-between border-b border-white/5 p-6 md:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Maestro
              </p>
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
                  {customers.map((customer) => (
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
                  ))}
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
