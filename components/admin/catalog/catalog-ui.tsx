import Link from "next/link";

import { getAdminSection } from "@/lib/admin-dashboard";

export function catalogStatCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-stone-400">{detail}</p>
    </article>
  );
}

export function catalogPanel({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6 sm:p-8">
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        {action}
      </header>
      <div className="mt-6">{children}</div>
    </article>
  );
}

export function CatalogSectionLinks() {
  const section = getAdminSection("catalogo");
  if (!section) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {section.subroutes.map((subroute) => (
        <Link
          key={subroute.slug}
          href={subroute.href}
          className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
        >
          <p className="font-medium text-white group-hover:text-emerald-300">
            {subroute.label}
          </p>
          <p className="mt-1 text-xs text-stone-500">{subroute.description}</p>
        </Link>
      ))}
    </div>
  );
}

