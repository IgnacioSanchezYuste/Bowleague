// Contexto de tema (claro / oscuro).
// Guarda la preferencia en AsyncStorage para que persista entre sesiones.
import { darkColors, lightColors, ThemeColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Clave bajo la que se guarda la preferencia de tema.
const THEME_KEY = '@bowleague_theme';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;  // Paleta activa; los componentes solo usan colors.xxx
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// Hook para consumir el tema en cualquier componente.
export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Al arrancar, carga la preferencia guardada.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'dark') setIsDark(true);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Alterna el tema y guarda la nueva preferencia en AsyncStorage.
  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light').catch(() => {});
      return newValue;
    });
  }, []);

  // Memoizado para que el value del Provider sea referencialmente estable
  // y no fuerce re-render a todos los consumidores en cada render.
  const value = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      toggleTheme,
    }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
