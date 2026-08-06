import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Стеклянный оверлей регистрации по email.
 * Блокирует доступ к ленте до успешной отправки валидного адреса.
 */
export default function AuthGate({ onAuthenticated, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();

    if (!EMAIL_RE.test(value)) {
      setError('Введите корректный email');
      return;
    }

    setError('');
    setSubmitting(true);

    // Заглушка Mail API: подтверждение email открывает доступ к ленте
    window.setTimeout(() => {
      setSubmitting(false);
      onAuthenticated(value);
    }, 450);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md pointer-events-auto sm:p-6">
      <div className="max-h-[min(90dvh,40rem)] w-full max-w-md overflow-y-auto overscroll-contain scroll-touch rounded-3xl border border-white/15 bg-slate-900/70 p-5 shadow-[0_0_40px_rgba(59,130,246,0.25)] backdrop-blur-md sm:p-6">
        <div className="mb-6 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-blue-400">Безопасный вход</p>
          <h2 className="mt-2 bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,0.9)] sm:text-3xl">
            P2P Beacon
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Лента точечного финансирования доступна после регистрации по email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-600/70 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.45)]"
            />
          </label>

          {error ? (
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-4 text-lg font-black text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.18),inset_0_0_36px_rgba(239,68,68,0.35),0_0_34px_rgba(239,68,68,0.75)] backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {submitting ? 'Проверяем…' : 'Войти в ленту'}
          </button>
        </form>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-white"
          >
            Вернуться к карте
          </button>
        ) : null}
      </div>
    </div>
  );
}
