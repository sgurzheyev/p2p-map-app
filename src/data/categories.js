/** Категории миссий и авто-теги «Близко к вашему выбору». */
export const MISSION_CATEGORIES = [
  {
    id: 'urgent',
    label: '🚨 Срочный сбор',
    tags: ['#UrgentRelief', '#DirectAid', '#P2PRelief'],
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-red-950 to-slate-900',
  },
  {
    id: 'animals',
    label: '🐾 Животные и Природа',
    tags: ['#AnimalRescue', '#WildlifeAid', '#NatureCare'],
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-900 via-emerald-950 to-slate-950',
  },
  {
    id: 'tactical',
    label: '🛡️ Тактическая и Техническая поддержка',
    tags: ['#TechSupport', '#TacticalAid', '#DirectSupport'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-slate-800 to-blue-950',
  },
  {
    id: 'agro',
    label: '🌾 Агро- и Эко-инициативы',
    tags: ['#MicroAgri', '#Permaculture', '#FarmRecovery'],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-900 via-lime-950 to-slate-950',
  },
  {
    id: 'medical',
    label: '🏥 Медицина и Здоровье',
    tags: ['#MedicalAid', '#HealthSupport', '#DirectAid'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-blue-950 to-slate-900',
  },
  {
    id: 'infrastructure',
    label: '🏫 Инфраструктура и Школы',
    tags: ['#Education', '#Infrastructure', '#CommunityAid'],
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-900 via-indigo-950 to-slate-950',
  },
  {
    id: 'eco',
    label: '🌍 Экологическая очистка',
    tags: ['#EcoClean', '#ClimateAction', '#NatureCare'],
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-teal-950 to-slate-900',
  },
  {
    id: 'community',
    label: '🤝 Сообщество и Семья',
    tags: ['#CommunityAid', '#FamilySupport', '#DirectSupport'],
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-rose-950 to-slate-900',
  },
  {
    id: 'science',
    label: '🔬 Открытая наука и Стартапы',
    tags: ['#OpenScience', '#TechStartup', '#Innovation'],
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-900 via-cyan-950 to-slate-950',
  },
  {
    id: 'micro',
    label: '✨ Ежедневный микро-донат',
    tags: ['#MicroGiving', '#DailySupport', '#P2PRelief'],
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1600&q=85',
    mediaFallback: 'from-slate-950 via-violet-950 to-slate-900',
  },
];

export function getCategoryByLabel(label) {
  return (
    MISSION_CATEGORIES.find((category) => category.label === label) ||
    MISSION_CATEGORIES[0]
  );
}
