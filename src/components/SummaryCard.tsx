import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { getThemeColors, type IconName } from '../utils/theme';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: IconName;
  tone: 'balance' | 'income' | 'expense';
}

export default function SummaryCard({ title, value, icon, tone }: SummaryCardProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const toneColor =
    tone === 'income' ? colors.income : tone === 'expense' ? colors.expense : colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={22} color={toneColor} />
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: colors.muted }]}>
        {title}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.value, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 8,
    minHeight: 138,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
});
