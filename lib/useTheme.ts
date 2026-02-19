import { useColorScheme } from 'react-native';
import Colors, { getColors, ThemeColors, spacing, borderRadius } from '@/constants/colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  return { isDark, colors, spacing, borderRadius };
}
