import React, { createContext, useCallback, useContext, useState } from 'react';

import { darkTheme, lightTheme, type Theme, type ThemeColors } from './theme';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkTheme.colors,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(darkTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev.isDark ? lightTheme : darkTheme));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colors: theme.colors,
        isDark: theme.isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
