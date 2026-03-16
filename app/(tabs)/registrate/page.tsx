import { redirect } from "next/navigation";
import { headers } from "next/headers";

import SignUpForm from "@/components/shared/SignUpForm";
import { getSessionAccess } from "@/lib/session-access";

export default async function SignUpPage() {
  const access = await getSessionAccess(await headers());

  if (access.session) {
    redirect(access.redirectTo);
  }

  return (
    <section className="w-full min-h-[90dvh] flex items-center justify-center">
      <SignUpForm />
    </section>
  );
}
