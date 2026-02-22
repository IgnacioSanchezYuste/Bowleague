// Contexto de autenticación global.
// Gestiona la sesión del usuario: login, registro, logout, edición de perfil y borrado de cuenta.
// La sesión se persiste en AsyncStorage para que no se pierda al cerrar la app.
import * as api from '@/services/api';
import { Usuario } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Clave bajo la que se guarda el objeto usuario en AsyncStorage.
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

// Hook para consumir el contexto en cualquier componente.
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  // isLoading es true mientras se comprueba si hay sesión guardada al arrancar.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  // Al arrancar la app, intenta recuperar el usuario de AsyncStorage.
  // Si el objeto guardado es inválido (sin id), lo elimina por seguridad.
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

  // Llama al endpoint de login y guarda el usuario en estado y AsyncStorage.
  const loginFn = useCallback(async (email: string, password: string) => {
    const userData = await api.login({ email, password });
    if (!userData?.id) {
      throw new Error('No se recibió el ID del usuario. Contacta con soporte.');
    }
    setUser(userData);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  // Registro: igual que login pero primero crea la cuenta en el backend.
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

  // Limpia el estado y elimina la sesión guardada.
  const logoutFn = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  // Actualiza los datos del perfil y sincroniza AsyncStorage con la respuesta del backend.
  const updateProfileFn = useCallback(
    async (data: Partial<Usuario> & { password?: string }) => {
      if (!user) return;
      const updated = await api.updateUsuario(user.id, data);
      setUser(updated);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    },
    [user]
  );

  // Elimina la cuenta en el backend y cierra sesión localmente.
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
