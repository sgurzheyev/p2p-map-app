import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Подтягиваем токен из нашего .env файла
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Единая валюта платформы — USD. Все суммы хранятся в долларах.
const GOAL_USD = 7000;
const INITIAL_RAISED_USD = 5950;
const DONATION_USD = 1;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [peopleHelped, setPeopleHelped] = useState(789112);
  const [raisedUsd, setRaisedUsd] = useState(INITIAL_RAISED_USD);
  const [balanceUsd, setBalanceUsd] = useState(120);

  const progress = Math.min(100, (raisedUsd / GOAL_USD) * 100);
  const canDonate = balanceUsd >= DONATION_USD;

  const donate = () => {
    if (!canDonate) return;
    setRaisedUsd((v) => v + DONATION_USD);
    setBalanceUsd((v) => v - DONATION_USD);
    setPeopleHelped((v) => v + 1);
  };

  useEffect(() => {
    if (map.current) return; // Инициализируем карту только один раз

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 30], // Глобальный обзор: платформа работает по всему миру
      zoom: 1.5,
      projection: 'globe'
    });

    map.current.on('style.load', () => {
      // Настройка атмосферы космоса
      map.current.setFog({
        color: 'rgb(20, 24, 34)',
        'high-color': 'rgb(36, 43, 54)', 
        'horizon-blend': 0.02, 
        'space-color': 'rgb(11, 11, 15)', 
        'star-intensity': 0.6 
      });

      // 1. ЗАГРУЖАЕМ ТЕСТОВЫЕ ДАННЫЕ (GeoJSON)
      map.current.addSource('aid-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [37.6173, 55.7558] }, properties: { status: 'red' } }, // Москва (открыт сбор)
            { type: 'Feature', geometry: { type: 'Point', coordinates: [65.5343, 57.1522] }, properties: { status: 'red' } }, // Тюмень (открыт сбор)
            { type: 'Feature', geometry: { type: 'Point', coordinates: [30.3141, 59.9386] }, properties: { status: 'green' } }, // Питер (завершен)
            { type: 'Feature', geometry: { type: 'Point', coordinates: [104.2806, 52.2978] }, properties: { status: 'green' } } // Иркутск (завершен)
          ]
        }
      });

      // 2. ДОБАВЛЯЕМ СЛОЙ СВЕТЯЩИХСЯ ТОЧЕК НА КАРТУ
      map.current.addLayer({
        id: 'aid-points-layer',
        type: 'circle',
        source: 'aid-points',
        paint: {
          'circle-radius': 12, // Размер точки
          'circle-color': [
            'match',
            ['get', 'status'],
            'red', '#ef4444',   // Ярко-красный для нужды
            'green', '#10b981', // Изумрудный для успеха
            '#ffffff'
          ],
          'circle-blur': 0.4, // Эффект неонового свечения
          'circle-opacity': 0.8
        }
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden font-sans">
      
      {/* Слой Карты */}
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {/* Слой Интерфейса (pointer-events-none пропускает клики на карту) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">

        {/* Верхняя часть: Живой счетчик */}
        <div className="flex flex-col items-center mt-8">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white drop-shadow-[0_0_18px_rgba(255,255,255,0.95)]">
            {peopleHelped.toLocaleString('en-US')}
          </div>
          <div className="text-white text-sm font-bold tracking-widest mt-2 opacity-90 uppercase">
            Людей уже помогли
          </div>
        </div>

        {/* Нижняя часть: Блок доната (pointer-events-auto возвращает кликабельность кнопкам) */}
        <div className="flex flex-col items-center mb-8 pointer-events-auto w-full max-w-md mx-auto space-y-4">
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-3xl w-full text-center shadow-2xl">
            <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-2">История дня (21:00)</p>
            <h3 className="text-white text-lg font-bold mb-3">Помочь Коле восстановить ферму</h3>
            
            <div className="flex justify-between text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">
              <span>Собрано: {usd.format(raisedUsd)}</span>
              <span>Цель: {usd.format(GOAL_USD)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 h-3 rounded-full relative overflow-hidden shadow-[0_0_14px_rgba(37,99,235,0.85)] transition-[width] duration-500 animate-pulse"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Осталось: 21 час 18 минут</p>
          </div>

          <button 
            onClick={donate}
            disabled={!canDonate}
            className="w-full bg-gradient-to-r from-red-950/55 via-red-600/45 to-red-950/55 hover:from-red-800/65 hover:via-red-500/60 hover:to-red-800/65 backdrop-blur-md text-white font-black text-2xl py-5 rounded-3xl shadow-[inset_0_0_22px_rgba(255,255,255,0.16),inset_0_0_38px_rgba(255,0,0,0.28),0_0_32px_rgba(255,0,0,0.7)] transition-all transform hover:scale-[1.02] hover:shadow-[inset_0_0_26px_rgba(255,255,255,0.22),inset_0_0_44px_rgba(255,0,0,0.38),0_0_42px_rgba(255,0,0,0.9)] active:scale-95 flex items-center justify-center gap-2 border border-red-300/70 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            ПОМОЧЬ {usd.format(DONATION_USD)}
          </button>

          <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <span>Баланс: {usd.format(balanceUsd)}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Полная прозрачность P2P
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;