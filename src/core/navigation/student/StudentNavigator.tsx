import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/useTheme';

import HomeScreen from '../../../domains/student/home/screens/HomeScreen';
import ClassesScreen from '../../../domains/student/classes/screens/ClassesScreen';
import ClassDetailScreen from '../../../domains/student/classes/screens/ClassDetailScreen';
import BookingsScreen from '../../../domains/student/bookings/screens/BookingsScreen';
import BookingHistoryScreen from '../../../domains/student/bookings/screens/BookingHistoryScreen';
import ProfileScreen from '../../../domains/student/profile/screens/ProfileScreen';
import EditProfileScreen from '../../../domains/student/profile/screens/EditProfileScreen';
import MyPurchasesScreen from '../../../domains/student/profile/screens/MyPurchasesScreen';
import ClassHistoryScreen from '../../../domains/student/profile/screens/ClassHistoryScreen';
import MyCardsScreen from '../../../domains/student/cards/screens/MyCardsScreen';
import AddCardScreen from '../../../domains/student/cards/screens/AddCardScreen';
import SettingsScreen from '../../../domains/student/profile/screens/SettingsScreen';
import ChangePasswordScreen from '../../../domains/student/profile/screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../../../domains/student/notifications/screens/NotificationSettingsScreen';
import PackagesScreen from '../../../domains/student/purchases/screens/PackagesScreen';
import CartScreen from '../../../domains/student/purchases/screens/CartScreen';
import PaymentScreen from '../../../domains/student/purchases/screens/PaymentScreen';
import PaymentConfirmationScreen from '../../../domains/student/purchases/screens/PaymentConfirmationScreen';


const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AgendaStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Root screens of each stack — tab bar stays visible only on these
const TAB_VISIBLE_SCREENS = new Set([
  'Home', 'Agenda', 'Bookings', 'Profile',
  'ClassDetail', 'BookingHistory',
  'EditProfile', 'MyPurchases', 'ClassHistory', 'MyCards', 'AddCard',
  'Settings', 'ChangePassword', 'Notifications',
  'Packages', 'Cart', 'Payment', 'PaymentConfirmation',
]);

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen as any} />
    <HomeStack.Screen name="ClassDetail" component={ClassDetailScreen as any} />
  </HomeStack.Navigator>
);

const AgendaStackScreen = () => (
  <AgendaStack.Navigator screenOptions={{ headerShown: false }}>
    <AgendaStack.Screen name="Agenda" component={ClassesScreen as any} />
    <AgendaStack.Screen name="ClassDetail" component={ClassDetailScreen as any} />
  </AgendaStack.Navigator>
);

const BookingsStackScreen = () => (
  <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingsStack.Screen name="Bookings" component={BookingsScreen as any} />
    <BookingsStack.Screen name="BookingHistory" component={BookingHistoryScreen as any} />
  </BookingsStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen as any} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen as any} />
    <ProfileStack.Screen name="MyPurchases" component={MyPurchasesScreen as any} />
    <ProfileStack.Screen name="ClassHistory" component={ClassHistoryScreen as any} />
    <ProfileStack.Screen name="MyCards" component={MyCardsScreen as any} />
    <ProfileStack.Screen name="AddCard" component={AddCardScreen as any} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen as any} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
    <ProfileStack.Screen name="Packages" component={PackagesScreen as any} />
    <ProfileStack.Screen name="Cart" component={CartScreen as any} />
    <ProfileStack.Screen name="Notifications" component={NotificationSettingsScreen as any} />
    <ProfileStack.Screen name="Payment" component={PaymentScreen as any} />
    <ProfileStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen as any} />
  </ProfileStack.Navigator>
);

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{
      width: 48,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? colors.primary + '28' : 'transparent',
    }}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export const StudentNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: Math.max(insets.bottom + 16, 28),
    left: 32,
    right: 32,
    borderRadius: 32,
    height: 68,
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: 'rgba(18,135,175,0.22)',
    backgroundColor: colors.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 12,
  }), [colors, insets.bottom]);

  return (
    <Tab.Navigator
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index];
        const focusedName = getFocusedRouteNameFromRoute(activeRoute);
        const show = focusedName === undefined || TAB_VISIBLE_SCREENS.has(focusedName);
        if (!show) return null;
        return <BottomTabBar {...props} />;
      }}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle,
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center' },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('HomeTab', { screen: 'Home' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="AgendaTab"
        component={AgendaStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('AgendaTab', { screen: 'Agenda' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Agenda',
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('BookingsTab', { screen: 'Bookings' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'receipt' : 'receipt-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Reservas',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('ProfileTab', { screen: 'Profile' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
