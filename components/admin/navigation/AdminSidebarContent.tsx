import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import SignOutButton from "@/components/shared/SignOutButton";
import {
  adminSectionIcons,
  isAdminSidebarItemActive,
} from "@/components/admin/navigation/admin-sidebar-config";
import { adminSidebarItems } from "@/lib/admin-dashboard";

type AdminSidebarContentProps = {
  pathname: string;
};

export default function AdminSidebarContent({
  pathname,
}: AdminSidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-black text-stone-100">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top,#1c5a3a,transparent_70%),linear-gradient(180deg,#0f2419,#08100c)] shadow-[0_0_40px_rgba(16,185,129,0.12)]">
            <span className="text-sm font-semibold tracking-[0.3em] text-emerald-200">
              LE
            </span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">
              Admin
            </p>
            <h1 className="text-lg font-semibold text-stone-100">La Elegancia</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-1">
          {adminSidebarItems.map((item) => {
            const Icon =
              adminSectionIcons[item.slug as keyof typeof adminSectionIcons] ??
              LayoutDashboard;
            const isActive = isAdminSidebarItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-100"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/8 px-4 py-4">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Sesion activa
          </p>
          <p className="mt-2 text-sm font-medium text-stone-100">Administrador</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Acceso interno con rutas protegidas para operacion y gestion.
          </p>
          <SignOutButton className="mt-4 w-full border-white/12 bg-white/[0.03] text-stone-100 hover:bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}
