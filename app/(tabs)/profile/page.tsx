import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/shared/SignOutButton";
import { getSessionAccess } from "@/lib/session-access";
import ProfileTabs from "@/components/customer/profile/ProfileTabs";

export default async function ProfilePage() {
  const access = await getSessionAccess(await headers());

  if (!access.session) {
    redirect("/ingresa");
  }

  if (access.isAdmin) {
    redirect("/admin");
  }

  const roleLabel = access.isCustomer ? "Cliente" : "Usuario autenticado";

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[linear-gradient(180deg,#faf7f2,white)] px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Mi cuenta
          </p>
          <h1 className="text-5xl font-oswald uppercase text-neutral-950">
            {access.session.user.name}
          </h1>
        </div>

        {/* Customer sections */}
        {access.customerId && (
          <ProfileTabs customerId={access.customerId} />
        )}

        {!access.customerId && access.isCustomer && (
          <article className="border border-black/10 bg-white p-6">
            <p className="text-sm text-neutral-600">
              Tu cuenta esta siendo configurada. Pronto podras ver tus ordenes, citas y medidas aqui.
            </p>
          </article>
        )}

        <div className="flex w-full justify-end">
          <SignOutButton />
        </div>
      </div>
    </section>
  );
}
