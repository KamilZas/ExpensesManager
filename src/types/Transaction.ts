export const TRANSACTION_CATEGORIES = [
  'Jedzenie',
  'Transport',
  'Rozrywka',
  'Zakupy',
  'Rachunki',
  'Zdrowie',
  'Wynagrodzenie',
  'Inne',
] as const;

export type Category = (typeof TRANSACTION_CATEGORIES)[number];

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
}

export type TransactionDraft = Omit<Transaction, 'id'>;
