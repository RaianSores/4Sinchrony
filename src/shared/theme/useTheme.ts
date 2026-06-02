import { brandColors, spacing, borderRadius, typography, shadow, AppColors } from './index';

export interface Theme {
  colors: AppColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadow: typeof shadow;
  isDark: boolean;
}

export function useTheme(): Theme {
  return {
    colors: brandColors,
    spacing,
    borderRadius,
    typography,
    shadow,
    isDark: true,
  };
}
