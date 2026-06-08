import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TransactionItem from '../components/TransactionItem';
import type { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { deleteTransaction, getTransactions } from '../services/storage';
import {
  TRANSACTION_CATEGORIES,
  type Category,
  type Transaction,
  type TransactionType,
} from '../types/Transaction';
import { sortByNewest } from '../utils/calculations';
import { getThemeColors } from '../utils/theme';

type TransactionsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Transactions'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TypeFilter = 'all' | TransactionType;
type CategoryFilter = 'all' | Category;

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const navigation = useNavigation<TransactionsNavigation>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
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

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortByNewest(
      transactions.filter((transaction) => {
        const matchesQuery = transaction.title.toLowerCase().includes(normalizedQuery);
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

        return matchesQuery && matchesType && matchesCategory;
      }),
    );
  }, [categoryFilter, query, transactions, typeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const confirmDelete = (transaction: Transaction) => {
    Alert.alert(
      'Usunac transakcje?',
      `Ta operacja usunie "${transaction.title}" z lokalnej historii.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usun',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            await loadTransactions();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Ladowanie transakcji...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={styles.container}
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search-outline" size={38} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nic tu nie ma</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Zmien filtry albo dodaj nowa transakcje.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Transakcje</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {filteredTransactions.length} z {transactions.length} wpisow
              </Text>
            </View>

            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput
                placeholder="Szukaj po nazwie"
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceAlt }]}>
              {[
                { label: 'Wszystkie', value: 'all' as TypeFilter },
                { label: 'Przychody', value: 'income' as TypeFilter },
                { label: 'Wydatki', value: 'expense' as TypeFilter },
              ].map((item) => {
                const active = typeFilter === item.value;
                const activeColor =
                  item.value === 'income'
                    ? colors.income
                    : item.value === 'expense'
                      ? colors.expense
                      : colors.primary;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setTypeFilter(item.value)}
                    style={[
                      styles.segment,
                      active && { backgroundColor: colors.surface, borderColor: activeColor },
                    ]}
                  >
                    <Text style={[styles.segmentText, { color: active ? activeColor : colors.muted }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {(['all', ...TRANSACTION_CATEGORIES] as CategoryFilter[]).map((item) => {
                  const active = categoryFilter === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCategoryFilter(item)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.categoryChipText,
                          { color: active ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {item === 'all' ? 'Wszystkie' : item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onDelete={() => confirmDelete(item)}
            onEdit={() => navigation.navigate('EditTransaction', { transactionId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  centerScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: 12,
    padding: 20,
    paddingBottom: 36,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
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
  headerContent: {
    gap: 14,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  safeArea: {
    flex: 1,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 0,
  },
  segment: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  segmentedControl: {
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    padding: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
});
