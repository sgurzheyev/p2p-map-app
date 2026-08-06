/** Города с координатами для симуляции пина на карте. */
export const CITY_PRESETS = [
  { name: 'Москва', country: 'Россия', coordinates: [37.6173, 55.7558] },
  { name: 'Санкт-Петербург', country: 'Россия', coordinates: [30.3141, 59.9386] },
  { name: 'Тюмень', country: 'Россия', coordinates: [65.5343, 57.1522] },
  { name: 'Иркутск', country: 'Россия', coordinates: [104.2806, 52.2978] },
  { name: 'Казань', country: 'Россия', coordinates: [49.1221, 55.7887] },
  { name: 'Новосибирск', country: 'Россия', coordinates: [82.9346, 55.0084] },
  { name: 'Екатеринбург', country: 'Россия', coordinates: [60.5975, 56.8389] },
  { name: 'Владивосток', country: 'Россия', coordinates: [131.8855, 43.1155] },
  { name: 'Сочи', country: 'Россия', coordinates: [39.7303, 43.6028] },
  { name: 'Краснодар', country: 'Россия', coordinates: [38.9753, 45.0355] },
  { name: 'Нижний Новгород', country: 'Россия', coordinates: [44.002, 56.3269] },
  { name: 'Самара', country: 'Россия', coordinates: [50.15, 53.1959] },
  { name: 'Belgrade', country: 'Serbia', coordinates: [20.4489, 44.7866] },
  { name: 'Белград', country: 'Сербия', coordinates: [20.4489, 44.7866] },
  { name: 'Podgorica', country: 'Montenegro', coordinates: [19.2594, 42.4304] },
  { name: 'Подгорица', country: 'Черногория', coordinates: [19.2594, 42.4304] },
  { name: 'Hurghada', country: 'Egypt', coordinates: [33.8116, 27.2579] },
  { name: 'Хургада', country: 'Египет', coordinates: [33.8116, 27.2579] },
  { name: 'Cairo', country: 'Egypt', coordinates: [31.2357, 30.0444] },
  { name: 'Istanbul', country: 'Turkey', coordinates: [28.9784, 41.0082] },
  { name: 'Berlin', country: 'Germany', coordinates: [13.405, 52.52] },
  { name: 'Warsaw', country: 'Poland', coordinates: [21.0122, 52.2297] },
  { name: 'Kyiv', country: 'Ukraine', coordinates: [30.5234, 50.4501] },
  { name: 'Tbilisi', country: 'Georgia', coordinates: [44.8271, 41.7151] },
  { name: 'Yerevan', country: 'Armenia', coordinates: [44.5152, 40.1811] },
  { name: 'Almaty', country: 'Kazakhstan', coordinates: [76.8512, 43.2389] },
  { name: 'Tashkent', country: 'Uzbekistan', coordinates: [69.2401, 41.2995] },
  { name: 'Dubai', country: 'UAE', coordinates: [55.2708, 25.2048] },
  { name: 'New York', country: 'USA', coordinates: [-74.006, 40.7128] },
  { name: 'London', country: 'UK', coordinates: [-0.1276, 51.5074] },
  { name: 'Paris', country: 'France', coordinates: [2.3522, 48.8566] },
  { name: 'Tokyo', country: 'Japan', coordinates: [139.6917, 35.6895] },
];

export function filterCities(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return CITY_PRESETS.slice(0, 8);

  return CITY_PRESETS.filter((city) => {
    const haystack = `${city.name} ${city.country}`.toLowerCase();
    return haystack.includes(needle);
  }).slice(0, 10);
}

export function findCityByName(name) {
  const needle = name.trim().toLowerCase();
  return CITY_PRESETS.find((city) => city.name.toLowerCase() === needle) ?? null;
}
