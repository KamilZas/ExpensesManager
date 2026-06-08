import { Ionicons } from '@expo/vector-icons';
import type { ColorSchemeName } from 'react-native';

import type { Category } from '../types/Transaction';

export type IconName = keyof typeof Ionicons.glyphMap;

export const lightColors = {
  background: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  text: '#172033',
  muted: '#667085',
  border: '#D8DEE8',
  primary: '#2F80ED',
  primaryDark: '#1D5FBF',
  income: '#16A34A',
  expense: '#DC2626',
  warning: '#D97706',
  shadow: '#172033',
};

export const darkColors = {
  background: '#101318',
  surface: '#171B22',
  surfaceAlt: '#242A34',
  text: '#F5F7FA',
  muted: '#A4ADBA',
  border: '#303745',
  primary: '#5EA1FF',
  primaryDark: '#8BBEFF',
  income: '#4ADE80',
  expense: '#F87171',
  warning: '#FBBF24',
  shadow: '#000000',
};

export const getThemeColors = (scheme?: ColorSchemeName | null) =>
  scheme === 'dark' ? darkColors : lightColors;

export const categoryMeta: Record<Category, { color: string; background: string; icon: IconName }> = {
  Jedzenie: {
    color: '#E11D48',
    background: '#FFE4E6',
    icon: 'restaurant-outline',
  },
  Transport: {
    color: '#2563EB',
    background: '#DBEAFE',
    icon: 'bus-outline',
  },
  Rozrywka: {
    color: '#7C3AED',
    background: '#EDE9FE',
    icon: 'game-controller-outline',
  },
  Zakupy: {
    color: '#DB2777',
    background: '#FCE7F3',
    icon: 'cart-outline',
  },
  Rachunki: {
    color: '#D97706',
    background: '#FEF3C7',
    icon: 'receipt-outline',
  },
  Zdrowie: {
    color: '#059669',
    background: '#D1FAE5',
    icon: 'medkit-outline',
  },
  Wynagrodzenie: {
    color: '#16A34A',
    background: '#DCFCE7',
    icon: 'wallet-outline',
  },
  Inne: {
    color: '#475569',
    background: '#E2E8F0',
    icon: 'apps-outline',
  },
};
