export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

export const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    month: 'short',
    year: '2-digit',
  }).format(date);

export const toDateOnlyLabel = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
