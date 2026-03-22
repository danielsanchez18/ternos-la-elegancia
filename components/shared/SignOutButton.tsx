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
        "rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/50",
        className
      )}
    >
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
