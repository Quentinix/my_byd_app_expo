import React, { createContext, useContext, useState, useMemo } from 'react';
import { lightTheme, darkTheme, type Theme } from '../theme/tokens';

export type ColorSchemeType = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorSchemeType;
  isDark: boolean;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorSchemeType) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialScheme?: ColorSchemeType;
}

export function ThemeProvider({ children, initialScheme = 'light' }: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>(initialScheme);

  const toggleTheme = () => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }, [colorScheme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      isDark: colorScheme === 'dark',
      toggleTheme,
      setColorScheme,
    }),
    [theme, colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
