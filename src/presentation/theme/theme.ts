export type ThemeColors = {
  background: string;
  surface: string;
  surfaceLight: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGreen: string;
  accentRed: string;
  accentAmber: string;
  overlay: string;
  mapOverlay: string;
};

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0b0f17',
    surface: '#131823',
    surfaceLight: '#1b2232',
    border: '#242c3f',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#38bdf8',
    accentGreen: '#22c55e',
    accentRed: '#ef4444',
    accentAmber: '#f59e0b',
    overlay: '#131823',
    mapOverlay: '#131823',
  },
};

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f1f5f9',
    surface: '#ffffff',
    surfaceLight: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#0284c7',
    accentGreen: '#16a34a',
    accentRed: '#dc2626',
    accentAmber: '#d97706',
    overlay: '#ffffff',
    mapOverlay: '#ffffff',
  },
};
