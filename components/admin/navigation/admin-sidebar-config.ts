import {
  BellRing,
  CalendarRange,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";

export const adminSectionIcons = {
  dashboard: LayoutDashboard,
  clientes: Users,
  citas: CalendarRange,
  catalogo: ShoppingBag,
  inventario: PackageSearch,
  ordenes: ShoppingBag,
  comercial: Megaphone,
  notificaciones: BellRing,
  reportes: LayoutDashboard,
  configuracion: Settings2,
} as const;

export function isAdminSidebarItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}
