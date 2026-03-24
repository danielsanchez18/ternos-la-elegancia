import Link from "next/link";

import { getAdminSection } from "@/lib/admin-dashboard";

export function statCard({
  title,
  value,
  detail,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: string | number;
  detail: React.ReactNode;
  icon?: React.ElementType;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-[2rem] border p-6 ${
        alert
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] uppercase tracking-[0.3em] ${
            alert ? "text-amber-400" : "text-stone-500"
          }`}
        >
          {title}
        </p>
        {Icon && (
          <Icon
            className={`size-5 ${alert ? "text-amber-400" : "text-stone-600"}`}
          />
        )}
      </div>
      <p
        className={`mt-4 text-4xl font-semibold tracking-tight ${
          alert ? "text-amber-50" : "text-white"
        }`}
      >
        {value}
      </p>
      <div
        className={`mt-3 text-sm leading-6 ${
          alert ? "text-amber-200" : "text-stone-400"
        }`}
      >
        {detail}
      </div>
    </article>
  );
}

export function panel({
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

export function InventorySectionLinks() {
  const section = getAdminSection("inventario");

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
