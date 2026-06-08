import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { Category } from '../types/Transaction';
import { categoryMeta, getThemeColors } from '../utils/theme';

interface CategoryBadgeProps {
  category: Category;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function CategoryBadge({ category, compact = false, style }: CategoryBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const meta = categoryMeta[category];

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compactBadge,
        {
          backgroundColor: colorScheme === 'dark' ? colors.surfaceAlt : meta.background,
        },
        style,
      ]}
    >
      <Ionicons name={meta.icon} size={compact ? 12 : 14} color={meta.color} />
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          compact && styles.compactText,
          {
            color: colorScheme === 'dark' ? colors.text : meta.color,
          },
        ]}
      >
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 30,
    paddingHorizontal: 10,
  },
  compactBadge: {
    gap: 4,
    minHeight: 24,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 12,
  },
});
