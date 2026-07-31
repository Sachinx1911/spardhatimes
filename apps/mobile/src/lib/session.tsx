import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, type Me } from './api';

/**
 * कोण login आहे — एकाच ठिकाणी.
 *
 * App सुरू होताना साठवलेला token तपासला जातो. तो चालत असेल तर विद्यार्थी आत,
 * नाहीतर बाहेर.
 */
interface SessionValue {
  user: Me | null;
  /**
   * पहिली तपासणी चालू आहे — कोण login आहे हे **अजून ठरलेलं नाही**. `user` null
   * असणं म्हणजे "कोणी नाही" नव्हे; हा flag false होईपर्यंत काहीच ठरलेलं नाही.
   *
   * त्यामुळे API विनंती याच्या आधी पाठवायची नाही — token अजून जागेवर नसतो आणि
   * 401 येतो. `useApi` हे स्वतः सांभाळतो, म्हणून screens ला याची काळजी घ्यावी
   * लागत नाही; थेट `fetch` करणाऱ्या नवीन code ला लागेल.
   */
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Development मध्ये आपोआप login.
 *
 * Login screen मुद्दाम सर्वात शेवटी बांधायचा आहे — तो आधी बांधला असता तर पुढच्या
 * प्रत्येक screen ची चाचणी घेताना दर वेळी login करावा लागला असता. तोपर्यंत
 * `.env` मधल्या चाचणी विद्यार्थ्याने आपोआप आत जातो.
 *
 * `__DEV__` मुळे हे production build मध्ये कधीच चालत नाही, आणि credentials
 * source मध्ये नाहीत — `.env` gitignored आहे. Login screen आल्यावर हा भाग निघेल.
 */
const DEV_PHONE = process.env.EXPO_PUBLIC_DEV_PHONE;
const DEV_PASSWORD = process.env.EXPO_PUBLIC_DEV_PASSWORD;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let me = await api.restoreSession();

      if (!me && __DEV__ && DEV_PHONE && DEV_PASSWORD) {
        try {
          me = await api.login(DEV_PHONE, DEV_PASSWORD);
        } catch (err) {
          // API बंद असेल किंवा विद्यार्थी नसेल — screens रिकामे दिसतील, पण app
          // कोसळू नये. कारण console मध्ये दिसतं म्हणजे शोधता येतं.
          console.warn('Dev auto-login झाला नाही:', (err as Error).message);
        }
      }

      if (!cancelled) {
        setUser(me);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    setUser(await api.login(phone, password));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionValue {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession फक्त SessionProvider च्या आत वापरता येतो.');
  return value;
}
