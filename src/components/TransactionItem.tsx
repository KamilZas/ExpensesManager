import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { Transaction } from '../types/Transaction';
import { formatCurrency, formatDate } from '../utils/formatters';
import { categoryMeta, getThemeColors } from '../utils/theme';
import CategoryBadge from './CategoryBadge';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const meta = categoryMeta[transaction.category];
  const amountColor = transaction.type === 'income' ? colors.income : colors.expense;
  const amountPrefix = transaction.type === 'income' ? '+' : '-';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: colorScheme === 'dark' ? colors.surfaceAlt : meta.background }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {transaction.title}
        </Text>
        <View style={styles.metaRow}>
          <CategoryBadge category={transaction.category} compact />
          <Text numberOfLines={1} style={[styles.date, { color: colors.muted }]}>
            {formatDate(transaction.date)}
          </Text>
        </View>
      </View>

      <View style={styles.amountColumn}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.amount, { color: amountColor }]}
        >
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </Text>
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable
              accessibilityLabel="Edytuj transakcje"
              hitSlop={10}
              onPress={onEdit}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityLabel="Usun transakcje"
              hitSlop={10}
              onPress={onDelete}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.expense} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 30,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    maxWidth: 120,
    textAlign: 'right',
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 116,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    padding: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  content: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  date: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pressed: {
    opacity: 0.55,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
});
