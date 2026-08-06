import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 2800;
const MAX_TOASTS = 3;

/**
 * Глобальный стек toast-уведомлений для ключевых действий P2P.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback(
    (id) => {
      clearTimer(id);
      setToasts((list) => list.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const pushToast = useCallback(
    (message, options = {}) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const tone = options.tone ?? 'success';
      const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;

      setToasts((list) =>
        [...list, { id, message, tone }].slice(-MAX_TOASTS),
      );

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, pushToast, dismissToast };
}
