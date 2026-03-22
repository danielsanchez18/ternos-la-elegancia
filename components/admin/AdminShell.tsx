"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BellRing,
  CalendarRange,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Megaphone,
  PackageSearch,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";

import SignOutButton from "@/components/shared/SignOutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminDashboardSections, adminSidebarItems } from "@/lib/admin-dashboard";

const sectionIcons = {
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

function getPageContext(pathname: string) {
  if (pathname === "/admin") {
    return {
      eyebrow: "Centro de control",
      title: "Dashboard",
      description:
        "Vista transversal del negocio, sus modulos y las relaciones de operacion.",
    };
  }

  const currentSection = adminDashboardSections.find((section) =>
    pathname.startsWith(section.href)
  );

  if (!currentSection) {
    return {
      eyebrow: "Panel administrativo",
      title: "Modulo",
      description: "Explora las herramientas internas del sistema.",
    };
  }

  const currentSubroute = currentSection.subroutes.find((subroute) =>
    pathname.startsWith(subroute.href)
  );

  if (!currentSubroute) {
    return {
      eyebrow: "Modulo",
      title: currentSection.label,
      description: currentSection.description,
    };
  }

  return {
    eyebrow: currentSection.label,
    title: currentSubroute.label,
    description: currentSubroute.description,
  };
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageContext = getPageContext(pathname);

  const sidebarContent = (
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
            <h1 className="text-lg font-semibold text-stone-100">
              La Elegancia
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-1">
          {adminSidebarItems.map((item) => {
            const Icon =
              sectionIcons[item.slug as keyof typeof sectionIcons] ?? LayoutDashboard;
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

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
          <p className="mt-2 text-sm font-medium text-stone-100">
            Administrador
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Acceso interno con rutas protegidas para operacion y gestion.
          </p>
          <SignOutButton className="mt-4 w-full border-white/12 bg-white/[0.03] text-stone-100 hover:bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-stone-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[280px] border-r border-white/8 lg:block">
          {sidebarContent}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(5,5,5,0.96))] px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 lg:hidden">
                  {mounted ? (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                        >
                          <Menu className="size-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="left"
                        className="w-[288px] border-white/8 bg-black p-0 text-white"
                      >
                        <SheetHeader className="sr-only">
                          <SheetTitle>Navegación administrativa</SheetTitle>
                          <SheetDescription>
                            Acceso a los módulos del dashboard.
                          </SheetDescription>
                        </SheetHeader>
                        {sidebarContent}
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                      disabled
                    >
                      <Menu className="size-4" />
                    </Button>
                  )}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                      Panel admin
                    </p>
                    <p className="text-sm font-medium text-stone-200">
                      Navegación del sistema
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500">
                  <span>{pageContext.eyebrow}</span>
                  <ChevronRight className="size-3" />
                  <span>Admin</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {pageContext.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-6 text-stone-400 sm:text-base">
                    {pageContext.description}
                  </p>
                </div>
              </div>

            </div>
          </header>

          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
