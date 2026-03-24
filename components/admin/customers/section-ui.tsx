import Link from "next/link";

export function AdminStatCard({
  title,
  value,
  detail,
  href,
}: {
  title: string;
  value: string | number;
  detail: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-stone-200">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="transition hover:translate-y-[-1px] hover:bg-white/[0.02]"
    >
      {content}
    </Link>
  );
}

export function AdminSectionPanel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
