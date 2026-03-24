"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AdminSidebarContent from "@/components/admin/navigation/AdminSidebarContent";
import { getAdminPageContext } from "@/components/admin/shell/admin-page-context";

export default function AdminShellView({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageContext = getAdminPageContext(pathname);
  const sidebarContent = <AdminSidebarContent pathname={pathname} />;

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
                          <span className="sr-only">Abrir menÃº</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="left"
                        className="w-[288px] border-white/8 bg-black p-0 text-white"
                      >
                        <SheetHeader className="sr-only">
                          <SheetTitle>NavegaciÃ³n administrativa</SheetTitle>
                          <SheetDescription>
                            Acceso a los mÃ³dulos del dashboard.
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
                      NavegaciÃ³n del sistema
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
