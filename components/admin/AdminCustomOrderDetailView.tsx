"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import { ArrowLeft, Calendar, User, Package, Ruler, Info, Clock, CheckCircle2, CreditCard, Receipt, PlusCircle, AlertTriangle, X, ChevronDown, XCircle, MoreVertical, Printer, Edit3 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatLongDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import {
  calculateCustomOrderPendingBalance,
  calculateCustomOrderTotalPaid,
  customOrderDetailStatusActions,
  customOrderDetailStatusColors,
  fetchCustomerMeasurementProfiles,
  getCustomOrderRequiredAdvance,
  initialComprobanteFormState,
  initialPaymentFormState,
  patchCustomOrderMeasurementLink,
  patchCustomOrderStatusAction,
  shouldShowAdvanceWarning,
  submitCustomOrderComprobante,
  submitCustomOrderPayment,
  validateComprobanteTotal,
  validatePaymentAmount,
} from "@/components/admin/orders/custom-order-detail";

const paymentStatusLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  OBSERVADO: "Observado",
  ANULADO: "Anulado",
  DEVUELTO: "Devuelto",
};

const paymentStatusTone: Record<string, string> = {
  PENDIENTE: "bg-amber-500/10 text-amber-400",
  APROBADO: "bg-emerald-500/10 text-emerald-400",
  OBSERVADO: "bg-orange-500/10 text-orange-400",
  ANULADO: "bg-rose-500/10 text-rose-400",
  DEVUELTO: "bg-stone-500/10 text-stone-300",
};

const paymentMethodLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  MIXTO: "Mixto",
  OTRO: "Otro",
};

const comprobanteStatusLabel: Record<string, string> = {
  BORRADOR: "Borrador",
  EMITIDO: "Emitido",
  ANULADO: "Anulado",
};

const comprobanteStatusTone: Record<string, string> = {
  BORRADOR: "bg-amber-500/10 text-amber-400",
  EMITIDO: "bg-emerald-500/10 text-emerald-400",
  ANULADO: "bg-rose-500/10 text-rose-400",
};

