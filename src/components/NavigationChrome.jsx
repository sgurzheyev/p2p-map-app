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

function ContextPanel({
  panel,
  onClose,
  balanceUsd,
  savedCount,
  donatedUsd,
}) {
  if (!panel || panel === 'profile' || panel === 'create') return null;

  return (
    <div className="pointer-events-auto absolute inset-x-4 bottom-28 z-[36] mx-auto max-w-md rounded-3xl border border-white/15 bg-slate-900/80 p-5 shadow-[0_0_32px_rgba(59,130,246,0.22)] backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть панель"
        className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>

      {panel === 'activity' ? (
        <>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Активность
          </p>
          <h3 className="mt-2 bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_14px_rgba(255,255,255,0.7)]">
            Журнал помощи
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span>Пожертвовано в сессии</span>
              <strong className="text-blue-300">{usd.format(donatedUsd)}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span>Сохранено проектов</span>
              <strong className="text-blue-300">{savedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Доступно для помощи</span>
              <strong className="text-white">{usd.format(balanceUsd)}</strong>
            </div>
          </div>
        </>
      ) : null}

      {panel === 'support' ? (
        <>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Поддержка
          </p>
          <h3 className="mt-2 bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_14px_rgba(255,255,255,0.7)]">
            Мы на связи
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
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
  );
}

export default function NavigationChrome({
  mode,
  activePanel,
  balanceUsd,
  savedCount,
  donatedUsd,
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
      />

      <div className="pointer-events-auto absolute bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
        <nav className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-center gap-1 rounded-[1.75rem] border border-white/15 bg-slate-900/80 p-2 shadow-[0_0_30px_rgba(2,6,23,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
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
            className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-red-300/70 bg-gradient-to-br from-red-950/60 via-red-600/55 to-red-950/60 text-white shadow-[inset_0_0_18px_rgba(255,255,255,0.2),inset_0_0_30px_rgba(239,68,68,0.4),0_0_34px_rgba(239,68,68,0.85)] backdrop-blur-md transition hover:scale-105 active:scale-95 ${
              activePanel === 'create' ? 'ring-2 ring-blue-400/70' : ''
            }`}
          >
            <Icon name="plus" className="h-7 w-7" />
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
          <div className="pointer-events-auto absolute left-4 top-4 flex flex-row gap-3">
            <FloatingButton icon="locate" label="Моё местоположение" onClick={onLocate} />
            <FloatingButton icon="chat" label="Поддержка" onClick={onSupport} />
          </div>
          <div className="pointer-events-auto absolute right-4 top-4">
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
