import * as api from '@/services/api';
import { Usuario } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const USER_KEY = '@bowleague_user';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    nombre: string;
    apellidos?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Usuario> & { password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) {
          setUser(parsed);
        } else {
          await AsyncStorage.removeItem(USER_KEY);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const loginFn = useCallback(async (email: string, password: string) => {
    const userData = await api.login({ email, password });
    if (!userData?.id) {
      throw new Error('No se recibió el ID del usuario. Contacta con soporte.');
    }
    setUser(userData);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const registerFn = useCallback(
    async (data: { nombre: string; apellidos?: string; email: string; password: string }) => {
      const userData = await api.registro(data);
      if (!userData?.id) {
        throw new Error('No se recibió el ID del usuario. Contacta con soporte.');
      }
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    },
    []
  );

  const logoutFn = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const updateProfileFn = useCallback(
    async (data: Partial<Usuario> & { password?: string }) => {
      if (!user) return;
      const updated = await api.updateUsuario(user.id, data);
      setUser(updated);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    },
    [user]
  );

  const deleteAccountFn = useCallback(async () => {
    if (!user) return;
    await api.deleteUsuario(user.id);
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login: loginFn,
        register: registerFn,
        logout: logoutFn,
        updateProfile: updateProfileFn,
        deleteAccount: deleteAccountFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
