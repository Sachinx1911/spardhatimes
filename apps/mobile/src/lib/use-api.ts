import { useCallback, useEffect, useState } from 'react';

import { ApiError } from './api';
import { useSession } from './session';

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
 *
 * ## Session ठरल्यावरच विनंती
 *
 * इथला प्रत्येक endpoint token मागतो, आणि app सुरू होताना token कोणाचा आहे हे
 * ठरायला एक फेरी लागते (`SessionProvider` — साठवलेला token तपासणं, dev मध्ये
 * आपोआप login). React मध्ये **मुलांचे effects आधी चालतात, पालकाचे नंतर** —
 * म्हणून screen चा हा effect `SessionProvider` च्या effect *आधीच* चालतो. गंमत
 * म्हणून नाही, तर नेहमीच. Token यायच्या आधी विनंती गेली की 401, आणि screen
 * "Login आवश्यक आहे." वर अडकून बसतो — login नंतर कोणी पुन्हा मागवतच नाही.
 *
 * म्हणून: session ठरेपर्यंत थांबतो (`loading` तसाच true — screen चा spinner
 * चालूच राहतो), आणि **कोण** आहे ते बदललं की पुन्हा मागवतो. दुसरा भाग
 * महत्त्वाचा — login/logout नंतर आपोआप ताजा data येतो.
 *
 * हे इथे एकदाच केलं आहे, प्रत्येक screen मध्ये नाही — नाहीतर उद्या नवीन screen
 * लिहिताना हे विसरलं जाईल आणि तोच bug पुन्हा उगवेल.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const { user, loading: sessionLoading } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    // अजून कोण आहे ते ठरलेलं नाही — `loading` true ठेवून थांबतो.
    if (sessionLoading) return;

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
  }, [...deps, tick, sessionLoading, user?.id]);

  return { data, loading, error, reload };
}
