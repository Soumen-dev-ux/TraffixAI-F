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
    background: '#0f1117',
    surface: '#1a1d27',
    surfaceLight: '#22252f',
    border: '#2a2d37',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#38bdf8',
    accentGreen: '#22c55e',
    accentRed: '#ef4444',
    accentAmber: '#f59e0b',
    overlay: 'rgba(15,17,23,0.88)',
    mapOverlay: 'rgba(15,17,23,0.75)',
  },
};

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceLight: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#0ea5e9',
    accentGreen: '#16a34a',
    accentRed: '#dc2626',
    accentAmber: '#d97706',
    overlay: 'rgba(255,255,255,0.92)',
    mapOverlay: 'rgba(255,255,255,0.8)',
  },
};
