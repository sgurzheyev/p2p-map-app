const TIERS = {
  green: {
    label: 'Аккредитованный фонд',
    classes:
      'border-emerald-400/55 bg-emerald-950/45 text-emerald-200 shadow-[inset_0_0_12px_rgba(16,185,129,0.14),0_0_15px_rgba(16,185,129,0.4)]',
  },
  yellow: {
    label: 'Верифицирован по ID',
    classes:
      'border-amber-300/55 bg-amber-950/40 text-amber-200 shadow-[inset_0_0_12px_rgba(245,158,11,0.12),0_0_15px_rgba(245,158,11,0.35)]',
  },
  gray: {
    label: 'Базовая проверка',
    classes:
      'border-slate-400/40 bg-slate-900/55 text-slate-300 shadow-[inset_0_0_10px_rgba(148,163,184,0.08),0_0_12px_rgba(15,23,42,0.5)]',
  },
};

function ShieldIcon({ verified }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
      {verified ? <path d="m9 12 2 2 4-4" /> : <path d="M12 9v4m0 3h.01" />}
    </svg>
  );
}

/** Стеклянный индикатор уровня доверия проекта. */
export default function TrustBadge({ tier = 'gray' }) {
  const config = TIERS[tier] ?? TIERS.gray;

  return (
    <span
      title={`Уровень доверия: ${config.label}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider backdrop-blur-md ${config.classes}`}
    >
      <ShieldIcon verified={tier === 'green'} />
      {config.label}
    </span>
  );
}
