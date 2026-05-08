import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

import { apiPost } from "@/lib/api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isLocked: boolean;
  pin: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => boolean;
  lockApp: () => void;
  clearPin: () => Promise<void>;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const PIN_KEY = "app_pin";

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pin, setStoredPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser, storedPin] = await Promise.all([
        secureGet(TOKEN_KEY),
        secureGet(USER_KEY),
        secureGet(PIN_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedPin) {
          setStoredPin(storedPin);
          setIsLocked(true);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: AuthUser }>(
      "/auth/login",
      { email, password }
    );
    await Promise.all([
      secureSet(TOKEN_KEY, res.token),
      secureSet(USER_KEY, JSON.stringify(res.user)),
    ]);
    setToken(res.token);
    setUser(res.user);
    setIsLocked(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiPost<{ token: string; user: AuthUser }>(
      "/auth/signup",
      { name, email, password }
    );
    await Promise.all([
      secureSet(TOKEN_KEY, res.token),
      secureSet(USER_KEY, JSON.stringify(res.user)),
    ]);
    setToken(res.token);
    setUser(res.user);
    setIsLocked(false);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      secureDelete(TOKEN_KEY),
      secureDelete(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
    setIsLocked(false);
  }, []);

  const setPin = useCallback(async (newPin: string) => {
    await secureSet(PIN_KEY, newPin);
    setStoredPin(newPin);
  }, []);

  const unlock = useCallback(
    (enteredPin: string): boolean => {
      if (enteredPin === pin) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [pin]
  );

  const lockApp = useCallback(() => {
    if (pin) setIsLocked(true);
  }, [pin]);

  const clearPin = useCallback(async () => {
    await secureDelete(PIN_KEY);
    setStoredPin(null);
    setIsLocked(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLocked,
        pin,
        login,
        signup,
        logout,
        setPin,
        unlock,
        lockApp,
        clearPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
