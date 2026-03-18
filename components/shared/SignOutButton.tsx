"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function SignOutButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(
        "rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
