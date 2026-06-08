import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import AddTransactionScreen from '../screens/AddTransactionScreen';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import { getThemeColors, type IconName } from '../utils/theme';

export type RootTabParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Transactions: undefined;
  Statistics: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  EditTransaction: { transactionId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIcons: Record<keyof RootTabParamList, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  AddTransaction: { active: 'add-circle', inactive: 'add-circle-outline' },
  Transactions: { active: 'list', inactive: 'list-outline' },
  Statistics: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

function MainTabs() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        animation: 'shift',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '800',
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const icon = focused ? tabIcons[route.name].active : tabIcons[route.name].inactive;
          return <Ionicons name={icon} size={size} color={color} />;
        },
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 180,
          },
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Pulpit' }} />
      <Tab.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Dodaj' }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transakcje' }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'Statystyki' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="EditTransaction"
        component={AddTransactionScreen}
        options={{
          animation: 'slide_from_right',
          title: 'Edytuj transakcje',
        }}
      />
    </Stack.Navigator>
  );
}
