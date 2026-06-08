import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  TRANSACTION_CATEGORIES,
  type Category,
  type Transaction,
  type TransactionDraft,
  type TransactionType,
} from '../types/Transaction';
import { sortByNewest } from '../utils/calculations';

const STORAGE_KEY = '@expense-manager/transactions';

const isCategory = (value: unknown): value is Category =>
  typeof value === 'string' && TRANSACTION_CATEGORIES.includes(value as Category);

const isTransactionType = (value: unknown): value is TransactionType =>
  value === 'income' || value === 'expense';

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.amount === 'number' &&
    isTransactionType(item.type) &&
    isCategory(item.category) &&
    typeof item.date === 'string'
  );
};

export const createTransactionId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const rawTransactions = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawTransactions) {
      return [];
    }

    // Walidujemy dane po odczycie, bo AsyncStorage przechowuje zwykly JSON.
    const parsedTransactions: unknown = JSON.parse(rawTransactions);

    if (!Array.isArray(parsedTransactions)) {
      return [];
    }

    return sortByNewest(parsedTransactions.filter(isTransaction));
  } catch (error) {
    console.warn('Nie udalo sie odczytac transakcji.', error);
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortByNewest(transactions)));
};

export const addTransaction = async (draft: TransactionDraft) => {
  const transactions = await getTransactions();
  const transaction: Transaction = {
    id: createTransactionId(),
    ...draft,
  };

  await saveTransactions([transaction, ...transactions]);
  return transaction;
};

export const updateTransaction = async (transaction: Transaction) => {
  const transactions = await getTransactions();
  const nextTransactions = transactions.map((item) =>
    item.id === transaction.id ? transaction : item,
  );

  await saveTransactions(nextTransactions);
};

export const deleteTransaction = async (transactionId: string) => {
  const transactions = await getTransactions();
  await saveTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
};

export const getTransactionById = async (transactionId: string) => {
  const transactions = await getTransactions();
  return transactions.find((transaction) => transaction.id === transactionId) ?? null;
};
