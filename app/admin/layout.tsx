import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { getSessionAccess } from "@/lib/session-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getSessionAccess(await headers());

  if (!access.session) {
    redirect("/ingresa");
  }

  if (!access.isAdmin) {
    redirect("/profile");
  }

  return <AdminShell>{children}</AdminShell>;
}
