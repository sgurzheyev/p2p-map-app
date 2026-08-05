import { useEffect, useMemo, useRef, useState } from 'react';
import { DONATION_USD } from '../data/projects';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const VERTICAL_SWIPE_THRESHOLD = 80;
const HORIZONTAL_SWIPE_THRESHOLD = 100;
const TRANSITION_MS = 280;

function ProjectBackdrop({ project }) {
  if (!project) return null;

  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${project.mediaFallback}`} />
      <img
        src={project.imageUrl}
        alt={project.imageAlt}
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%)]" />
    </>
  );
}

/**
 * Вертикальная лента свайпов в стиле TikTok.
 * Влево — пропустить, вправо — в избранное, кристальная кнопка — донат $1.
 */
export default function SwipeFeed({
  projects,
  balanceUsd,
  savedIds,
  onSkip,
  onSave,
  onDonate,
  onClose,
}) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(1);
  const [flash, setFlash] = useState(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const transitionTimer = useRef(null);
  const wheelTimer = useRef(null);
  const wheelLocked = useRef(false);

  useEffect(() => {
    if (index > projects.length - 1) {
      setIndex(Math.max(projects.length - 1, 0));
    }
  }, [index, projects.length]);

  useEffect(() => {
    return () => {
      window.clearTimeout(transitionTimer.current);
      window.clearTimeout(wheelTimer.current);
    };
  }, []);

  const project = projects[Math.min(index, Math.max(projects.length - 1, 0))] ?? null;
  const previewProject = projects.length > 1
    ? projects[(index + transitionDirection + projects.length) % projects.length]
    : project;

  const progress = useMemo(() => {
    if (!project) return 0;
    return Math.min(100, Math.round((project.raisedUsd / project.goalUsd) * 100));
  }, [project]);

  const finishTransition = (nextIndex) => {
    setIndex(nextIndex);
    setDrag({ x: 0, y: 0 });
    setFlash(null);
    setIsAnimating(false);
  };

  const navigate = (direction) => {
    if (isAnimating || projects.length < 2) return;

    const viewportHeight = window.innerHeight;
    const nextIndex = (index + direction + projects.length) % projects.length;
    setTransitionDirection(direction);
    setIsAnimating(true);
    setDrag({ x: 0, y: direction > 0 ? -viewportHeight : viewportHeight });
    transitionTimer.current = window.setTimeout(
      () => finishTransition(nextIndex),
      TRANSITION_MS,
    );
  };

  const commitHorizontal = (action) => {
    if (!project || isAnimating) return;

    const isSave = action === 'save';
    const viewportWidth = window.innerWidth;
    setTransitionDirection(1);
    setFlash(action);
    setIsAnimating(true);
    setDrag({ x: isSave ? viewportWidth : -viewportWidth, y: 0 });

    transitionTimer.current = window.setTimeout(() => {
      if (isSave) {
        onSave(project.id);
        finishTransition((index + 1) % projects.length);
        return;
      }

      onSkip(project.id);
      finishTransition(index >= projects.length - 1 ? 0 : index);
    }, TRANSITION_MS);
  };

  const commitDonate = () => {
    if (!project || balanceUsd < DONATION_USD) return;
    onDonate(project.id);
  };

  const onPointerDown = (event) => {
    if (isAnimating) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    setDrag({
      x: event.clientX - pointerStart.current.x,
      y: event.clientY - pointerStart.current.y,
    });
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const isVertical = Math.abs(drag.y) > Math.abs(drag.x);

    if (isVertical && Math.abs(drag.y) >= VERTICAL_SWIPE_THRESHOLD) {
      navigate(drag.y < 0 ? 1 : -1);
      return;
    }

    if (!isVertical && drag.x <= -HORIZONTAL_SWIPE_THRESHOLD) {
      commitHorizontal('skip');
      return;
    }

    if (!isVertical && drag.x >= HORIZONTAL_SWIPE_THRESHOLD) {
      commitHorizontal('save');
      return;
    }

    setDrag({ x: 0, y: 0 });
  };

  const onWheel = (event) => {
    event.preventDefault();
    if (wheelLocked.current || isAnimating || Math.abs(event.deltaY) < 15) return;

    wheelLocked.current = true;
    navigate(event.deltaY > 0 ? 1 : -1);
    wheelTimer.current = window.setTimeout(() => {
      wheelLocked.current = false;
    }, TRANSITION_MS + 180);
  };

  if (!project) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 pointer-events-auto">
        <p className="text-white font-bold uppercase tracking-widest">Лента пуста</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-400"
        >
          К карте
        </button>
      </div>
    );
  }

  const rotate = Math.max(-10, Math.min(10, drag.x / 22));
  const isSaved = savedIds.includes(project.id);

  return (
    <div
      className="absolute inset-0 z-30 overflow-hidden bg-slate-950 pointer-events-auto"
      onWheel={onWheel}
    >
      <div className="absolute inset-0 scale-[1.02]">
        <ProjectBackdrop project={previewProject} />
      </div>

      <div
        className="absolute inset-0 touch-none select-none"
        style={{
          transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotate}deg)`,
          opacity: isAnimating ? 0.35 : 1,
          transition: isDragging
            ? 'none'
            : `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ProjectBackdrop project={project} />

        {(flash === 'skip' || drag.x < -40) && (
          <div className="absolute left-6 top-24 rounded-2xl border border-slate-300/40 bg-slate-900/50 px-4 py-2 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md">
            Пропустить
          </div>
        )}
        {(flash === 'save' || drag.x > 40) && (
          <div className="absolute right-6 top-24 rounded-2xl border border-blue-300/50 bg-blue-950/40 px-4 py-2 text-sm font-black uppercase tracking-widest text-blue-100 backdrop-blur-md">
            Избранное
          </div>
        )}

        {Math.abs(drag.y) > 40 && (
          <div className="absolute left-1/2 top-24 -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/45 px-4 py-2 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
            {drag.y < 0 ? 'Следующий проект' : 'Предыдущий проект'}
          </div>
        )}

        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between p-5"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-slate-950/40 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md"
          >
            Карта
          </button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {index + 1} / {projects.length}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white">
            Баланс: {usd.format(balanceUsd)}
          </div>
        </div>

        <div className="pointer-events-none absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
          <span className="text-base text-white/70">↑</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 [writing-mode:vertical-rl]">
            Листайте
          </span>
          <span className="text-base text-white/70">↓</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 pb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-400">
              {project.story} · {project.location}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.9)]">
              {project.title}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-700/50 bg-slate-900/55 p-4 backdrop-blur-md">
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Собрано: {usd.format(project.raisedUsd)}</span>
              <span>Цель: {usd.format(project.goalUsd)}</span>
            </div>
            <div className="mb-2 h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <div
                className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-[#3B82F6] to-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.85)] animate-pulse transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-blue-400">
                Осталось: {project.hoursLeft} ч {project.minutesLeft} мин
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                P2P прозрачность
              </span>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => navigate(1)}
              className="rounded-3xl border border-slate-500/50 bg-slate-950/45 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:scale-[1.02] active:scale-95"
            >
              Далее
            </button>
            <button
              type="button"
              onClick={() => commitHorizontal('save')}
              className="rounded-3xl border border-blue-400/50 bg-blue-950/35 py-4 text-xs font-black uppercase tracking-widest text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.35)] backdrop-blur-md transition hover:scale-[1.02] active:scale-95"
            >
              {isSaved ? 'Сохранено' : 'Избранное'}
            </button>
            <button
              type="button"
              onClick={commitDonate}
              disabled={balanceUsd < DONATION_USD}
              className="rounded-3xl border border-red-400/60 bg-gradient-to-r from-red-950/50 via-red-600/45 to-red-950/50 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.16),inset_0_0_28px_rgba(239,68,68,0.35),0_0_28px_rgba(239,68,68,0.7)] backdrop-blur-md transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              Помочь {usd.format(DONATION_USD)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
