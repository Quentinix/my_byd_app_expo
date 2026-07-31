import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ExpoBydClient, BydVehicle, Session, BydSessionExpiredError } from '../services/byd/client';
import { BydSecureStorage } from '../services/byd/secureStorage';
import { router } from 'expo-router';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthContextType {
  status: AuthStatus;
  session: Session | null;
  vehicles: BydVehicle[];
  activeVehicle: BydVehicle | null;
  errorMessage: string | null;
  rememberMe: boolean;
  savedUsername: string;
  countryCode: string;
  client: ExpoBydClient | null;

  login: (username: string, password: string, countryCode?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshVehicleRealtime: (vin?: string) => Promise<void>;
  selectVehicle: (vin: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [vehicles, setVehicles] = useState<BydVehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<BydVehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [savedUsername, setSavedUsername] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('FR');
  const [client, setClient] = useState<ExpoBydClient | null>(null);

  const handleSessionExpired = useCallback(async (msg?: string) => {
    await BydSecureStorage.clearSession();
    setSession(null);
    setVehicles([]);
    setActiveVehicle(null);
    setClient(null);
    setStatus('idle');
    setErrorMessage(msg || 'Votre session a expiré ou le jeton est invalide. Veuillez vous reconnecter.');
  }, []);

  const loadSavedState = useCallback(async () => {
    try {
      const savedCreds = await BydSecureStorage.loadCredentials();
      if (savedCreds) {
        setSavedUsername(savedCreds.username);
        setCountryCode(savedCreds.countryCode);
        setRememberMe(savedCreds.rememberMe);
      }

      const savedSession = await BydSecureStorage.loadSession();
      if (savedSession) {
        const newClient = new ExpoBydClient({
          username: savedCreds?.username || 'user',
          password: savedCreds?.password || '',
          country_code: savedCreds?.countryCode || 'FR',
        });
        newClient.setSession(savedSession.userId, savedSession.signToken, savedSession.encryToken);
        setSession(newClient.session);
        setClient(newClient);

        try {
          const vehs = await newClient.getVehicles();
          setVehicles(vehs);
          if (vehs.length > 0) setActiveVehicle(vehs[0]);
          setStatus('authenticated');
          return;
        } catch (err: any) {
          if (err instanceof BydSessionExpiredError || err?.name === 'BydSessionExpiredError') {
            await handleSessionExpired('Jeton de session expiré au démarrage');
            return;
          } else {
            await BydSecureStorage.clearSession();
          }
        }
      }
      setStatus('idle');
    } catch {
      setStatus('idle');
    }
  }, [handleSessionExpired]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSavedState();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSavedState]);

  const login = async (
    username: string,
    password: string,
    cCode: string = 'FR',
    remMe: boolean = true
  ) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const newClient = new ExpoBydClient({
        username,
        password,
        country_code: cCode,
      });

      const newSession = await newClient.login();
      setSession(newSession);
      setClient(newClient);
      setRememberMe(remMe);
      setSavedUsername(username);
      setCountryCode(cCode);

      // Persist credentials securely
      await BydSecureStorage.saveCredentials({
        username,
        password: remMe ? password : undefined,
        countryCode: cCode,
        rememberMe: remMe,
      });

      // Persist active session securely
      await BydSecureStorage.saveSession({
        userId: newSession.user_id,
        signToken: newSession.sign_token,
        encryToken: newSession.encry_token,
        timestamp: Date.now(),
      });

      const vehs = await newClient.getVehicles();
      setVehicles(vehs);
      if (vehs.length > 0) {
        setActiveVehicle(vehs[0]);
      }

      setStatus('authenticated');
      router.replace('/Dashboard');

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Erreur lors de la connexion au Cloud BYD');
    }
  };

  const refreshVehicles = async () => {
    if (!client) return;
    try {
      const vehs = await client.getVehicles();
      setVehicles(vehs);
      if (vehs.length > 0 && !activeVehicle) {
        setActiveVehicle(vehs[0]);
      }
    } catch (err: any) {
      if (err instanceof BydSessionExpiredError || err?.name === 'BydSessionExpiredError') {
        await handleSessionExpired();
      } else {
        throw err;
      }
    }
  };

  const refreshVehicleRealtime = async (vin?: string) => {
    if (!client) return;
    const targetVin = vin || activeVehicle?.vin;
    if (!targetVin) return;

    const targetVehicle = vehicles.find((v) => v.vin === targetVin) || activeVehicle;
    if (!targetVehicle) return;

    try {
      const updated = await client.fetchVehicleRealtime(targetVehicle);
      setVehicles((prev) => prev.map((v) => (v.vin === updated.vin ? updated : v)));
      if (activeVehicle?.vin === updated.vin) {
        setActiveVehicle(updated);
      }
    } catch (err: any) {
      if (err instanceof BydSessionExpiredError || err?.name === 'BydSessionExpiredError') {
        await handleSessionExpired();
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    setStatus('loading');
    await BydSecureStorage.clearSession();
    setSession(null);
    setClient(null);
    setVehicles([]);
    setActiveVehicle(null);
    setStatus('idle');
    router.replace('/Authentication');
  };

  const selectVehicle = (vin: string) => {
    const found = vehicles.find((v) => v.vin === vin);
    if (found) {
      setActiveVehicle(found);
    }
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        session,
        vehicles,
        activeVehicle,
        errorMessage,
        rememberMe,
        savedUsername,
        countryCode,
        client,
        login,
        logout,
        refreshVehicles,
        refreshVehicleRealtime,
        selectVehicle,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
