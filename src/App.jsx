import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Финансовые стейты (в USD под капотом)
  const [counter, setCounter] = useState(789118);
  const [balance, setBalance] = useState(114);
  const [raised, setRaised] = useState(5956);
  const goal = 7000;

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 30],
      zoom: 1.5,
      projection: 'globe'
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(20, 24, 34)',
        'high-color': 'rgb(36, 43, 54)', 
        'horizon-blend': 0.02, 
        'space-color': 'rgb(11, 11, 15)', 
        'star-intensity': 0.6 
      });

      map.current.addSource('aid-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [37.6173, 55.7558] }, properties: { status: 'red' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [65.5343, 57.1522] }, properties: { status: 'red' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [30.3141, 59.9386] }, properties: { status: 'green' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [104.2806, 52.2978] }, properties: { status: 'green' } }
          ]
        }
      });

      map.current.addLayer({
        id: 'aid-points-layer',
        type: 'circle',
        source: 'aid-points',
        paint: {
          'circle-radius': 12,
          'circle-color': [
            'match',
            ['get', 'status'],
            'red', '#ef4444',
            'green', '#10b981',
            '#ffffff'
          ],
          'circle-blur': 0.4,
          'circle-opacity': 0.9
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Обработка доната
  const handleDonate = () => {
    if (balance >= 1) {
      setBalance(b => b - 1);
      setRaised(r => r + 1);
      setCounter(c => c + 1);
    }
  };

  const progressPercent = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden font-sans">
      
      {/* Слой Карты */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Слой Интерфейса */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">

        {/* Верхняя часть: Счетчик (НЕОНОВЫЙ БЕЛЫЙ) */}
        <div className="flex flex-col items-center mt-8">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
            {counter.toLocaleString('en-US')}
          </div>
          <div className="text-white text-sm font-bold tracking-widest mt-2 opacity-90 uppercase">
            Людей уже помогли
          </div>
        </div>

        {/* Нижняя часть: Блок доната (Кристальная кнопка + Неоновый синий прогресс) */}
        <div className="flex flex-col items-center mb-8 pointer-events-auto w-full max-w-md mx-auto space-y-4">
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-5 rounded-3xl w-full text-center shadow-2xl">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2">История дня (21:00)</p>
            <h3 className="text-white text-lg font-bold mb-3">Помочь Коле восстановить ферму</h3>
            
            <div className="flex justify-between text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">
              <span>Собрано: ${raised.toLocaleString('en-US')}</span>
              <span>Цель: ${goal.toLocaleString('en-US')}</span>
            </div>
            
            {/* Прогресс-бар (ЭЛЕКТРИЧЕСКИЙ СИНИЙ с пульсом) */}
            <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-3 rounded-full relative overflow-hidden transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Осталось: 21 час 18 минут</p>
          </div>

          {/* КРИСТАЛЬНАЯ КНОПКА (НЕОНОВЫЙ КРАСНЫЙ) */}
          <button 
            onClick={handleDonate}
            disabled={balance < 1}
            className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-black text-2xl py-5 rounded-3xl shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-red-400/50 cursor-pointer disabled:opacity-50"
          >
            ПОМОЧЬ $1
          </button>

          <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <span>Баланс: ${balance}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Полная прозрачность P2P
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;