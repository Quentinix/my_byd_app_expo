export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  inputBackground: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryContainer: string;
  primaryText: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  shadow: string;
  overlay: string;
}

export interface ThemeOpacity {
  disabled: number;
  pressed: number;
  subtle: number;
}

export interface ThemeLayout {
  maxContentWidth: number;
  screenPadding: number;
}

export interface ThemeRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  pill: number;
  full: number;
}

export interface ThemeVehicle {
  batteryHigh: string;
  batteryMedium: string;
  batteryLow: string;
}

export interface Theme extends ThemeColors {
  opacity: ThemeOpacity;
  layout: ThemeLayout;
  radius: ThemeRadius;
  vehicle: ThemeVehicle;
  getBatteryColor: (soc?: number) => string;
}

export const sharedLayout: ThemeLayout = {
  maxContentWidth: 500,
  screenPadding: 20,
};

export const sharedOpacity: ThemeOpacity = {
  disabled: 0.5,
  pressed: 0.8,
  subtle: 0.12,
};

export const sharedRadius: ThemeRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  pill: 20,
  full: 9999,
};

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  inputBackground: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  primary: '#0066FF',
  primaryContainer: '#EBF3FF',
  primaryText: '#FFFFFF',
  accent: '#0284C7',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  shadow: '#0F172A',
  overlay: 'rgba(15, 23, 42, 0.4)',
};

const darkColors: ThemeColors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceVariant: '#21262D',
  inputBackground: '#0D1117',
  border: '#30363D',
  borderSubtle: '#21262D',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#090D16',
  primary: '#00F0FF',
  primaryContainer: 'rgba(0, 240, 255, 0.15)',
  primaryText: '#090D16',
  accent: '#0066FF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

function createBatteryColorHelper(colors: ThemeColors) {
  return (soc?: number): string => {
    if (typeof soc !== 'number' || isNaN(soc)) return colors.textMuted;
    if (soc < 20) return colors.error;
    if (soc <= 50) return colors.warning;
    return colors.success;
  };
}

export const lightTheme: Theme = {
  ...lightColors,
  opacity: sharedOpacity,
  layout: sharedLayout,
  radius: sharedRadius,
  vehicle: {
    batteryHigh: lightColors.success,
    batteryMedium: lightColors.warning,
    batteryLow: lightColors.error,
  },
  getBatteryColor: createBatteryColorHelper(lightColors),
};

export const darkTheme: Theme = {
  ...darkColors,
  opacity: sharedOpacity,
  layout: sharedLayout,
  radius: sharedRadius,
  vehicle: {
    batteryHigh: darkColors.success,
    batteryMedium: darkColors.warning,
    batteryLow: darkColors.error,
  },
  getBatteryColor: createBatteryColorHelper(darkColors),
};
