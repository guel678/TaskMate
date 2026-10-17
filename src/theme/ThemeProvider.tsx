import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { AppColors, darkColors, lightColors } from './tokens';

type AppTheme = {
  colorScheme: Exclude<ColorSchemeName, null | undefined>;
  colors: AppColors;
  isDark: boolean;
};

const defaultTheme: AppTheme = {
  colorScheme: 'light',
  colors: lightColors,
  isDark: false,
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const value = useMemo<AppTheme>(
    () => ({
      colorScheme,
      colors: colorScheme === 'dark' ? darkColors : lightColors,
      isDark: colorScheme === 'dark',
    }),
    [colorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function useThemedStyles<T>(factory: (colors: AppColors) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
