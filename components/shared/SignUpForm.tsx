"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (dni.trim().length < 8) {
      setErrorMessage("El DNI debe tener al menos 8 caracteres.");
      return;
    }

    const displayName = `${nombres.trim()} ${apellidos.trim()}`.trim();

    if (!displayName) {
      setErrorMessage("Debes completar nombres y apellidos.");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name: displayName,
          email,
          password,
          callbackURL: "/profile",
        });

        if (error) {
          setErrorMessage(error.message ?? "No se pudo crear la cuenta.");
          return;
        }

        const bootstrapResponse = await fetch("/api/customers/bootstrap", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            dni: dni.trim(),
            celular: celular.trim() || undefined,
            password,
          }),
        });

        if (!bootstrapResponse.ok) {
          const payload = (await bootstrapResponse.json().catch(() => null)) as
            | { error?: string }
            | null;

          setErrorMessage(
            payload?.error ?? "Tu cuenta se creo, pero no se pudo completar tu perfil de cliente."
          );
          return;
        }

        router.replace("/profile");
        router.refresh();
      } catch {
        setErrorMessage("Ocurrió un problema al crear la cuenta.");
      }
    });
  }

  return (
    <div className="w-full max-w-md border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
          Nueva cuenta
        </p>
        <h1 className="text-4xl font-oswald uppercase text-neutral-950">
          Regístrate
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          Crea una cuenta para disfrutar de una experiencia personalizada y acceder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">Nombres</span>
          <input
            type="text"
            value={nombres}
            onChange={(event) => setNombres(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="Tus nombres"
            autoComplete="name"
            required
          />
        </label>

        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">Apellidos</span>
          <input
            type="text"
            value={apellidos}
            onChange={(event) => setApellidos(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="Tus apellidos"
            autoComplete="family-name"
            required
          />
        </label>

        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 flex flex-col">
            <span className="text-sm font-medium text-neutral-800">DNI</span>
            <input
              type="text"
              value={dni}
              onChange={(event) => setDni(event.target.value)}
              className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
              placeholder="12345678"
              autoComplete="off"
              required
            />
          </label>

          <label className="space-y-1 flex flex-col">
            <span className="text-sm font-medium text-neutral-800">Celular</span>
            <input
              type="tel"
              value={celular}
              onChange={(event) => setCelular(event.target.value)}
              className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
              placeholder="999 999 999"
              autoComplete="tel"
            />
          </label>
        </div>

        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            required
          />
        </label>

        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">
            Confirmar contraseña
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            required
          />
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full mt-1"
        >
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/ingresa" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
