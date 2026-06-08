import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import {
  addTransaction,
  getTransactionById,
  updateTransaction,
} from '../services/storage';
import {
  TRANSACTION_CATEGORIES,
  type Category,
  type TransactionType,
} from '../types/Transaction';
import { toDateOnlyLabel } from '../utils/formatters';
import { categoryMeta, getThemeColors } from '../utils/theme';

type AddNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'AddTransaction'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FormErrors = Partial<Record<'title' | 'amount' | 'date', string>>;

const initialType: TransactionType = 'expense';
const initialCategory: Category = 'Jedzenie';

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const navigation = useNavigation<AddNavigation>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditTransaction'>>();
  const transactionId = route.params?.transactionId;
  const isEditing = Boolean(transactionId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const screenTitle = useMemo(
    () => (isEditing ? 'Edytuj transakcje' : 'Nowa transakcja'),
    [isEditing],
  );

  const resetForm = useCallback(() => {
    setTitle('');
    setAmount('');
    setType(initialType);
    setCategory(initialCategory);
    setDate(new Date());
    setErrors({});
    setShowDatePicker(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const prepareForm = async () => {
        setErrors({});

        if (!transactionId) {
          resetForm();
          return;
        }

        setLoading(true);
        const transaction = await getTransactionById(transactionId);

        if (active && transaction) {
          setTitle(transaction.title);
          setAmount(String(transaction.amount).replace('.', ','));
          setType(transaction.type);
          setCategory(transaction.category);
          setDate(new Date(transaction.date));
        }

        if (active) {
          setLoading(false);
        }
      };

      prepareForm();

      return () => {
        active = false;
      };
    }, [resetForm, transactionId]),
  );

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const normalizedAmount = Number(amount.replace(',', '.'));

    // Walidacja jest lokalna, zeby uzytkownik dostal komunikaty przed zapisem.
    if (!title.trim()) {
      nextErrors.title = 'Podaj nazwe transakcji.';
    }

    if (!amount.trim() || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      nextErrors.amount = 'Podaj kwote wieksza od zera.';
    }

    if (Number.isNaN(date.getTime())) {
      nextErrors.date = 'Wybierz poprawna date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    const normalizedAmount = Number(amount.replace(',', '.'));

    if (transactionId) {
      await updateTransaction({
        id: transactionId,
        title: title.trim(),
        amount: normalizedAmount,
        type,
        category,
        date: date.toISOString(),
      });

      setSaving(false);
      navigation.goBack();
      return;
    }

    await addTransaction({
      title: title.trim(),
      amount: normalizedAmount,
      type,
      category,
      date: date.toISOString(),
    });

    setSaving(false);
    resetForm();
    navigation.navigate('Transactions');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{screenTitle}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isEditing ? 'Zaktualizuj szczegoly wpisu.' : 'Zapisz przychod albo wydatek.'}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nazwa</Text>
            <TextInput
              placeholder="np. Zakupy spozywcze"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.title ? colors.expense : colors.border,
                  color: colors.text,
                },
              ]}
            />
            {errors.title ? <Text style={[styles.error, { color: colors.expense }]}>{errors.title}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Kwota</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              value={amount}
              onChangeText={setAmount}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.amount ? colors.expense : colors.border,
                  color: colors.text,
                },
              ]}
            />
            {errors.amount ? <Text style={[styles.error, { color: colors.expense }]}>{errors.amount}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Typ</Text>
            <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceAlt }]}>
              {(['income', 'expense'] as TransactionType[]).map((item) => {
                const active = type === item;
                const itemColor = item === 'income' ? colors.income : colors.expense;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setType(item)}
                    style={[
                      styles.segment,
                      active && { backgroundColor: colors.surface, borderColor: itemColor },
                    ]}
                  >
                    <Ionicons
                      name={item === 'income' ? 'trending-up-outline' : 'trending-down-outline'}
                      size={18}
                      color={active ? itemColor : colors.muted}
                    />
                    <Text style={[styles.segmentText, { color: active ? itemColor : colors.muted }]}>
                      {item === 'income' ? 'Przychod' : 'Wydatek'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Kategoria</Text>
            <View style={styles.categoryGrid}>
              {TRANSACTION_CATEGORIES.map((item) => {
                const active = category === item;
                const meta = categoryMeta[item];

                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: active
                          ? colorScheme === 'dark'
                            ? colors.surfaceAlt
                            : meta.background
                          : colors.surface,
                        borderColor: active ? meta.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryText,
                        { color: active ? meta.color : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Data</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.date ? colors.expense : colors.border,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>{toDateOnlyLabel(date)}</Text>
            </Pressable>
            {errors.date ? <Text style={[styles.error, { color: colors.expense }]}>{errors.date}</Text> : null}
          </View>

          {showDatePicker ? (
            <DateTimePicker
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              mode="date"
              value={date}
              onChange={(_, selectedDate) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }

                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          ) : null}

          <Pressable
            disabled={saving}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: saving ? colors.primaryDark : colors.primary },
              pressed && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.submitText}>{isEditing ? 'Zapisz zmiany' : 'Dodaj transakcje'}</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  centerScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: 18,
    padding: 20,
    paddingBottom: 36,
  },
  dateButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 8,
  },
  header: {
    gap: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  keyboardView: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  pressed: {
    opacity: 0.78,
  },
  safeArea: {
    flex: 1,
  },
  segment: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
  },
  segmentedControl: {
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 4,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
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
