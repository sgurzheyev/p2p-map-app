/** Активные P2P-сборы. Все суммы строго в USD. */
export const AID_PROJECTS = [
  {
    id: 'kole-farm',
    title: 'Помочь Коле восстановить ферму',
    story: '🌾 Агро- и Эко-инициативы',
    location: 'Тюмень',
    tier: 'yellow',
    description: 'Прямой сбор на восстановление теплиц, техники и следующего урожая после пожара.',
    tags: ['#MicroAgri', '#Permaculture', '#FarmRecovery'],
    raisedUsd: 5950,
    goalUsd: 7000,
    hoursLeft: 21,
    minutesLeft: 18,
    coordinates: [65.5343, 57.1522],
    status: 'red',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Фермерское поле на закате',
    mediaFallback: 'from-slate-900 via-red-950 to-slate-950',
  },
  {
    id: 'anna-clinic',
    title: 'Сбор на операцию для Анны',
    story: '🏥 Медицина и Здоровье',
    location: 'Москва',
    tier: 'green',
    description: 'Адресная помощь на операцию и восстановление без посредников и скрытых комиссий.',
    tags: ['#MedicalAid', '#HealthSupport', '#DirectAid'],
    raisedUsd: 12400,
    goalUsd: 18000,
    hoursLeft: 8,
    minutesLeft: 42,
    coordinates: [37.6173, 55.7558],
    status: 'red',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Врач в современной клинике',
    mediaFallback: 'from-slate-950 via-blue-950 to-slate-900',
  },
  {
    id: 'school-roof',
    title: 'Крыша для сельской школы',
    story: '🏫 Инфраструктура и Школы',
    location: 'Иркутск',
    tier: 'green',
    description: 'Сообщество собирает средства на безопасную крышу до начала нового учебного года.',
    tags: ['#Education', '#Infrastructure', '#CommunityAid'],
    raisedUsd: 3100,
    goalUsd: 9500,
    hoursLeft: 46,
    minutesLeft: 5,
    coordinates: [104.2806, 52.2978],
    status: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Школьный класс и ученики',
    mediaFallback: 'from-slate-900 via-indigo-950 to-slate-950',
  },
  {
    id: 'veteran-home',
    title: 'Ремонт дома для ветерана',
    story: '🤝 Сообщество и Семья',
    location: 'Санкт-Петербург',
    tier: 'gray',
    description: 'Прямое финансирование срочного ремонта кровли и отопления перед холодным сезоном.',
    tags: ['#CommunityAid', '#FamilySupport', '#DirectSupport'],
    raisedUsd: 8700,
    goalUsd: 10000,
    hoursLeft: 15,
    minutesLeft: 30,
    coordinates: [30.3141, 59.9386],
    status: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Портрет участника проекта',
    mediaFallback: 'from-slate-950 via-rose-950 to-slate-900',
  },
];

export const DONATION_USD = 1;

/** GeoJSON точек карты, связанный с id проектов для навигации в ленту */
export function projectsToGeoJSON(projects) {
  return {
    type: 'FeatureCollection',
    features: projects.map((project) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: project.coordinates,
      },
      properties: {
        status: project.status,
        projectId: project.id,
      },
    })),
  };
}

export function findProjectIndex(projects, projectId) {
  if (!projectId) return 0;
  const index = projects.findIndex((project) => project.id === projectId);
  return index >= 0 ? index : 0;
}
