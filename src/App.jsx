import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AuthGate from './components/AuthGate';
import SwipeFeed from './components/SwipeFeed';
import {
  AID_PROJECTS,
  DONATION_USD,
  findProjectIndex,
  projectsToGeoJSON,
} from './data/projects';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const openProjectRef = useRef(null);

  // Глобальный обзор (карта) и слой вовлечения (лента) разделены
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showFeed, setShowFeed] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [feedInitialIndex, setFeedInitialIndex] = useState(0);
  const [feedSessionKey, setFeedSessionKey] = useState(0);
  const [pendingProjectId, setPendingProjectId] = useState(null);

  const [counter, setCounter] = useState(789118);
  const [balanceUsd, setBalanceUsd] = useState(120);
  const [projects, setProjects] = useState(AID_PROJECTS);
  const [savedIds, setSavedIds] = useState([]);

  const featured = projects[0] ?? AID_PROJECTS[0];
  const featuredProgress = Math.min(
    100,
    Math.round((featured.raisedUsd / featured.goalUsd) * 100),
  );

  const openFeedAt = (projectId = null) => {
    const targetIndex = findProjectIndex(projects, projectId);

    if (!isAuthenticated) {
      setPendingProjectId(projectId);
      setShowAuthGate(true);
      return;
    }

    setFeedInitialIndex(targetIndex);
    setFeedSessionKey((key) => key + 1);
    setShowFeed(true);
  };

  openProjectRef.current = openFeedAt;

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 30],
      zoom: 1.5,
      projection: 'globe',
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(20, 24, 34)',
        'high-color': 'rgb(36, 43, 54)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 15)',
        'star-intensity': 0.6,
      });

      map.current.addSource('aid-points', {
        type: 'geojson',
        data: projectsToGeoJSON(AID_PROJECTS),
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
            '#ffffff',
          ],
          'circle-blur': 0.4,
          'circle-opacity': 0.9,
        },
      });

      // Клик по точке → открыть карточку проекта в ленте
      map.current.on('click', 'aid-points-layer', (event) => {
        const projectId = event.features?.[0]?.properties?.projectId;
        if (!projectId) return;
        openProjectRef.current?.(projectId);
      });

      map.current.on('mouseenter', 'aid-points-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'aid-points-layer', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Синхронизация точек карты с актуальным списком проектов
  useEffect(() => {
    const source = map.current?.getSource('aid-points');
    if (source) {
      source.setData(projectsToGeoJSON(projects));
    }
  }, [projects]);

  const openFeed = () => openFeedAt(null);

  const handleAuthenticated = (email) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setShowAuthGate(false);

    const targetIndex = findProjectIndex(projects, pendingProjectId);
    setPendingProjectId(null);
    setFeedInitialIndex(targetIndex);
    setFeedSessionKey((key) => key + 1);
    setShowFeed(true);
  };

  const closeFeed = () => {
    setShowFeed(false);
    setFeedInitialIndex(0);
  };

  const handleDonate = (projectId) => {
    if (balanceUsd < DONATION_USD) return;

    setBalanceUsd((value) => value - DONATION_USD);
    setCounter((value) => value + 1);
    setProjects((list) =>
      list.map((project) =>
        project.id === projectId
          ? { ...project, raisedUsd: project.raisedUsd + DONATION_USD }
          : project,
      ),
    );
  };

  const handleSkip = (projectId) => {
    setProjects((list) => {
      if (list.length <= 1) return list;
      return list.filter((project) => project.id !== projectId);
    });
  };

  const handleSave = (projectId) => {
    setSavedIds((ids) => (ids.includes(projectId) ? ids : [...ids, projectId]));
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {/* HUD карты: глобальный обзор, карта остаётся интерактивной */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6">
        <div className="mt-8 flex flex-col items-center">
          <div className="bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-6xl font-black text-transparent drop-shadow-[0_0_22px_rgba(255,255,255,0.95)]">
            {counter.toLocaleString('en-US')}
          </div>
          <div className="mt-2 text-sm font-bold uppercase tracking-widest text-white opacity-90">
            Людей уже помогли
          </div>
          {isAuthenticated ? (
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-300">
              {userEmail}
            </div>
          ) : (
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Нажмите точку на карте, чтобы открыть профиль
            </div>
          )}
        </div>

        <div className="pointer-events-auto mx-auto mb-8 flex w-full max-w-md flex-col items-center space-y-4">
          <div className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 p-5 text-center shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-red-400">
              {featured.story} (21:00)
            </p>
            <h3 className="mb-3 text-lg font-bold text-white">{featured.title}</h3>

            <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Собрано: {usd.format(featured.raisedUsd)}</span>
              <span>Цель: {usd.format(featured.goalUsd)}</span>
            </div>

            <div className="mb-2 h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <div
                className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-[#3B82F6] to-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.85)] animate-pulse transition-all duration-300"
                style={{ width: `${featuredProgress}%` }}
              >
                <div className="absolute inset-0 animate-pulse bg-white/20" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Осталось: {featured.hoursLeft} час {featured.minutesLeft} минут
            </p>
          </div>

          <button
            type="button"
            onClick={openFeed}
            className="flex w-full transform items-center justify-center gap-2 rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-5 text-2xl font-black text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.18),inset_0_0_36px_rgba(239,68,68,0.35),0_0_34px_rgba(239,68,68,0.75)] backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95"
          >
            {isAuthenticated ? 'Открыть ленту' : 'Войти и помочь'}
          </button>

          <div className="flex w-full justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Баланс: {usd.format(balanceUsd)}</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Полная прозрачность P2P
            </span>
          </div>
        </div>
      </div>

      {showAuthGate ? (
        <AuthGate
          onAuthenticated={handleAuthenticated}
          onClose={() => {
            setShowAuthGate(false);
            setPendingProjectId(null);
          }}
        />
      ) : null}

      {showFeed && isAuthenticated ? (
        <SwipeFeed
          key={feedSessionKey}
          projects={projects}
          balanceUsd={balanceUsd}
          savedIds={savedIds}
          initialIndex={feedInitialIndex}
          onSkip={handleSkip}
          onSave={handleSave}
          onDonate={handleDonate}
          onClose={closeFeed}
        />
      ) : null}
    </div>
  );
}

export default App;
