const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

/**
 * Полноценная модалка профиля поверх карты и ленты.
 * Не трогает Mapbox — только DOM-оверлей.
 */
export default function ProfileModal({
  userEmail,
  balanceUsd,
  donatedUsd,
  savedProjects,
  donationHistory,
  onOpenProject,
  onLogout,
  onClose,
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[38]">
      <button
        type="button"
        aria-label="Закрыть профиль"
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
      />

      <div className="pointer-events-auto absolute inset-x-4 bottom-28 top-16 mx-auto flex max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-blue-400/30 bg-slate-900/85 shadow-[0_0_40px_rgba(59,130,246,0.28)] backdrop-blur-md">
        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Закрыть
          </button>

          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Профиль P2P
          </p>
          <h2 className="mt-2 max-w-[85%] bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_16px_rgba(255,255,255,0.85)]">
            {userEmail || 'Гость'}
          </h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Прозрачная сессия · только USD
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Баланс', usd.format(balanceUsd)],
              ['Пожертвовано', usd.format(donatedUsd)],
              ['Избранное', String(savedProjects.length)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-blue-500/35 bg-slate-950/50 p-3 text-center shadow-[inset_0_0_18px_rgba(59,130,246,0.12)]"
              >
                <div className="bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-sm font-black text-transparent">
                  {value}
                </div>
                <div className="mt-1 text-[8px] font-bold uppercase tracking-wider text-blue-300/90">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                Избранные миссии
              </h3>
              <span className="text-[10px] font-bold text-blue-400">
                {savedProjects.length}
              </span>
            </div>

            {savedProjects.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-4 text-xs text-slate-400">
                Пока нет сохранённых проектов. Свайпните вправо в ленте.
              </p>
            ) : (
              <ul className="space-y-2">
                {savedProjects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => onOpenProject(project.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-left transition hover:border-blue-400/50 hover:bg-blue-950/25"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {project.title}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                          {project.location} · цель {usd.format(project.goalUsd)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-blue-300">
                        Открыть
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                История помощи
              </h3>
              <span className="text-[10px] font-bold text-blue-400">
                {donationHistory.length}
              </span>
            </div>

            {donationHistory.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-4 text-xs text-slate-400">
                Пока нет донатов в этой сессии.
              </p>
            ) : (
              <ul className="space-y-2">
                {donationHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {entry.title}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                        {formatTime(entry.at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenProject(entry.projectId)}
                      className="shrink-0 text-sm font-black text-blue-300"
                    >
                      {usd.format(entry.amountUsd)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/55 via-red-600/45 to-red-950/55 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[inset_0_0_18px_rgba(255,255,255,0.16),inset_0_0_30px_rgba(239,68,68,0.35),0_0_28px_rgba(239,68,68,0.7)] backdrop-blur-md transition hover:scale-[1.01] active:scale-95"
          >
            Выйти из сессии
          </button>
        </div>
      </div>
    </div>
  );
}
