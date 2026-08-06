const TONE_STYLES = {
  success:
    'border-emerald-400/45 shadow-[0_0_24px_rgba(16,185,129,0.28)]',
  info: 'border-blue-400/45 shadow-[0_0_24px_rgba(59,130,246,0.32)]',
  accent:
    'border-red-400/40 shadow-[0_0_24px_rgba(239,68,68,0.28)]',
};

/**
 * Стек glassmorphic toast-уведомлений.
 * Верх экрана — без пересечения с bottom-28, модалками и кнопками ленты.
 */
export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts?.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] z-[60] flex flex-col items-center gap-2 px-3 sm:px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-slate-950/75 px-3 py-3 sm:px-4 backdrop-blur-md ${
            TONE_STYLES[toast.tone] ?? TONE_STYLES.success
          }`}
        >
          <p className="min-w-0 flex-1 break-words bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-[12px] font-bold leading-snug text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Закрыть уведомление"
            className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-blue-400/50 hover:text-blue-200"
          >
            OK
          </button>
        </div>
      ))}
    </div>
  );
}
