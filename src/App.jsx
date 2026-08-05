import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Подтягиваем токен из нашего .env файла
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Инициализируем карту только один раз

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Та самая стильная темная тема
      center: [37.6173, 55.7558], // Координаты (например, Москва для старта)
      zoom: 3, // Максимальное отдаление, чтобы видеть всю страну
      projection: 'globe' // 3D-глобус при отдалении
    });

    // Добавляем атмосферу (звезды и туман)
    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(20, 24, 34)', // Цвет тумана
        'high-color': 'rgb(36, 43, 54)', 
        'horizon-blend': 0.02, 
        'space-color': 'rgb(11, 11, 15)', 
        'star-intensity': 0.6 
      });
    });
  });

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default App;