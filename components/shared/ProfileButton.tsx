import { headers } from "next/headers";
import Link from "next/link";

import { getSessionAccess } from "@/lib/session-access";

export default async function ProfileButton() {
  const access = await getSessionAccess(await headers());

  return (
    <Link
      href={access.redirectTo}
      className="p-4 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="size-6"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="6" r="4" />
          <path d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z" />
        </g>
      </svg>
    </Link>
  );
}