function toDateTimeLocalValue(value: Date = new Date()): string {
  const tzOffsetMs = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export default function AdminCustomOrderDetailView({ order }: { order: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [paymentForm, setPaymentForm] = useState(initialPaymentFormState);

  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [showLinkMeasurementModal, setShowLinkMeasurementModal] = useState(false);
  const [selectedPartForMeasurement, setSelectedPartForMeasurement] = useState<any>(null);
  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [comprobanteForm, setComprobanteForm] = useState(
    initialComprobanteFormState
  );

  const totalPaid = calculateCustomOrderTotalPaid(order.payments);
  const pendingBalance = calculateCustomOrderPendingBalance(order.total, totalPaid);
  const advanceRequired = getCustomOrderRequiredAdvance(order.total);
  const advanceProgress = Math.min(
    100,
    Math.max(0, (totalPaid / Math.max(advanceRequired, 1)) * 100)
  );

  const handlePaymentMethodChange = (method: string) => {
    setPaymentForm((prev) => {
      const suggestedProvider =
        method === "YAPE"
          ? "YAPE"
          : method === "PLIN"
            ? "PLIN"
            : method === "TRANSFERENCIA"
              ? "BANCO"
              : "";

      const previousProvider = prev.provider;
      const shouldClearSuggestedProvider =
        previousProvider === "YAPE" ||
        previousProvider === "PLIN" ||
        previousProvider === "BANCO";

      return {
        ...prev,
        method,
        provider: suggestedProvider || (shouldClearSuggestedProvider ? "" : previousProvider),
      };
    });
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const validationError = validatePaymentAmount(
      paymentForm.amount,
      pendingBalance,
      paymentForm.status
    );
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    startTransition(async () => {
      const result = await submitCustomOrderPayment(order.id, paymentForm);
      if (!result.ok) {
        setErrorMsg(result.message);
        return;
      }

      setShowPaymentModal(false);
      setPaymentForm(initialPaymentFormState);
      router.refresh();
    });
  };

  const handleRegisterComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const validationError = validateComprobanteTotal(comprobanteForm.total, order.total);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    startTransition(async () => {
      const result = await submitCustomOrderComprobante(order.id, comprobanteForm);
      if (!result.ok) {
        setErrorMsg(result.message);
        return;
      }

      setComprobanteForm(initialComprobanteFormState);
      router.refresh();
    });
  };

  const handleStatusAction = async (action: string, note?: string) => {
    setErrorMsg("");
    startTransition(async () => {
      const result = await patchCustomOrderStatusAction(order.id, action, note);
      if (!result.ok) {
        setErrorMsg(result.message);
        return;
      }

      router.refresh();
    });
  };

  const fetchCustomerProfiles = async () => {
    setLoadingProfiles(true);
    const result = await fetchCustomerMeasurementProfiles(order.customer.id);
    if (!result.ok) {
      setErrorMsg(result.message);
      setLoadingProfiles(false);
      return;
    }

    setCustomerProfiles(result.profiles);
    setLoadingProfiles(false);
  };

  const handleLinkMeasurement = async (profileId: string, profileGarmentId: string) => {
    if (!selectedPartForMeasurement) return;

    setErrorMsg("");
    startTransition(async () => {
      const result = await patchCustomOrderMeasurementLink({
        orderId: order.id,
        partId: selectedPartForMeasurement.id,
        profileId,
        profileGarmentId,
      });
      if (!result.ok) {
        setErrorMsg(result.message);
        return;
      }

      setShowLinkMeasurementModal(false);
      setSelectedPartForMeasurement(null);
      router.refresh();
    });
  };

  const currentAction =
    customOrderDetailStatusActions[
      order.status as keyof typeof customOrderDetailStatusActions
    ];

  return (
    <div className="mx-auto max-w-6xl pb-20">
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertTriangle className="size-5 text-rose-500" />
          <p>{errorMsg}</p>
          <button onClick={() => setErrorMsg("")} className="ml-auto text-rose-500/50 hover:text-rose-500">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ordenes/personalizadas"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 hover:bg-white/[0.06] hover:text-white transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${customOrderDetailStatusColors[order.status] || "bg-stone-500/20 text-stone-400"}`}>
                {formatStatusLabel(order.status)}
              </span>
              <span className="text-stone-500 text-xs">•</span>
              <span className="text-stone-500 text-xs">ID de Pedido #{order.id}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{order.code}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentAction && (
            <button
              onClick={() => handleStatusAction(currentAction.action)}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50 ${currentAction.variant}`}
            >
              <currentAction.icon className="size-4" />
              {currentAction.label}
            </button>
          )}

          <Link
            href={`/admin/ordenes/personalizadas/${order.id}/hoja-taller`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-stone-300 transition hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Hoja de Taller</span>
          </Link>

          <div className="relative group">
            <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-stone-400 hover:bg-white/10 transition">
              <MoreVertical className="size-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 origin-top-right scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-10">
              <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl">
                {order.status !== 'CANCELADO' && order.status !== 'ENTREGADO' && (
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de cancelar esta orden?")) {
                        handleStatusAction("CANCEL", "Cancelado por el administrador");
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <XCircle className="size-4" />
                    Cancelar Orden
                  </button>
                )}
                <Link
                  href={`/admin/ordenes/personalizadas/${order.id}/hoja-taller`}
                  target="_blank"
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-stone-300 hover:bg-white/5 transition"
                >
                  <Printer className="size-4" />
                  Hoja de Taller
                </Link>
                <Link
                  href={`/admin/ordenes/personalizadas/${order.id}/editar`}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-stone-300 hover:bg-white/5 transition"
                >
                  <Edit3 className="size-4" />
                  Editar Datos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items Section */}
          <section className="rounded-3xl border border-white/8 bg-[#0e0e0e] overflow-hidden">
            <header className="border-b border-white/5 bg-white/[0.02] px-6 py-4 flex items-center gap-2">
              <Package className="size-5 text-emerald-400" />
              <h2 className="font-semibold text-white">Detalle de Prendas</h2>
            </header>
            <div className="p-6 space-y-6">
              {order.items.map((item: any, i: number) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400 border border-emerald-500/20">
                        {i + 1}
                      </span>
                      {item.itemNameSnapshot}
                      <span className="text-stone-500 font-normal text-sm">x {item.quantity}</span>
                    </h3>
                    <p className="text-lg font-bold text-white">S/ {(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 ml-9">
                    {item.parts.map((part: any) => (
                      <div key={part.id} className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition hover:bg-white/[0.03]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-stone-900 p-2 text-stone-400 group-hover:text-emerald-400 transition">
                              <Ruler className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-stone-200">{part.label}</p>
                              <p className="text-[10px] text-stone-500 uppercase tracking-wider">{part.garmentType.replace(/_/g, " ")}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${part.workMode === 'A_TODO_COSTO' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                            {part.workMode === 'A_TODO_COSTO' ? 'A Todo Costo' : 'Solo Confección'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="text-stone-500">Tela:</p>
                            <p className="text-stone-300">
                              {part.fabricCodeSnapshot ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="size-2 rounded-full bg-emerald-500" />
                                  {part.fabricCodeSnapshot} - {part.fabricNameSnapshot}
                                </span>
                              ) : "Cliente trae tela"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-stone-500">Estado de Medidas:</p>
                             <p className={part.measurementProfileId ? "text-emerald-400 flex items-center gap-1" : "text-amber-400 flex items-center gap-1"}>
                               {part.measurementProfileId ? <CheckCircle2 className="size-3" /> : <Info className="size-3" />}
                               {part.measurementProfileId ? "Vinculadas" : (
                                 <button
                                   onClick={() => {
                                     setSelectedPartForMeasurement(part);
                                     fetchCustomerProfiles();
                                     setShowLinkMeasurementModal(true);
                                   }}
                                   className="underline decoration-amber-500/30 hover:decoration-amber-500 transition underline-offset-2"
                                 >
                                   Vincular
                                 </button>
                               )}
                             </p>
                          </div>
                        </div>

                        {part.selections && part.selections.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">Configuración Especial</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {part.selections.map((s: any) => (
                                <div key={s.id} className="flex justify-between items-center text-[11px] py-1 border-b border-white/[0.02]">
                                  <span className="text-stone-500">{s.definitionLabelSnapshot}</span>
                                  <span className="text-stone-300 font-medium">
                                    {s.optionLabelSnapshot || s.valueText || s.valueNumber || (s.valueBoolean ? "Sí" : "No")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {part.notes && (
                          <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-stone-400 italic">
                            "{part.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <footer className="bg-black/40 px-6 py-6 border-t border-white/5">
              <div className="flex flex-col gap-2 max-w-xs ml-auto text-right">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal:</span>
                  <span className="text-stone-300">S/ {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Descuento:</span>
                    <span className="text-rose-400">- S/ {order.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10 text-xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-emerald-400 text-2xl tracking-tight">S/ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </footer>
          </section>

          {/* Activity / History */}
          <section className="rounded-3xl border border-white/8 bg-[#0e0e0e] p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="size-5 text-stone-500" />
              Historial de Estados
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-z-10 before:h-full before:w-0.5 before:bg-white/5">
              {order.history.map((h: any, idx: number) => (
                <div key={h.id} className="flex gap-4 group">
                  <div className={`mt-1 flex size-10 items-center justify-center rounded-full border-4 border-[#0e0e0e] ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'}`}>
                    {idx === 0 ? <CheckCircle2 className="size-5" /> : <div className="size-2 rounded-full bg-current" />}
                  </div>
                  <div className="pb-2">
                    <p className={`font-medium ${idx === 0 ? 'text-white' : 'text-stone-400'}`}>
                      {h.status.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-stone-500">{formatLongDate(h.changedAt)}</p>
                    {h.note && <p className="mt-1 text-xs text-stone-400 bg-white/5 p-2 rounded-lg italic">"{h.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payments Section */}
          <section className="rounded-3xl border border-white/8 bg-[#0e0e0e] overflow-hidden">
            <header className="border-b border-white/5 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-emerald-400" />
                <h2 className="font-semibold text-white">Pagos y Abonos</h2>
              </div>
              <button
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
                onClick={() => {
                  setErrorMsg("");
                  setPaymentForm((prev) => ({
                    ...prev,
                    paidAt: prev.paidAt || toDateTimeLocalValue(),
                  }));
                  setShowPaymentModal(true);
                }}
                disabled={pendingBalance <= 0}
              >
                <PlusCircle className="size-3.5" />
                Registrar Pago
              </button>
            </header>

            <div className="p-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
                  <p className="text-[10px] uppercase text-emerald-500/60 tracking-wider mb-1">Total Pagado</p>
                  <p className="text-xl font-bold text-emerald-400">S/ {totalPaid.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-center">
                  <p className="text-[10px] uppercase text-amber-500/60 tracking-wider mb-1">Saldo Pendiente</p>
                  <p className="text-xl font-bold text-amber-500">
                    S/ {pendingBalance.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-[10px] uppercase text-stone-500 tracking-wider mb-1">Total Orden</p>
                  <p className="text-xl font-bold text-white">S/ {order.total.toFixed(2)}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-blue-300">Cobertura de adelanto m\u00ednimo (50%)</span>
                    <span className="font-semibold text-blue-300">
                      {Math.min(totalPaid, advanceRequired).toFixed(2)} / {advanceRequired.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all"
                      style={{ width: `${advanceProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Advance Payment Warning */}
              {shouldShowAdvanceWarning(order.status, totalPaid, order.total) && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <AlertTriangle className="size-5 text-amber-500 flex-shrink-0" />
                  <p>
                    Para iniciar la confección se requiere un abono del 50% (S/{" "}
                    {getCustomOrderRequiredAdvance(order.total).toFixed(2)}). Falta
                    abonar S/{" "}
                    {(
                      getCustomOrderRequiredAdvance(order.total) - totalPaid
                    ).toFixed(2)}
                    .
                  </p>
                </div>
              )}

              {/* Payment History List */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-stone-400 mb-2">Transacciones</h3>
                {!order.payments || order.payments.length === 0 ? (
                  <p className="text-sm text-stone-500 italic py-4 text-center">No hay pagos registrados para esta orden.</p>
                ) : (
                  <div className="space-y-2">
                    {order.payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 hover:bg-white/[0.02] transition">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${payment.status === 'APROBADO' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-500'}`}>
                            <Receipt className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {paymentMethodLabel[payment.method] ?? payment.method}
                              <span className="ml-2 text-xs font-normal text-stone-400">
                                {payment.concept?.replace(/_/g, " ") ?? "PAGO"}
                              </span>
                            </p>
                            <p className="text-[10px] text-stone-500 italic">
                              {formatLongDate(payment.paidAt || payment.createdAt)}
                            </p>
                            {(payment.operationCode || payment.approvalCode) && (
                              <p className="text-[10px] text-stone-500">
                                {payment.operationCode ? `Op: ${payment.operationCode}` : ""}
                                {payment.operationCode && payment.approvalCode ? " · " : ""}
                                {payment.approvalCode ? `Aprob: ${payment.approvalCode}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">S/ {payment.amount.toFixed(2)}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${paymentStatusTone[payment.status] ?? "bg-stone-500/10 text-stone-300"}`}>
                            {paymentStatusLabel[payment.status] ?? payment.status}
                          </span>
                          {payment.provider && (
                            <p className="mt-1 text-[10px] text-stone-500">Proveedor: {payment.provider}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <footer className="bg-black/40 px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-stone-500">Los pagos aprobados descuentan del saldo total.</p>
              <button
                className="text-xs text-stone-400 hover:text-white transition flex items-center gap-1"
                onClick={() => {
                  setErrorMsg("");
                  setComprobanteForm((prev) => ({
                    ...prev,
                    issuedAt: prev.issuedAt || toDateTimeLocalValue(),
                  }));
                  setShowComprobanteModal(true);
                }}
              >
                <Receipt className="size-3" />
                Ver Comprobantes ({order.comprobantes?.length || 0})
              </button>
            </footer>
          </section>
        </div>

        {/* Right Column: Customer & Timeline */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="rounded-3xl border border-white/8 bg-[#0e0e0e] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Cliente</p>
                <h3 className="font-bold text-white text-lg leading-tight">
                  {order.customer.nombres} {order.customer.apellidos}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">DNI:</span>
                <span className="text-stone-300 font-medium">{order.customer.dni || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Celular:</span>
                <span className="text-stone-300 font-medium">{order.customer.celular || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="text-stone-300 font-medium truncate max-w-[150px]">{order.customer.email || "-"}</span>
              </div>
            </div>

            <hr className="my-6 border-white/5" />

            <Link
              href={`/admin/clientes`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-medium text-stone-400 hover:bg-white/5 hover:text-white transition"
            >
              Ir al perfil del cliente
            </Link>
          </div>

          {/* Timeline Card */}
          <div className="rounded-3xl border border-white/8 bg-[#0e0e0e] p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="size-5 text-stone-500" />
              <h3 className="font-semibold text-white">Cronograma</h3>
            </div>

            <div className="space-y-5">
              <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-stone-600">
                <p className="text-[10px] uppercase text-stone-500 tracking-wider">Creado el</p>
                <p className="text-sm font-medium text-stone-300">{formatLongDate(order.createdAt)}</p>
              </div>

              <div className="rounded-sm relative pl-6 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <p className="text-[10px] uppercase text-emerald-500 tracking-wider font-bold">Entrega Prometida</p>
                <p className="text-sm font-bold text-white">
                  {order.promisedDeliveryAt ? formatLongDate(order.promisedDeliveryAt) : "No definida"}
                </p>
              </div>

              {order.deliveredAt && (
                <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-purple-500">
                  <p className="text-[10px] uppercase text-purple-500 tracking-wider">Entregado el</p>
                  <p className="text-sm font-medium text-stone-300">{formatLongDate(order.deliveredAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.internalNotes) && (
            <div className="rounded-3xl border border-white/8 bg-amber-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-amber-500/50" />
                <h3 className="font-semibold text-amber-200">Notas de la Orden</h3>
              </div>
              {order.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-amber-500/60 font-medium">Instrucciones</p>
                  <p className="text-xs text-amber-100/70 italic leading-relaxed font-serif">"{order.notes}"</p>
                </div>
              )}
              {order.internalNotes && (
                <div className="space-y-1 pt-2 border-t border-amber-500/10">
                  <p className="text-[10px] uppercase text-amber-500/60 font-medium">Notas Internas</p>
                  <p className="text-xs text-amber-100/70">{order.internalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden"
            >
              <header className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <PlusCircle className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white leading-none">Registrar Pago</h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl bg-white/5 p-2 text-stone-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="size-5" />
                </button>
              </header>

              <form onSubmit={handleRegisterPayment} className="p-8 space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    <AlertTriangle className="size-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Monto (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder={`Max S/ ${pendingBalance.toFixed(2)}`}
                      className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                  <div className="relative space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Metodo</label>
                    <div className="relative">
                      <select
                        value={paymentForm.method}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        style={{ colorScheme: "dark" }}
                        className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition appearance-none"
                      >
                        <option value="EFECTIVO" className="bg-stone-900">Efectivo</option>
                        <option value="YAPE" className="bg-stone-900">Yape</option>
                        <option value="PLIN" className="bg-stone-900">Plin</option>
                        <option value="TRANSFERENCIA" className="bg-stone-900">Transferencia</option>
                        <option value="TARJETA" className="bg-stone-900">Tarjeta</option>
                        <option value="MIXTO" className="bg-stone-900">Mixto</option>
                        <option value="OTRO" className="bg-stone-900">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Concepto</label>
                    <div className="relative">
                      <select
                        value={paymentForm.concept}
                        onChange={(e) => setPaymentForm({ ...paymentForm, concept: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition appearance-none"
                      >
                        <option value="ADELANTO" className="bg-stone-900">Adelanto</option>
                        <option value="SALDO" className="bg-stone-900">Saldo</option>
                        <option value="PAGO_TOTAL" className="bg-stone-900">Pago total</option>
                        <option value="RESERVA_CITA" className="bg-stone-900">Reserva cita</option>
                        <option value="OTRO" className="bg-stone-900">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Estado</label>
                    <div className="relative">
                      <select
                        value={paymentForm.status}
                        onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition appearance-none"
                      >
                        <option value="APROBADO" className="bg-stone-900">Aprobado</option>
                        <option value="PENDIENTE" className="bg-stone-900">Pendiente</option>
                        <option value="OBSERVADO" className="bg-stone-900">Observado</option>
                        <option value="ANULADO" className="bg-stone-900">Anulado</option>
                        <option value="DEVUELTO" className="bg-stone-900">Devuelto</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Proveedor</label>
                    <div className="relative">
                      <select
                        value={paymentForm.provider}
                        onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition appearance-none"
                      >
                        <option value="" className="bg-stone-900">Sin proveedor</option>
                        <option value="YAPE" className="bg-stone-900">Yape</option>
                        <option value="PLIN" className="bg-stone-900">Plin</option>
                        <option value="BANCO" className="bg-stone-900">Banco</option>
                        <option value="OTRO" className="bg-stone-900">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-stone-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Fecha y hora de pago</label>
                    <input
                      type="datetime-local"
                      value={paymentForm.paidAt}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
                      className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Codigo operacion</label>
                    <input
                      type="text"
                      value={paymentForm.operationCode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, operationCode: e.target.value })}
                      placeholder="Ej. 123456"
                      className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Codigo aprobacion</label>
                    <input
                      type="text"
                      value={paymentForm.approvalCode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, approvalCode: e.target.value })}
                      placeholder="Ej. APR-001"
                      className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">URL de voucher</label>
                  <input
                    type="url"
                    value={paymentForm.voucherUrl}
                    onChange={(e) => setPaymentForm({ ...paymentForm, voucherUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                  />
                </div>

                {paymentForm.status !== "APROBADO" && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                    Este pago no reduce saldo ni habilita transiciones hasta quedar en estado aprobado.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Notas internas</label>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Referencia de pago, banco, etc."
                    className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 rounded-2xl bg-white/5 py-4 text-sm font-bold text-stone-400 hover:bg-white/10 hover:text-white transition"
                    disabled={isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-emerald-950 hover:bg-emerald-400 transition disabled:opacity-50"
                    disabled={isPending}
                  >
                    {isPending ? "Registrando..." : "Registrar pago"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprobante Modal */}
      <AnimatePresence>
        {showComprobanteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden"
            >
              <header className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                    <Receipt className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white leading-none">Comprobantes de Pago</h3>
                </div>
                <button
                  onClick={() => setShowComprobanteModal(false)}
                  className="rounded-xl bg-white/5 p-2 text-stone-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="size-5" />
                </button>
              </header>

              <div className="flex h-[32rem]">
                {/* List Half */}
                <div className="flex-1 overflow-y-auto border-r border-white/5 p-6 space-y-4">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Historial</h4>
                  {!order.comprobantes || order.comprobantes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-600">
                      <Receipt className="size-12 opacity-10 mb-2" />
                      <p className="text-sm italic">No hay comprobantes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {order.comprobantes.map((c: any) => (
                        <div key={c.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-white">
                                {c.type?.replace(/_/g, " ")}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                {(c.serie || "-")}-{(c.numero || "-")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-emerald-400">S/ {c.total.toFixed(2)}</p>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${comprobanteStatusTone[c.status] ?? "bg-stone-500/10 text-stone-300"}`}>
                                {comprobanteStatusLabel[c.status] ?? c.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-600">
                            {formatLongDate(c.issuedAt || c.createdAt)}
                          </p>
                          {(c.pdfUrl || c.xmlUrl) && (
                            <div className="flex gap-3 text-[10px]">
                              {c.pdfUrl && (
                                <a
                                  href={c.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-300 hover:text-blue-200"
                                >
                                  PDF
                                </a>
                              )}
                              {c.xmlUrl && (
                                <a
                                  href={c.xmlUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200"
                                >
                                  XML
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Half */}
                <div className="flex-1 bg-white/[0.01] p-6 overflow-y-auto">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-6">Nuevo Comprobante</h4>
                  <form onSubmit={handleRegisterComprobante} className="space-y-4">
                    {errorMsg && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        <AlertTriangle className="size-4 flex-shrink-0" />
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Tipo</label>
                        <div className="relative">
                          <select
                            value={comprobanteForm.type}
                            onChange={(e) => setComprobanteForm({ ...comprobanteForm, type: e.target.value })}
                            style={{ colorScheme: "dark" }}
                            className="w-full appearance-none rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          >
                            <option value="BOLETA" className="bg-stone-900">Boleta</option>
                            <option value="FACTURA" className="bg-stone-900">Factura</option>
                            <option value="NOTA_CREDITO" className="bg-stone-900">Nota de credito</option>
                            <option value="NOTA_DEBITO" className="bg-stone-900">Nota de debito</option>
                            <option value="TICKET" className="bg-stone-900">Ticket</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                        </div>
                      </div>

                      <div className="relative space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Estado</label>
                        <div className="relative">
                          <select
                            value={comprobanteForm.status}
                            onChange={(e) => setComprobanteForm({ ...comprobanteForm, status: e.target.value })}
                            style={{ colorScheme: "dark" }}
                            className="w-full appearance-none rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          >
                            <option value="BORRADOR" className="bg-stone-900">Borrador</option>
                            <option value="EMITIDO" className="bg-stone-900">Emitido</option>
                            <option value="ANULADO" className="bg-stone-900">Anulado</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Serie</label>
                        <input
                          type="text"
                          value={comprobanteForm.serie}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, serie: e.target.value })}
                          placeholder="F001"
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Numero</label>
                        <input
                          type="text"
                          value={comprobanteForm.numero}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, numero: e.target.value })}
                          placeholder="000123"
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Subtotal</label>
                        <input
                          type="number"
                          step="0.01"
                          value={comprobanteForm.subtotal}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, subtotal: e.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Impuesto</label>
                        <input
                          type="number"
                          step="0.01"
                          value={comprobanteForm.impuesto}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, impuesto: e.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Total (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={comprobanteForm.total}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, total: e.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Fecha de emision</label>
                      <input
                        type="datetime-local"
                        value={comprobanteForm.issuedAt}
                        onChange={(e) => setComprobanteForm({ ...comprobanteForm, issuedAt: e.target.value })}
                        className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">URL PDF</label>
                        <input
                          type="url"
                          value={comprobanteForm.pdfUrl}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, pdfUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">URL XML</label>
                        <input
                          type="url"
                          value={comprobanteForm.xmlUrl}
                          onChange={(e) => setComprobanteForm({ ...comprobanteForm, xmlUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Notas</label>
                      <textarea
                        rows={2}
                        value={comprobanteForm.notes}
                        onChange={(e) => setComprobanteForm({ ...comprobanteForm, notes: e.target.value })}
                        className="w-full resize-none rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 transition focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
                      disabled={isPending}
                    >
                      {isPending ? "Registrando..." : "Registrar comprobante"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Link Measurement Modal */}
      <AnimatePresence>
        {showLinkMeasurementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Vincular Medidas</h3>
                  <button
                    onClick={() => {
                      setShowLinkMeasurementModal(false);
                      setSelectedPartForMeasurement(null);
                    }}
                    className="rounded-full p-2 text-stone-500 hover:bg-white/5 hover:text-white transition"
                  >
                    <X className="size-6" />
                  </button>
                </div>
                <p className="text-stone-400 text-sm">
                  Selecciona un perfil de medidas para el 
                  <span className="text-emerald-400 font-medium ml-1">
                    {selectedPartForMeasurement?.label} ({selectedPartForMeasurement?.garmentType.replace(/_/g, ' ')})
                  </span>
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    <AlertTriangle className="size-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {loadingProfiles ? (
                  <div className="py-12 text-center">
                    <div className="inline-block size-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                    <p className="mt-4 text-sm text-stone-500">Cargando perfiles del cliente...</p>
                  </div>
                ) : customerProfiles.length === 0 ? (
                  <div className="py-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                    <Ruler className="size-12 text-stone-700 mx-auto mb-4" />
                    <p className="text-stone-400 font-medium">No hay medidas registradas</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-[200px] mx-auto">El cliente no tiene perfiles de medidas para este tipo de prenda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerProfiles.map((profile) => {
                      const matchingGarment = profile.garments?.find(
                        (g: any) => g.garmentType === selectedPartForMeasurement?.garmentType
                      );

                      return (
                        <div
                          key={profile.id}
                          className={`group rounded-3xl border transition-all ${
                            matchingGarment 
                              ? "border-white/10 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]" 
                              : "border-white/5 bg-white/[0.01] opacity-50 grayscale"
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                  <Calendar className="size-3.5 text-stone-500" />
                                  Perfil del {formatLongDate(profile.takenAt)}
                                </p>
                                <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">
                                  Vence: {formatLongDate(profile.validUntil)}
                                </p>
                              </div>
                              {matchingGarment && (
                                <button
                                  onClick={() => handleLinkMeasurement(profile.id, matchingGarment.id)}
                                  disabled={isPending}
                                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                                >
                                  Vincular estas Medidas
                                </button>
                              )}
                            </div>
                            
                            {profile.notes && (
                              <p className="text-xs text-stone-500 italic mb-3">"{profile.notes}"</p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {profile.garments?.map((g: any) => (
                                <span
                                  key={g.id}
                                  className={`rounded-lg px-2 py-1 text-[10px] font-medium border ${
                                    g.garmentType === selectedPartForMeasurement?.garmentType
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : "bg-white/5 text-stone-500 border-white/5"
                                  }`}
                                >
                                  {g.garmentType.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-stone-500 italic">
                  * Solo se muestran perfiles que contienen el tipo de prenda requerido.
                </p>
                <Link
                  href={`/admin/clientes/perfil/${order.customer.id}/medidas`}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Gestionar Medidas del Cliente →
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


