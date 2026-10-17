export const lightColors = {
  page: '#EFE9E5',
  background: '#FAF7F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F2ECE8',
  surfaceCompleted: '#FFF0EB',
  primary: '#B94732',
  primarySoft: '#F7DDD6',
  primaryDark: '#F1DAD3',
  success: '#B94732',
  primaryPressed: '#9F3828',
  primaryTrack: '#E7D2CB',
  onPrimary: '#FFFFFF',
  onPrimaryDark: '#211C1A',
  onPrimaryDarkMuted: '#6D5F59',
  text: '#211C1A',
  textMuted: '#6D5F59',
  border: '#E4DAD5',
  borderStrong: '#B7AAA4',
  controlBorder: '#7A6C66',
  placeholder: '#70635D',
  danger: '#B3263E',
  dangerSoft: '#FFF0F2',
  dangerBorder: '#F0C7CE',
  dangerPressed: '#921A31',
  onDanger: '#FFFFFF',
  priorityMedium: '#7A4B00',
  priorityMediumSoft: '#FFF1C7',
  shadow: '#2A1B17',
  overlay: 'rgba(33, 28, 26, 0.48)',
  floating: 'rgba(255, 255, 255, 0.94)',
  highlight: 'rgba(255, 255, 255, 0.72)',
} as const;

export type AppColors = { [Role in keyof typeof lightColors]: string };

export const darkColors: AppColors = {
  page: '#0D0F12',
  background: '#14171B',
  surface: '#1C2025',
  surfaceMuted: '#252A30',
  surfaceCompleted: '#25201F',
  primary: '#FF8A73',
  primarySoft: '#40231E',
  primaryDark: '#2B2424',
  success: '#FF8A73',
  primaryPressed: '#FF9F8D',
  primaryTrack: '#4B3430',
  onPrimary: '#2D0C06',
  onPrimaryDark: '#FFF5F2',
  onPrimaryDarkMuted: '#D7C4BF',
  text: '#F5F2F0',
  textMuted: '#BDB5B1',
  border: '#33383E',
  borderStrong: '#596068',
  controlBorder: '#858C94',
  placeholder: '#9C9591',
  danger: '#FF8A9B',
  dangerSoft: '#401F27',
  dangerBorder: '#70303D',
  dangerPressed: '#FFABB7',
  onDanger: '#2C0710',
  priorityMedium: '#F4BD63',
  priorityMediumSoft: '#3B2D16',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.68)',
  floating: 'rgba(34, 38, 44, 0.94)',
  highlight: 'rgba(255, 255, 255, 0.08)',
};

export const effects = {
  dialogShadowWeb: '0 24px 72px rgba(0, 0, 0, 0.24)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  caption: 12,
  bodySmall: 14,
  body: 17,
  heading: 20,
  display: 34,
} as const;

export const motion = {
  press: 90,
  reduced: 120,
  exit: 180,
  standard: 240,
  launchReduced: 180,
  launchSettle: 280,
  launchReveal: 520,
  spring: {
    stiffness: 300,
    damping: 30,
    mass: 0.82,
  },
  springFast: {
    stiffness: 390,
    damping: 32,
    mass: 0.72,
  },
} as const;
