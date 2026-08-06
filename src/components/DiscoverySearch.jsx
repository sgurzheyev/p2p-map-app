/**
 * Быстрый поиск миссий по названию, городу или ключевым словам.
 */
export default function DiscoverySearch({
  value,
  onChange,
  placeholder = 'Поиск: город, тег, название…',
  className = '',
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Поиск миссий</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-2xl border border-blue-400/35 bg-slate-950/55 py-2.5 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-slate-500 focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.45)] ${
          value ? 'pl-4 pr-20' : 'px-4'
        }`}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-900/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-blue-400/50 hover:text-blue-200"
        >
          Очистить
        </button>
      ) : null}
    </label>
  );
}
