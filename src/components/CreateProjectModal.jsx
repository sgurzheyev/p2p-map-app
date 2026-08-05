import { useMemo, useState } from 'react';
import { getCategoryByLabel, MISSION_CATEGORIES } from '../data/categories';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const TIERS = [
  { value: 'green', label: 'Аккредитованный фонд' },
  { value: 'yellow', label: 'Верифицирован по ID' },
  { value: 'gray', label: 'Базовая проверка' },
];

const CITY_PRESETS = [
  { name: 'Москва', coordinates: [37.6173, 55.7558] },
  { name: 'Санкт-Петербург', coordinates: [30.3141, 59.9386] },
  { name: 'Тюмень', coordinates: [65.5343, 57.1522] },
  { name: 'Иркутск', coordinates: [104.2806, 52.2978] },
  { name: 'Казань', coordinates: [49.1221, 55.7887] },
  { name: 'Новосибирск', coordinates: [82.9346, 55.0084] },
];

const inputClass =
  'w-full rounded-2xl border border-slate-600/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.45)]';

function parseTags(raw) {
  return raw
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
}

function uniqueTags(tags) {
  return [...new Set(tags)].slice(0, 8);
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

/**
 * Модалка создания новой миссии.
 * Категория автоматически подставляет релевантные хэштеги.
 */
export default function CreateProjectModal({ onSubmit, onClose }) {
  const defaultCategory = MISSION_CATEGORIES[0];
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Москва');
  const [description, setDescription] = useState('');
  const [goalUsd, setGoalUsd] = useState('5000');
  const [category, setCategory] = useState(defaultCategory.label);
  const [selectedTags, setSelectedTags] = useState(defaultCategory.tags);
  const [customTags, setCustomTags] = useState('');
  const [tier, setTier] = useState('gray');
  const [lng, setLng] = useState('37.6173');
  const [lat, setLat] = useState('55.7558');
  const [error, setError] = useState('');

  const activeCategory = useMemo(
    () => getCategoryByLabel(category),
    [category],
  );

  const suggestedTags = activeCategory.tags;

  const goalPreview = useMemo(() => {
    const value = Number(goalUsd);
    return Number.isFinite(value) && value > 0 ? usd.format(value) : '—';
  }, [goalUsd]);

  const applyCity = (cityName) => {
    setLocation(cityName);
    const preset = CITY_PRESETS.find((city) => city.name === cityName);
    if (!preset) return;
    setLng(String(preset.coordinates[0]));
    setLat(String(preset.coordinates[1]));
  };

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    const config = getCategoryByLabel(nextCategory);
    setSelectedTags(config.tags);
    setError('');
  };

  const toggleSuggestedTag = (tag) => {
    setSelectedTags((tags) =>
      tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextLocation = location.trim();
    const nextDescription = description.trim();
    const nextGoal = Number(goalUsd);
    const nextLng = Number(lng);
    const nextLat = Number(lat);
    const nextTags = uniqueTags([
      ...selectedTags,
      ...parseTags(customTags),
    ]);

    if (!nextTitle || !nextLocation || !nextDescription) {
      setError('Заполните название, регион и описание');
      return;
    }
    if (!Number.isFinite(nextGoal) || nextGoal < 1) {
      setError('Цель должна быть положительной суммой в USD');
      return;
    }
    if (!Number.isFinite(nextLng) || !Number.isFinite(nextLat)) {
      setError('Укажите корректные координаты точки на карте');
      return;
    }
    if (nextLng < -180 || nextLng > 180 || nextLat < -90 || nextLat > 90) {
      setError('Координаты вне допустимого диапазона');
      return;
    }

    onSubmit({
      id: `mission-${Date.now()}`,
      title: nextTitle,
      story: category,
      location: nextLocation,
      tier,
      description: nextDescription,
      tags: nextTags.length > 0 ? nextTags : ['#P2PRelief'],
      raisedUsd: 0,
      goalUsd: Math.round(nextGoal),
      hoursLeft: 48,
      minutesLeft: 0,
      coordinates: [nextLng, nextLat],
      status: 'red',
      imageUrl: activeCategory.imageUrl,
      imageAlt: nextTitle,
      mediaFallback: activeCategory.mediaFallback,
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[38]">
      <button
        type="button"
        aria-label="Закрыть создание миссии"
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
      />

      <div className="pointer-events-auto absolute inset-x-4 bottom-28 top-12 mx-auto flex max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-blue-400/30 bg-slate-900/85 shadow-[0_0_40px_rgba(59,130,246,0.28)] backdrop-blur-md">
        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Закрыть
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Новая миссия
          </p>
          <h2 className="mt-2 bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_16px_rgba(255,255,255,0.85)]">
            Создать сбор
          </h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Цель: {goalPreview} · только USD
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <Field label="Название проекта">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Помочь восстановить дом"
                className={inputClass}
              />
            </Field>

            <Field label="Регион / город">
              <select
                value={CITY_PRESETS.some((city) => city.name === location) ? location : ''}
                onChange={(e) => applyCity(e.target.value)}
                className={`${inputClass} mb-2`}
              >
                <option value="" disabled>
                  Выберите город (симуляция пина)
                </option>
                {CITY_PRESETS.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Или введите свой регион"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Долгота">
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Широта">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Категория">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={inputClass}
              >
                {MISSION_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Хэштеги
                </span>
                <span className="rounded-full border border-blue-400/45 bg-blue-600/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.35)] backdrop-blur-md">
                  Близко к вашему выбору
                </span>
              </div>

              <div className="mb-2 flex flex-wrap gap-2">
                {suggestedTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => toggleSuggestedTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-[9px] font-black tracking-wide backdrop-blur-md transition hover:scale-105 active:scale-95 ${
                        isActive
                          ? 'border-blue-300/70 bg-blue-600/35 text-white shadow-[0_0_14px_rgba(59,130,246,0.55)]'
                          : 'border-white/20 bg-slate-950/45 text-slate-300 hover:border-blue-400/45 hover:text-blue-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <input
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="Доп. теги: #MyTag, #LocalAid"
                className={inputClass}
              />
            </div>

            <Field label="Уровень верификации">
              <div className="grid grid-cols-1 gap-2">
                {TIERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTier(item.value)}
                    className={`rounded-2xl border px-3 py-2 text-left text-[11px] font-bold transition ${
                      tier === item.value
                        ? 'border-blue-400/60 bg-blue-600/25 text-blue-100 shadow-[0_0_14px_rgba(59,130,246,0.35)]'
                        : 'border-white/10 bg-slate-950/45 text-slate-300 hover:border-blue-400/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Описание">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Кратко опишите, на что пойдут средства"
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Цель сбора (USD)">
              <input
                type="number"
                min="1"
                step="1"
                value={goalUsd}
                onChange={(e) => setGoalUsd(e.target.value)}
                className={inputClass}
              />
            </Field>

            {error ? (
              <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                {error}
              </p>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              type="submit"
              className="w-full rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/55 via-red-600/45 to-red-950/55 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[inset_0_0_18px_rgba(255,255,255,0.16),inset_0_0_30px_rgba(239,68,68,0.35),0_0_28px_rgba(239,68,68,0.7)] backdrop-blur-md transition hover:scale-[1.01] active:scale-95"
            >
              Опубликовать миссию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
