import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryBadge from '../components/CategoryBadge';
import SummaryCard from '../components/SummaryCard';
import { getTransactions } from '../services/storage';
import type { Transaction } from '../types/Transaction';
import {
  getExpenseStatsByCategory,
  getMonthlyExpenses,
  getSummary,
} from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { categoryMeta, getThemeColors } from '../utils/theme';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    const storedTransactions = await getTransactions();
    setTransactions(storedTransactions);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions(true);
    }, [loadTransactions]),
  );

  const summary = useMemo(() => getSummary(transactions), [transactions]);
  const categoryStats = useMemo(() => getExpenseStatsByCategory(transactions), [transactions]);
  const monthlyExpenses = useMemo(() => getMonthlyExpenses(transactions), [transactions]);
  const maxMonthlyExpense = Math.max(...monthlyExpenses.map((item) => item.total), 1);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Ladowanie statystyk...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Statystyki</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Analiza wydatkow wedlug kategorii i miesiecy.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="trending-down-outline"
            title="Wydatki"
            tone="expense"
            value={formatCurrency(summary.expense)}
          />
          <SummaryCard
            icon="swap-horizontal-outline"
            title="Liczba wpisow"
            tone="balance"
            value={String(transactions.length)}
          />
        </View>

        {summary.expense === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="bar-chart-outline" size={42} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Brak wydatkow</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Statystyki pojawia sie po dodaniu pierwszego wydatku.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Wydatki wedlug kategorii</Text>
              <View style={styles.barList}>
                {categoryStats.map((item) => {
                  const meta = categoryMeta[item.category];

                  return (
                    <View key={item.category} style={styles.categoryStatRow}>
                      <View style={styles.categoryStatHeader}>
                        <CategoryBadge category={item.category} compact />
                        <Text style={[styles.statAmount, { color: colors.text }]}>
                          {formatCurrency(item.total)}
                        </Text>
                      </View>
                      <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                        <View
                          style={[
                            styles.categoryBar,
                            {
                              backgroundColor: meta.color,
                              width: `${Math.max(item.percentage, 4)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.percentage, { color: colors.muted }]}>
                        {item.percentage.toFixed(1)}% wszystkich wydatkow
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Miesieczne wydatki</Text>
              <View
                style={[
                  styles.monthChart,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {monthlyExpenses.map((item) => {
                  const barHeight = Math.max((item.total / maxMonthlyExpense) * 138, item.total > 0 ? 12 : 0);

                  return (
                    <View key={item.key} style={styles.monthColumn}>
                      <View style={[styles.monthBarTrack, { backgroundColor: colors.surfaceAlt }]}>
                        <View
                          style={[
                            styles.monthBar,
                            {
                              backgroundColor: colors.primary,
                              height: barHeight,
                            },
                          ]}
                        />
                      </View>
                      <Text numberOfLines={1} style={[styles.monthLabel, { color: colors.muted }]}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Podsumowanie kategorii</Text>
              <View style={styles.categorySummaryList}>
                {categoryStats.map((item) => (
                  <View
                    key={item.category}
                    style={[
                      styles.categorySummaryItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <CategoryBadge category={item.category} />
                    <View style={styles.categorySummaryNumbers}>
                      <Text style={[styles.statAmount, { color: colors.text }]}>
                        {formatCurrency(item.total)}
                      </Text>
                      <Text style={[styles.percentage, { color: colors.muted }]}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  barList: {
    gap: 16,
  },
  barTrack: {
    borderRadius: 8,
    height: 12,
    overflow: 'hidden',
  },
  categoryBar: {
    borderRadius: 8,
    height: '100%',
  },
  categoryStatHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryStatRow: {
    gap: 8,
  },
  categorySummaryItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    padding: 12,
  },
  categorySummaryList: {
    gap: 10,
  },
  categorySummaryNumbers: {
    alignItems: 'flex-end',
    gap: 2,
  },
  centerScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: 22,
    padding: 20,
    paddingBottom: 36,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  header: {
    gap: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  monthBar: {
    borderRadius: 8,
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  monthBarTrack: {
    borderRadius: 8,
    height: 148,
    overflow: 'hidden',
    width: 24,
  },
  monthChart: {
    alignItems: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 218,
    padding: 16,
  },
  monthColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    minWidth: 34,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
});
