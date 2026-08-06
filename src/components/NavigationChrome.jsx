const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    map: <path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Zm5-3v15m8-12v15" />,
    feed: <path d="M5 4h14v16H5zM8 8h8m-8 4h8m-8 4h5" />,
    activity: <path d="M4 13h3l2-6 4 10 2-5h5M5 4h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" />,
    return: <path d="m9 7-5 5 5 5M4 12h10a6 6 0 0 1 6 6" />,
    locate: <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-9-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
    beacon: <path d="M12 4v3m-6.4-.4 2.1 2.1m8.6 0 2.1-2.1M4 13h3m10 0h3m-8-3a3 3 0 0 0-3 3v3h6v-3a3 3 0 0 0-3-3Zm-5 9h10" />,
    chat: <path d="M4 5h16v11H9l-5 4V5Zm4 4h8m-8 3h5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
        active
          ? 'bg-blue-600/20 text-blue-300 shadow-[inset_0_0_14px_rgba(59,130,246,0.18),0_0_15px_rgba(59,130,246,0.22)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon name={icon} />
      <span className="max-w-full truncate text-[8px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

function FloatingButton({ icon, label, onClick, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md transition hover:scale-105 active:scale-95 ${
        primary
          ? 'border-red-400/60 bg-gradient-to-br from-red-950/55 via-red-600/45 to-red-950/55 text-white shadow-[inset_0_0_14px_rgba(255,255,255,0.16),inset_0_0_24px_rgba(239,68,68,0.3),0_0_22px_rgba(239,68,68,0.65)]'
          : 'border-white/15 bg-slate-900/70 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.55)] hover:border-blue-400/45 hover:text-blue-300'
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function formatActivityTime(iso) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function ContextPanel({
  panel,
  onClose,
  balanceUsd,
  savedCount,
  donatedUsd,
  activityLog = [],
}) {
  if (!panel || panel === 'profile' || panel === 'create') return null;

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-28 z-[36] mx-auto flex max-h-[min(52dvh,28rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/80 shadow-[0_0_32px_rgba(59,130,246,0.22)] backdrop-blur-md sm:inset-x-4 sm:max-h-[min(58dvh,28rem)]">
      <div className="relative shrink-0 border-b border-white/10 px-4 pb-3 pt-5 sm:px-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть панель"
          className="absolute right-3 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white sm:right-4"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        {panel === 'activity' ? (
          <>
            <p className="pr-10 text-[10px] font-black uppercase tracking-widest text-blue-400">
              Активность
            </p>
            <h3 className="mt-2 max-w-[calc(100%-2.5rem)] bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-xl font-black text-transparent drop-shadow-[0_0_14px_rgba(255,255,255,0.7)] sm:text-2xl">
              Журнал помощи
            </h3>
          </>
        ) : null}

        {panel === 'support' ? (
          <>
            <p className="pr-10 text-[10px] font-black uppercase tracking-widest text-red-400">
              Поддержка
            </p>
            <h3 className="mt-2 max-w-[calc(100%-2.5rem)] bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-xl font-black text-transparent drop-shadow-[0_0_14px_rgba(255,255,255,0.7)] sm:text-2xl">
              Мы на связи
            </h3>
          </>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-touch px-4 py-4 sm:px-5">
        {panel === 'activity' ? (
          <>
            <div className="mb-4 grid grid-cols-3 gap-1.5 text-center sm:gap-2">
              {[
                ['Баланс', usd.format(balanceUsd)],
                ['Донаты', usd.format(donatedUsd)],
                ['Избранное', String(savedCount)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-blue-500/30 bg-slate-950/45 p-2 shadow-[inset_0_0_14px_rgba(59,130,246,0.1)] sm:p-2.5"
                >
                  <div className="truncate bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-[10px] font-black text-transparent sm:text-[11px]">
                    {value}
                  </div>
                  <div className="mt-1 text-[7px] font-bold uppercase tracking-wider text-blue-300/90">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {activityLog.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-4 text-xs text-slate-400">
                Пока нет событий. Сохраните проект, отправьте $1 или опубликуйте миссию.
              </p>
            ) : (
              <ul className="space-y-2">
                {activityLog.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">
                          {entry.type === 'donate'
                            ? 'Донат'
                            : entry.type === 'save'
                              ? 'Избранное'
                              : 'Новая миссия'}
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-white">
                          {entry.title}
                        </p>
                        <p className="mt-0.5 break-words text-[10px] text-slate-400">
                          {entry.detail}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {typeof entry.amountUsd === 'number' ? (
                          <p className="text-sm font-black text-blue-200">
                            {usd.format(entry.amountUsd)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {formatActivityTime(entry.at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

        {panel === 'support' ? (
          <>
            <p className="text-sm leading-relaxed text-slate-300">
              Опишите вопрос по переводу или проекту. Канал поддержки защищён и привязан к журналу P2P.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.16),0_0_24px_rgba(239,68,68,0.55)] backdrop-blur-md"
            >
              Начать чат
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function NavigationChrome({
  mode,
  activePanel,
  balanceUsd,
  savedCount,
  donatedUsd,
  activityLog,
  onMapFeed,
  onActivity,
  onPrimary,
  onBeacon,
  onProfile,
  onReturn,
  onLocate,
  onSupport,
  onClosePanel,
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[35]">
      <ContextPanel
        panel={activePanel}
        onClose={onClosePanel}
        balanceUsd={balanceUsd}
        savedCount={savedCount}
        donatedUsd={donatedUsd}
        activityLog={activityLog}
      />

      <div className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 sm:w-[calc(100%-2rem)]">
        <nav className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-center gap-0.5 rounded-[1.75rem] border border-white/15 bg-slate-900/80 p-1.5 shadow-[0_0_30px_rgba(2,6,23,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:gap-1 sm:p-2">
          <NavButton
            icon={mode === 'feed' ? 'map' : 'feed'}
            label={mode === 'feed' ? 'Карта' : 'Лента'}
            active={mode === 'feed'}
            onClick={onMapFeed}
          />
          <NavButton
            icon="activity"
            label="Активность"
            active={activePanel === 'activity'}
            onClick={onActivity}
          />
          <button
            type="button"
            onClick={onPrimary}
            aria-label="Создать миссию"
            className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-red-300/70 bg-gradient-to-br from-red-950/60 via-red-600/55 to-red-950/60 text-white shadow-[inset_0_0_18px_rgba(255,255,255,0.2),inset_0_0_30px_rgba(239,68,68,0.4),0_0_34px_rgba(239,68,68,0.85)] backdrop-blur-md transition hover:scale-105 active:scale-95 sm:h-16 sm:w-16 ${
              activePanel === 'create' ? 'ring-2 ring-blue-400/70' : ''
            }`}
          >
            <Icon name="plus" className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <NavButton
            icon="profile"
            label="Профиль"
            active={activePanel === 'profile'}
            onClick={onProfile}
          />
          <NavButton
            icon="return"
            label="Назад"
            active={false}
            onClick={onReturn}
          />
        </nav>
      </div>

      {mode === 'map' ? (
        <>
          <div className="pointer-events-auto absolute left-3 top-[max(1rem,env(safe-area-inset-top))] flex flex-row gap-2 sm:left-4 sm:top-4 sm:gap-3">
            <FloatingButton icon="locate" label="Моё местоположение" onClick={onLocate} />
            <FloatingButton icon="chat" label="Поддержка" onClick={onSupport} />
          </div>
          <div className="pointer-events-auto absolute right-3 top-[max(1rem,env(safe-area-inset-top))] sm:right-4 sm:top-4">
            <FloatingButton
              icon="beacon"
              label="Прямая помощь"
              onClick={onBeacon ?? onPrimary}
              primary
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
