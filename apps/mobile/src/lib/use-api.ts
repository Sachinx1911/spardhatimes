import { useCallback, useEffect, useState } from 'react';

import { ApiError } from './api';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  /** वाचनीय मराठी वाक्य — थेट पडद्यावर दाखवता येईल असं. */
  error: string | null;
  reload: () => void;
}

/**
 * एका endpoint चा data आणतो, तिन्ही अवस्थांसह.
 *
 * प्रत्येक screen मध्ये `useState` + `useEffect` + try/catch पुन्हा लिहिण्यापेक्षा
 * एकच जागा — म्हणजे loading आणि error सगळीकडे सारखे वागतात.
 *
 * `deps` बदलले की पुन्हा मागवतो. `fetcher` दर render ला नवीन function असतो,
 * म्हणून तो मुद्दाम dependency मध्ये घेतलेला नाही — घेतला असता तर अनंत फेरा झाला असता.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'API शी संपर्क झाला नाही. Server चालू आहे का ते बघा.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload };
}
