import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/shared/SignOutButton";
import { getSessionAccess } from "@/lib/session-access";

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
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Mi cuenta
          </p>
          <h1 className="text-5xl font-oswald uppercase text-neutral-950">
            Sesión activa
          </h1>
          <p className="max-w-2xl text-base leading-7 text-neutral-700">
            Este es el punto de llegada inicial después de `login` y `signup`.
            Desde aquí podemos seguir construyendo perfil, pedidos y accesos por rol.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] border border-black/10 bg-white p-6">
            <p className="text-sm text-neutral-500">Nombre</p>
            <p className="mt-2 text-xl font-medium text-neutral-950">
              {access.session.user.name}
            </p>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-white p-6">
            <p className="text-sm text-neutral-500">Correo</p>
            <p className="mt-2 text-xl font-medium text-neutral-950">
              {access.session.user.email}
            </p>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-white p-6">
            <p className="text-sm text-neutral-500">Perfil</p>
            <p className="mt-2 text-xl font-medium text-neutral-950">
              {roleLabel}
            </p>
          </article>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium text-neutral-950">
                Estado de integración
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                La autenticación ya funciona con Better Auth. El siguiente paso
                natural es enlazar este usuario con el perfil de negocio
                correspondiente dentro de `Customer`.
              </p>
            </div>

            <SignOutButton />
          </div>
        </div>
      </div>
    </section>
  );
}
