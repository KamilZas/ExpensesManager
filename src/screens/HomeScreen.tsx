import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import type { RootTabParamList } from '../navigation/AppNavigator';
import { getTransactions } from '../services/storage';
import type { Transaction } from '../types/Transaction';
import { getRecentTransactions, getSummary } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { getThemeColors } from '../utils/theme';

type HomeNavigation = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const navigation = useNavigation<HomeNavigation>();
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
  const recentTransactions = useMemo(() => getRecentTransactions(transactions), [transactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Ladowanie danych...</Text>
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
          <View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>Expense Manager</Text>
            <Text style={[styles.title, { color: colors.text }]}>Pulpit finansow</Text>
          </View>
          <Pressable
            accessibilityLabel="Dodaj transakcje"
            onPress={() => navigation.navigate('AddTransaction')}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" color="#FFFFFF" size={26} />
          </Pressable>
        </View>

        <View style={styles.balancePanel}>
          <Text style={[styles.balanceLabel, { color: colors.muted }]}>Aktualne saldo</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.balanceValue,
              { color: summary.balance >= 0 ? colors.income : colors.expense },
            ]}
          >
            {formatCurrency(summary.balance)}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="trending-up-outline"
            title="Przychody"
            tone="income"
            value={formatCurrency(summary.income)}
          />
          <SummaryCard
            icon="trending-down-outline"
            title="Wydatki"
            tone="expense"
            value={formatCurrency(summary.expense)}
          />
          <SummaryCard
            icon="cash-outline"
            title="Saldo"
            tone="balance"
            value={formatCurrency(summary.balance)}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ostatnie transakcje</Text>
          <Pressable onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.sectionAction, { color: colors.primary }]}>Wszystkie</Text>
          </Pressable>
        </View>

        {recentTransactions.length > 0 ? (
          <View style={styles.list}>
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="wallet-outline" size={38} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Brak transakcji</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Dodaj pierwszy przychod lub wydatek, aby zobaczyc podsumowanie.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  balancePanel: {
    gap: 6,
    paddingVertical: 8,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: '900',
  },
  centerScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: 22,
    padding: 20,
    paddingBottom: 34,
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
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  safeArea: {
    flex: 1,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
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
