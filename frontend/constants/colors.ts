const Colors = {
  light: {
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255,255,255,0.65)',
    primary: '#B8F53A',
    primaryDark: '#8BC220',
    textPrimary: '#0D0D0D',
    textSecondary: '#6B6B6B',
    textMuted: '#A0A0A0',
    border: 'rgba(0,0,0,0.08)',
    cardShadow: 'rgba(0,0,0,0.08)',
    glassBorder: 'rgba(255,255,255,0.18)',
    tint: '#B8F53A',
    tabIconDefault: '#A0A0A0',
    tabIconSelected: '#0D0D0D',
    danger: '#FF4444',
    warning: '#FF9500',
    info: '#007AFF',
  },
  dark: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceGlass: 'rgba(20,20,20,0.70)',
    primary: '#B8F53A',
    primaryDark: '#8BC220',
    textPrimary: '#F5F5F0',
    textSecondary: '#A0A0A0',
    textMuted: '#5A5A5A',
    border: 'rgba(255,255,255,0.08)',
    cardShadow: 'rgba(0,0,0,0.40)',
    glassBorder: 'rgba(255,255,255,0.08)',
    tint: '#B8F53A',
    tabIconDefault: '#5A5A5A',
    tabIconSelected: '#F5F5F0',
    danger: '#FF4444',
    warning: '#FF9500',
    info: '#007AFF',
  },
};

export default Colors;

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const leadColors = {
  COLD: '#007AFF',
  WARM: '#FF9500',
  HOT: '#FF4444',
  VERIFIED: '#B8F53A',
} as const;
