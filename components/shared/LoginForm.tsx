"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message ?? "No se pudo iniciar sesión.");
          return;
        }

        const response = await fetch("/api/session-access", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/profile");
          router.refresh();
          return;
        }

        const payload = (await response.json()) as {
          redirectTo?: "/admin" | "/profile";
        };

        router.replace(payload.redirectTo === "/admin" ? "/admin" : "/profile");
        router.refresh();
      } catch {
        setErrorMessage("Ocurrió un problema al iniciar sesión.");
      }
    });
  }

  return (
    <div className="w-full max-w-md border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
          Bienvenido de nuevo
        </p>
        <h1 className="text-4xl font-oswald uppercase text-neutral-950">
          Inicia sesión
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          Entra con tu correo y contraseña para continuar con tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

        <label className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-neutral-800">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-black/10 bg-neutral-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            placeholder="Tu contraseña"
            autoComplete="current-password"
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
          {isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registrate" className="font-medium text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
