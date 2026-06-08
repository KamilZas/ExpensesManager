import { TRANSACTION_CATEGORIES, type Category, type Transaction } from '../types/Transaction';
import { formatMonth } from './formatters';

export interface Summary {
  balance: number;
  income: number;
  expense: number;
}

export interface CategoryStatistic {
  category: Category;
  total: number;
  percentage: number;
}

export interface MonthlyExpense {
  key: string;
  label: string;
  total: number;
}

export const sortByNewest = (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getSummary = (transactions: Transaction[]): Summary =>
  transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === 'income') {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }

      summary.balance = summary.income - summary.expense;
      return summary;
    },
    { balance: 0, income: 0, expense: 0 },
  );

export const getRecentTransactions = (transactions: Transaction[], limit = 5) =>
  sortByNewest(transactions).slice(0, limit);

export const getExpenseStatsByCategory = (transactions: Transaction[]): CategoryStatistic[] => {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense');
  const totalExpenses = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (totalExpenses === 0) {
    return [];
  }

  return TRANSACTION_CATEGORIES.map((category) => {
    const total = expenses
      .filter((transaction) => transaction.category === category)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      category,
      total,
      percentage: (total / totalExpenses) * 100,
    };
  })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
};

export const getMonthlyExpenses = (transactions: Transaction[], monthsToShow = 6): MonthlyExpense[] => {
  const now = new Date();

  const months = Array.from({ length: monthsToShow }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return {
      key,
      label: formatMonth(date),
      total: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const month = monthMap.get(key);

      if (month) {
        month.total += transaction.amount;
      }
    });

  return months;
};
