import { getColors, spacing, borderRadius } from '@/constants/colors';
import { useThemeContext } from './ThemeContext';

export function useTheme() {
  const { isDark, themeMode, setThemeMode } = useThemeContext();
  const colors = getColors(isDark);

  return { isDark, themeMode, setThemeMode, colors, spacing, borderRadius };
}
