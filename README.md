# Expenses Manager

Kompletna aplikacja mobilna do zarzadzania przychodami i wydatkami, zbudowana w React Native, Expo SDK 54 i TypeScript.

## Funkcje

- aktualne saldo, suma przychodow i suma wydatkow,
- dodawanie oraz edycja transakcji,
- usuwanie z potwierdzeniem,
- wyszukiwanie, filtrowanie po typie i kategorii,
- wykres wydatkow wedlug kategorii,
- wykres miesiecznych wydatkow,
- zapis lokalny w AsyncStorage,
- pull to refresh, loading screen i puste stany,
- jasny i ciemny motyw,
- animowane przejscia React Navigation.

## Struktura katalogow

```text
src/
├── screens/
│   ├── HomeScreen.tsx
│   ├── AddTransactionScreen.tsx
│   ├── TransactionsScreen.tsx
│   └── StatisticsScreen.tsx
├── components/
│   ├── TransactionItem.tsx
│   ├── SummaryCard.tsx
│   └── CategoryBadge.tsx
├── services/
│   └── storage.ts
├── types/
│   └── Transaction.ts
├── navigation/
│   └── AppNavigator.tsx
└── utils/
    ├── calculations.ts
    ├── formatters.ts
    └── theme.ts
```

Pliki startowe aplikacji:

```text
App.tsx
index.ts
```

## Instalacja w tym projekcie

```bash
git clone https://github.com/KamilZas/ExpensesManager.git
cd ./ExpensesManager
npm install
npm start
```

Potem wybierz w terminalu Expo:

- `a` dla emulatora Android,
- `i` dla symulatora iOS,
- zeskanuj QR kod w Expo Go.

## Utworzenie nowego projektu Expo

```bash
npx create-expo-app ExpensesManager --template blank-typescript
cd ExpenseManager
```

Zainstaluj pakiety wymagane przez aplikacje:

```bash
npx expo install @expo/vector-icons @react-native-async-storage/async-storage @react-native-community/datetimepicker react-native-gesture-handler react-native-safe-area-context react-native-screens
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
```

Skopiuj do nowego projektu katalog `src/` oraz pliki `App.tsx` i `index.ts`. W `package.json` ustaw:

```json
{
  "main": "index.ts"
}
```

Uruchom aplikacje:

```bash
npm start
```

## Komendy developerskie

```bash
npm run lint
npm run typecheck
npm run android
npm run ios
```

## Model danych

```ts
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}
```
