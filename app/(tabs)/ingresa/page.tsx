import { redirect } from "next/navigation";
import { headers } from "next/headers";

import LoginForm from "@/components/shared/LoginForm";
import { getSessionAccess } from "@/lib/session-access";

export default async function LoginPage() {
  const access = await getSessionAccess(await headers());

  if (access.session) {
    redirect(access.redirectTo);
  }

  return (
    <section className="flex items-center justify-center w-full min-h-[90dvh]">
      <LoginForm />
    </section>
  );
}
