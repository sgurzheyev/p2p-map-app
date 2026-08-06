import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AuthGate from './components/AuthGate';
import CreateProjectModal from './components/CreateProjectModal';
import DiscoverySearch from './components/DiscoverySearch';
import NavigationChrome from './components/NavigationChrome';
import ProfileModal from './components/ProfileModal';
import SwipeFeed from './components/SwipeFeed';
import ToastStack from './components/ToastStack';
import { useToasts } from './hooks/useToasts';
import {
  AID_PROJECTS,
  DONATION_USD,
  filterProjects,
  findProjectIndex,
  projectsToGeoJSON,
} from './data/projects';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const INITIAL_BALANCE_USD = 120;

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const openProjectRef = useRef(null);
  const createRevealTimer = useRef(null);
  const { toasts, pushToast, dismissToast } = useToasts();

  // Глобальный обзор (карта) и слой вовлечения (лента) разделены
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showFeed, setShowFeed] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [feedInitialIndex, setFeedInitialIndex] = useState(0);
  const [feedSessionKey, setFeedSessionKey] = useState(0);
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [pendingPanel, setPendingPanel] = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  const [counter, setCounter] = useState(789118);
  const [balanceUsd, setBalanceUsd] = useState(INITIAL_BALANCE_USD);
  const [donatedUsd, setDonatedUsd] = useState(0);
  const [donationHistory, setDonationHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [projects, setProjects] = useState(AID_PROJECTS);
  const [savedIds, setSavedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const visibleProjects = useMemo(
    () => filterProjects(projects, { query: searchQuery, filter: activeFilter }),
    [projects, searchQuery, activeFilter],
  );

  const featured = visibleProjects[0] ?? projects[0] ?? AID_PROJECTS[0];
  const featuredProgress = Math.min(
    100,
    Math.round((featured.raisedUsd / featured.goalUsd) * 100),
  );
  const hasDiscoveryFilters =
    Boolean(activeFilter) || Boolean(searchQuery.trim());

  const savedProjects = useMemo(
    () =>
      savedIds
        .map(
          (id) =>
            projects.find((project) => project.id === id) ||
            AID_PROJECTS.find((project) => project.id === id),
        )
        .filter(Boolean),
    [savedIds, projects],
  );

  const resetDiscoveryFilters = () => {
    setSearchQuery('');
    setActiveFilter(null);
  };

  const openFeedAt = (projectId = null) => {
    let nextProjects = projects;

    // Восстанавливаем проект в ленту, если он был пропущен
    if (projectId && !projects.some((project) => project.id === projectId)) {
      const catalog = AID_PROJECTS.find((project) => project.id === projectId);
      if (catalog) {
        nextProjects = [catalog, ...projects];
        setProjects(nextProjects);
      }
    }

    // Сбрасываем фильтр, если целевая миссия скрыта текущим поиском
    let nextVisible = filterProjects(nextProjects, {
      query: searchQuery,
      filter: activeFilter,
    });
    if (
      projectId &&
      !nextVisible.some((project) => project.id === projectId)
    ) {
      setSearchQuery('');
      setActiveFilter(null);
      nextVisible = nextProjects;
    }

    const targetIndex = findProjectIndex(nextVisible, projectId);

    if (!isAuthenticated) {
      setPendingProjectId(projectId);
      setPendingPanel(null);
      setShowAuthGate(true);
      return;
    }

    setActivePanel(null);
    setFeedInitialIndex(targetIndex);
    setFeedSessionKey((key) => key + 1);
    setShowFeed(true);
  };

  openProjectRef.current = openFeedAt;

  const pushActivity = (entry) => {
    setActivityLog((log) =>
      [
        {
          id: `${entry.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: new Date().toISOString(),
          ...entry,
        },
        ...log,
      ].slice(0, 40),
    );
  };

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
      window.clearTimeout(createRevealTimer.current);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Синхронизация точек карты с отфильтрованным списком миссий
  useEffect(() => {
    const source = map.current?.getSource('aid-points');
    if (source) {
      source.setData(projectsToGeoJSON(visibleProjects));
    }
  }, [visibleProjects]);

  const openFeed = () => openFeedAt(null);

  const openProfile = () => {
    if (!isAuthenticated) {
      setPendingPanel('profile');
      setPendingProjectId(null);
      setShowAuthGate(true);
      return;
    }
    setActivePanel((current) => (current === 'profile' ? null : 'profile'));
  };

  const openCreate = () => {
    if (!isAuthenticated) {
      setPendingPanel('create');
      setPendingProjectId(null);
      setShowAuthGate(true);
      return;
    }
    setActivePanel((current) => (current === 'create' ? null : 'create'));
  };

  const handleAuthenticated = (email) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setShowAuthGate(false);

    if (pendingPanel === 'profile') {
      setPendingPanel(null);
      setPendingProjectId(null);
      setActivePanel('profile');
      return;
    }

    if (pendingPanel === 'create') {
      setPendingPanel(null);
      setPendingProjectId(null);
      setActivePanel('create');
      return;
    }

    const targetIndex = findProjectIndex(
      filterProjects(projects, { query: searchQuery, filter: activeFilter }),
      pendingProjectId,
    );
    setPendingProjectId(null);
    setPendingPanel(null);
    setFeedInitialIndex(targetIndex);
    setFeedSessionKey((key) => key + 1);
    setShowFeed(true);
  };

  const closeFeed = () => {
    setShowFeed(false);
    setFeedInitialIndex(0);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setShowFeed(false);
    setShowAuthGate(true);
    setActivePanel(null);
    setPendingProjectId(null);
    setPendingPanel(null);
    setFeedInitialIndex(0);
    setBalanceUsd(INITIAL_BALANCE_USD);
    setDonatedUsd(0);
    setDonationHistory([]);
    setActivityLog([]);
    setSavedIds([]);
    setProjects(AID_PROJECTS);
    resetDiscoveryFilters();
  };

  const togglePanel = (panel) => {
    if (panel === 'profile') {
      openProfile();
      return;
    }
    if (panel === 'create') {
      openCreate();
      return;
    }
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const handleCreateProject = (project) => {
    setProjects((list) => [project, ...list]);
    resetDiscoveryFilters();
    setActivePanel(null);
    setShowFeed(false);
    pushActivity({
      type: 'create',
      title: project.title,
      detail: `${project.location} · цель ${usd.format(project.goalUsd)}`,
      amountUsd: project.goalUsd,
      projectId: project.id,
    });
    pushToast('Миссия успешно опубликована на карте', { tone: 'success' });

    map.current?.flyTo({
      center: project.coordinates,
      zoom: 5.5,
      duration: 1200,
    });

    // Сразу открываем карточку новой миссии в ленте
    window.clearTimeout(createRevealTimer.current);
    createRevealTimer.current = window.setTimeout(() => {
      setFeedInitialIndex(0);
      setFeedSessionKey((key) => key + 1);
      setShowFeed(true);
    }, 700);
  };

  const handleMapFeedToggle = () => {
    setActivePanel(null);
    if (showFeed) {
      closeFeed();
      return;
    }
    openFeed();
  };

  const handleReturn = () => {
    if (activePanel) {
      setActivePanel(null);
      return;
    }
    if (showFeed) {
      closeFeed();
      return;
    }
    if (showAuthGate) {
      setShowAuthGate(false);
      setPendingProjectId(null);
      setPendingPanel(null);
      return;
    }
    map.current?.flyTo({ center: [20, 30], zoom: 1.5, duration: 900 });
  };

  const handleLocate = () => {
    const centerGlobal = () => {
      map.current?.flyTo({ center: [20, 30], zoom: 1.5, duration: 900 });
    };

    if (!navigator.geolocation) {
      centerGlobal();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 9,
          duration: 1200,
        });
      },
      centerGlobal,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
  };

  const handleDonate = (projectId) => {
    if (balanceUsd < DONATION_USD) return false;

    const project =
      projects.find((item) => item.id === projectId) ||
      AID_PROJECTS.find((item) => item.id === projectId);

    setBalanceUsd((value) => value - DONATION_USD);
    setDonatedUsd((value) => value + DONATION_USD);
    setCounter((value) => value + 1);
    setDonationHistory((history) => [
      {
        id: `${projectId}-${Date.now()}`,
        projectId,
        title: project?.title ?? 'Миссия P2P',
        amountUsd: DONATION_USD,
        at: new Date().toISOString(),
      },
      ...history,
    ].slice(0, 30));
    setProjects((list) =>
      list.map((item) =>
        item.id === projectId
          ? { ...item, raisedUsd: item.raisedUsd + DONATION_USD }
          : item,
      ),
    );
    pushActivity({
      type: 'donate',
      title: project?.title ?? 'Миссия P2P',
      detail: 'Микро-донат отправлен',
      amountUsd: DONATION_USD,
      projectId,
    });
    pushToast('Донат успешно отправлен!', { tone: 'success' });
    return true;
  };

  const handleSkip = (projectId) => {
    setProjects((list) => {
      if (list.length <= 1) return list;
      return list.filter((project) => project.id !== projectId);
    });
  };

  const handleSave = (projectId) => {
    if (savedIds.includes(projectId)) return;

    const project =
      projects.find((item) => item.id === projectId) ||
      AID_PROJECTS.find((item) => item.id === projectId);

    setSavedIds((ids) => [...ids, projectId]);
    pushActivity({
      type: 'save',
      title: project?.title ?? 'Миссия P2P',
      detail: 'Добавлено в избранное',
      projectId,
    });
    pushToast('Добавлено в избранное', { tone: 'info' });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* HUD карты: глобальный обзор, карта остаётся интерактивной */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-6">
        <div className="mt-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] flex w-full max-w-md flex-col items-center self-center sm:mt-8">
          <div className="bg-gradient-to-r from-white via-white to-slate-100 bg-clip-text text-3xl font-black text-transparent drop-shadow-[0_0_22px_rgba(255,255,255,0.95)] sm:text-6xl">
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

          <div className="pointer-events-auto mt-4 w-full px-1">
            <DiscoverySearch
              value={searchQuery}
              onChange={setSearchQuery}
            />
            {hasDiscoveryFilters ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-400/35 bg-slate-950/50 px-3 py-2 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                  На карте: {visibleProjects.length}
                  {activeFilter?.value ? ` · ${activeFilter.value}` : ''}
                </p>
                <button
                  type="button"
                  onClick={resetDiscoveryFilters}
                  className="rounded-full border border-red-400/50 bg-red-950/40 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] backdrop-blur-md transition hover:scale-105 active:scale-95"
                >
                  Сбросить фильтр
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="pointer-events-auto mx-auto mb-[calc(6.5rem+env(safe-area-inset-bottom))] flex w-full max-w-md flex-col items-center space-y-3 sm:mb-28">
          {visibleProjects.length === 0 ? (
            <div className="w-full rounded-3xl border border-blue-400/35 bg-slate-900/80 p-4 text-center shadow-2xl backdrop-blur-md sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                Поиск и фильтры
              </p>
              <h3 className="mt-2 text-base font-black text-white sm:text-lg">
                Миссии не найдены
              </h3>
              <button
                type="button"
                onClick={resetDiscoveryFilters}
                className="mt-4 w-full rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.16),0_0_24px_rgba(239,68,68,0.55)] backdrop-blur-md transition hover:scale-[1.02] active:scale-95"
              >
                Сбросить фильтр
              </button>
            </div>
          ) : (
            <>
              <div className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 p-4 text-center shadow-2xl backdrop-blur-md sm:p-5">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 sm:text-xs">
                  {featured.story} (21:00)
                </p>
                <h3 className="mb-2 text-base font-black text-white sm:text-lg">{featured.title}</h3>

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
                className="flex w-full transform items-center justify-center gap-2 rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-4 text-xl font-black text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.18),inset_0_0_36px_rgba(239,68,68,0.35),0_0_34px_rgba(239,68,68,0.75)] backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 sm:py-5 sm:text-2xl"
              >
                {isAuthenticated ? 'Открыть ленту' : 'Войти и помочь'}
              </button>
            </>
          )}

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
            setPendingPanel(null);
          }}
        />
      ) : null}

      {showFeed && isAuthenticated ? (
        <SwipeFeed
          key={feedSessionKey}
          projects={visibleProjects}
          balanceUsd={balanceUsd}
          savedIds={savedIds}
          initialIndex={feedInitialIndex}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onSearchChange={setSearchQuery}
          onFilterChange={setActiveFilter}
          onResetFilters={resetDiscoveryFilters}
          onSkip={handleSkip}
          onSave={handleSave}
          onDonate={handleDonate}
          onClose={closeFeed}
        />
      ) : null}

      {activePanel === 'profile' && isAuthenticated ? (
        <ProfileModal
          userEmail={userEmail}
          balanceUsd={balanceUsd}
          donatedUsd={donatedUsd}
          savedProjects={savedProjects}
          donationHistory={donationHistory}
          onOpenProject={(projectId) => openFeedAt(projectId)}
          onLogout={handleLogout}
          onClose={() => setActivePanel(null)}
        />
      ) : null}

      {activePanel === 'create' && isAuthenticated ? (
        <CreateProjectModal
          onSubmit={handleCreateProject}
          onClose={() => setActivePanel(null)}
        />
      ) : null}

      <NavigationChrome
        mode={showFeed ? 'feed' : 'map'}
        activePanel={activePanel}
        balanceUsd={balanceUsd}
        savedCount={savedIds.length}
        donatedUsd={donatedUsd}
        activityLog={activityLog}
        onMapFeed={handleMapFeedToggle}
        onActivity={() => togglePanel('activity')}
        onPrimary={openCreate}
        onBeacon={() => openFeedAt(featured.id)}
        onProfile={() => togglePanel('profile')}
        onReturn={handleReturn}
        onLocate={handleLocate}
        onSupport={() => togglePanel('support')}
        onClosePanel={() => setActivePanel(null)}
      />
    </div>
  );
}

export default App;
