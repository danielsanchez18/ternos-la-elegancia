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
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="w-full h-8 my-8">
            <p className="text-3xl font-bold text-center uppercase tracking-[0.35em] text-stone-500">
              Admin
            </p>
            <p className="text-md font-bold text-center uppercase tracking-[0.35em] text-stone-500">
              La Elegancia
            </p>
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
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${isActive
                  ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-stone-400 hover:bg-white/4 hover:text-stone-100"
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
        <SignOutButton className="mt-4 w-full border-white/12 bg-white/3 text-stone-100 hover:bg-white/5" />
      </div>
    </div>
  );
}
