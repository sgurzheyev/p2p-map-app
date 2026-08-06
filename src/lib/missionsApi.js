import { AID_PROJECTS, DONATION_USD } from '../data/projects';
import { isSupabaseConfigured, supabase } from './supabase';

/** Нормализация строки миссии из Supabase → UI-модель (USD only). */
export function mapMissionRow(row) {
  if (!row) return null;

  const goalUsd = Number(row.goal_usd);
  const raisedUsd = Number(row.raised_usd);

  return {
    id: row.id,
    title: row.title,
    story: row.story,
    location: row.location,
    tier: row.tier ?? 'gray',
    description: row.description ?? '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    raisedUsd: Number.isFinite(raisedUsd) ? raisedUsd : 0,
    goalUsd: Number.isFinite(goalUsd) && goalUsd > 0 ? goalUsd : 1,
    hoursLeft: Number(row.hours_left) || 0,
    minutesLeft: Number(row.minutes_left) || 0,
    coordinates: [Number(row.lng) || 0, Number(row.lat) || 0],
    status: row.status === 'green' ? 'green' : 'red',
    imageUrl: row.image_url ?? '',
    imageAlt: row.image_alt ?? row.title,
    mediaFallback: row.media_fallback ?? 'from-slate-900 via-red-950 to-slate-950',
  };
}

function toMissionInsert(project, createdBy = null) {
  const [lng, lat] = project.coordinates ?? [0, 0];
  return {
    id: project.id,
    title: project.title,
    story: project.story,
    location: project.location,
    tier: project.tier ?? 'gray',
    description: project.description ?? '',
    tags: project.tags ?? [],
    raised_usd: Number(project.raisedUsd) || 0,
    goal_usd: Number(project.goalUsd) || 1,
    hours_left: Number(project.hoursLeft) || 48,
    minutes_left: Number(project.minutesLeft) || 0,
    lng: Number(lng),
    lat: Number(lat),
    status: project.status === 'green' ? 'green' : 'red',
    image_url: project.imageUrl ?? null,
    image_alt: project.imageAlt ?? project.title,
    media_fallback: project.mediaFallback ?? null,
    created_by: createdBy,
  };
}

/**
 * Загрузка миссий. Без Supabase — локальный каталог AID_PROJECTS.
 */
export async function fetchMissions() {
  if (!isSupabaseConfigured || !supabase) {
    return { data: AID_PROJECTS, error: null, source: 'local' };
  }

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[supabase] fetchMissions:', error.message);
    return { data: AID_PROJECTS, error, source: 'local-fallback' };
  }

  const missions = (data ?? []).map(mapMissionRow).filter(Boolean);
  if (missions.length === 0) {
    return { data: AID_PROJECTS, error: null, source: 'local-empty' };
  }

  return { data: missions, error: null, source: 'supabase' };
}

/**
 * Публикация миссии. Локально всегда ок; в Supabase — upsert.
 * Суммы только USD (goal_usd / raised_usd).
 */
export async function publishMission(project, createdBy = null) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: project, error: null, source: 'local' };
  }

  const payload = toMissionInsert(project, createdBy);
  const { data, error } = await supabase
    .from('missions')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.warn('[supabase] publishMission:', error.message);
    return { data: project, error, source: 'local-fallback' };
  }

  return { data: mapMissionRow(data) ?? project, error: null, source: 'supabase' };
}

/**
 * Инкремент raised_usd после микро-доната (строго DONATION_USD).
 */
export async function recordDonation(missionId, amountUsd = DONATION_USD) {
  const amount = Number(amountUsd);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: new Error('Сумма доната должна быть в USD > 0') };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { error: null, source: 'local' };
  }

  const { data: current, error: readError } = await supabase
    .from('missions')
    .select('raised_usd')
    .eq('id', missionId)
    .maybeSingle();

  if (readError) {
    console.warn('[supabase] recordDonation read:', readError.message);
    return { error: readError, source: 'local-fallback' };
  }

  if (!current) {
    return { error: null, source: 'local' };
  }

  const nextRaised = (Number(current.raised_usd) || 0) + amount;
  const { error } = await supabase
    .from('missions')
    .update({ raised_usd: nextRaised })
    .eq('id', missionId);

  if (error) {
    console.warn('[supabase] recordDonation update:', error.message);
    return { error, source: 'local-fallback' };
  }

  return { error: null, source: 'supabase' };
}

/**
 * Избранное пользователя по email (демо-профиль без Auth session).
 */
export async function fetchBookmarks(userEmail) {
  if (!userEmail) {
    return { data: [], error: null, source: 'local' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null, source: 'local' };
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('mission_id')
    .eq('user_email', userEmail.toLowerCase());

  if (error) {
    console.warn('[supabase] fetchBookmarks:', error.message);
    return { data: [], error, source: 'local-fallback' };
  }

  return {
    data: (data ?? []).map((row) => row.mission_id).filter(Boolean),
    error: null,
    source: 'supabase',
  };
}

export async function saveBookmark(userEmail, missionId) {
  if (!userEmail || !missionId) {
    return { error: new Error('Нужны email и mission id') };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { error: null, source: 'local' };
  }

  const { error } = await supabase.from('bookmarks').upsert(
    {
      user_email: userEmail.toLowerCase(),
      mission_id: missionId,
    },
    { onConflict: 'user_email,mission_id' },
  );

  if (error) {
    console.warn('[supabase] saveBookmark:', error.message);
    return { error, source: 'local-fallback' };
  }

  return { error: null, source: 'supabase' };
}

/**
 * Upsert профиля сессии (email + баланс в USD).
 */
export async function upsertProfile(userEmail, { balanceUsd, donatedUsd } = {}) {
  if (!userEmail) {
    return { error: new Error('Нужен email') };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { error: null, source: 'local' };
  }

  const payload = {
    email: userEmail.toLowerCase(),
    balance_usd: Number.isFinite(Number(balanceUsd)) ? Number(balanceUsd) : null,
    donated_usd: Number.isFinite(Number(donatedUsd)) ? Number(donatedUsd) : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.warn('[supabase] upsertProfile:', error.message);
    return { error, source: 'local-fallback' };
  }

  return { error: null, source: 'supabase' };
}

export async function fetchProfile(userEmail) {
  if (!userEmail) {
    return { data: null, error: null, source: 'local' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: null, source: 'local' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('email, balance_usd, donated_usd')
    .eq('email', userEmail.toLowerCase())
    .maybeSingle();

  if (error) {
    console.warn('[supabase] fetchProfile:', error.message);
    return { data: null, error, source: 'local-fallback' };
  }

  if (!data) {
    return { data: null, error: null, source: 'supabase' };
  }

  return {
    data: {
      email: data.email,
      balanceUsd: Number(data.balance_usd),
      donatedUsd: Number(data.donated_usd),
    },
    error: null,
    source: 'supabase',
  };
}
