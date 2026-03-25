export function rentalOrderStatusChipClasses(status: string): string {
  switch (status) {
    case "ENTREGADO":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "ATRASADO":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "DEVUELTO":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "CERRADO":
      return "border-stone-500/20 bg-stone-500/10 text-stone-300";
    case "CANCELADO":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-stone-300";
  }
}

export function alterationOrderStatusChipClasses(status: string): string {
  switch (status) {
    case "RECIBIDO":
      return "border-stone-500/20 bg-stone-500/10 text-stone-300";
    case "EN_EVALUACION":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "EN_PROCESO":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "LISTO":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "ENTREGADO":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
    case "CANCELADO":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-stone-300";
  }
}

export function rentalUnitStatusChipClasses(status: string): string {
  switch (status) {
    case "DISPONIBLE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "ALQUILADO":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "EN_MANTENIMIENTO":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "DANADO":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    case "RETIRADO":
      return "border-stone-500/20 bg-stone-500/10 text-stone-300";
    default:
      return "border-white/10 bg-white/5 text-stone-300";
  }
}
