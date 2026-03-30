"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { getMyProfileInfo, updateMyProfileInfo, CustomerProfileInfo } from "@/lib/storefront-customer-api";

export default function ProfileDataSection() {
  const [profile, setProfile] = useState<CustomerProfileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const data = await getMyProfileInfo();
        if (mounted) {
          setProfile(data);
          setNombres(data.nombres);
          setApellidos(data.apellidos);
          setCelular(data.celular || "");
          setIsLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Error al cargar la información del perfil");
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setUpdateError(null);

    // Validar contraseña
    if (newPassword && !currentPassword) {
      setUpdateError("Debes ingresar tu contraseña actual para establecer una nueva.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setUpdateError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      try {
        const payload: Record<string, string> = {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          celular: celular.trim(),
        };

        if (newPassword && currentPassword) {
          payload.newPassword = newPassword;
          payload.currentPassword = currentPassword;
        }

        const data = await updateMyProfileInfo(payload);
        setProfile(data);
        setSuccessMessage("Tus datos han sido actualizados correctamente.");
        setCurrentPassword("");
        setNewPassword("");
      } catch (err: any) {
        setUpdateError(err.message || "Ocurrió un error al actualizar los datos.");
      }
    });
  }

  if (isLoading) {
    return (
      <article className="border border-black/10 bg-white p-6 md:p-8">
        <p className="text-sm text-neutral-500">Cargando tus datos...</p>
      </article>
    );
  }

  if (error || !profile) {
    return (
      <article className="border border-red-200 p-6 md:p-8 bg-red-50">
        <p className="text-sm text-red-700">{error || "No se encontró el perfil"}</p>
      </article>
    );
  }

  return (
    <article className="border border-black/10 bg-white p-6 md:p-8">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Mis Datos Personales
        </p>
        <h2 className="text-2xl font-oswald uppercase text-neutral-950">
          Información de la Cuenta
        </h2>
        <p className="text-sm text-neutral-600">
          Mantén tus datos de contacto actualizados para enviarte notificaciones puntuales sobre tus pedidos y servicios.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8 max-w-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800">Nombres</span>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
                required
              />
            </label>
            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800">Apellidos</span>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800 flex justify-between">
                <span>DNI</span>
                <span className="text-xs text-neutral-400 font-normal normal-case">No editable</span>
              </span>
              <input
                type="text"
                value={profile.dni}
                onChange={() => {}}
                className="w-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-500 outline-none cursor-not-allowed"
                disabled
              />
            </label>

            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800 flex justify-between">
                <span>Correo Electrónico</span>
                <span className="text-xs text-neutral-400 font-normal normal-case">No editable</span>
              </span>
              <input
                type="email"
                value={profile.email}
                onChange={() => {}}
                className="w-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-500 outline-none cursor-not-allowed"
                disabled
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800">Celular</span>
              <input
                type="tel"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
              />
            </label>
            <div></div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200">
          <h3 className="text-base font-semibold uppercase tracking-wide text-neutral-900 mb-6 border-b-2 border-primary inline-block pb-1">Seguridad</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Solo completa estos campos si deseas cambiar tu contraseña. De lo contrario, déjalos en blanco.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800">Contraseña Actual</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
              />
            </label>

            <label className="space-y-2 flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-neutral-800">Nueva Contraseña</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </label>
          </div>
        </div>

        {updateError && (
          <div className="bg-red-50 text-red-700 p-4 border border-red-200 text-sm">
            ❌ {updateError}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 text-emerald-800 p-4 border border-emerald-200 text-sm">
            ✅ {successMessage}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full md:w-auto px-8 py-3 uppercase tracking-widest text-sm font-semibold"
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </article>
  );
}
