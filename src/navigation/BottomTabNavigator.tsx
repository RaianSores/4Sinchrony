import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../shared/theme';

import HomeScreen from '../modules/home/screens/HomeScreen';
import ClassesScreen from '../modules/classes/screens/ClassesScreen';
import ClassDetailScreen from '../modules/classes/screens/ClassDetailScreen';
import BookingsScreen from '../modules/bookings/screens/BookingsScreen';
import BookingHistoryScreen from '../modules/bookings/screens/BookingHistoryScreen';
import ProfileScreen from '../modules/profile/screens/ProfileScreen';
import EditProfileScreen from '../modules/profile/screens/EditProfileScreen';
import MyPurchasesScreen from '../modules/profile/screens/MyPurchasesScreen';
import ClassHistoryScreen from '../modules/profile/screens/ClassHistoryScreen';
import MyCardsScreen from '../modules/cards/screens/MyCardsScreen';
import AddCardScreen from '../modules/cards/screens/AddCardScreen';
// import BringAFriendScreen from '../modules/profile/screens/BringAFriendScreen';
import SettingsScreen from '../modules/profile/screens/SettingsScreen';
import NotificationSettingsScreen from '../modules/notifications/screens/NotificationSettingsScreen';
import PackagesScreen from '../modules/purchases/screens/PackagesScreen';
import CartScreen from '../modules/purchases/screens/CartScreen';
import PaymentScreen from '../modules/purchases/screens/PaymentScreen';
import PaymentConfirmationScreen from '../modules/purchases/screens/PaymentConfirmationScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AgendaStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const AgendaStackScreen = () => (
  <AgendaStack.Navigator screenOptions={{ headerShown: false }}>
    <AgendaStack.Screen name="Agenda" component={ClassesScreen} />
    <AgendaStack.Screen name="ClassDetail" component={ClassDetailScreen} />
  </AgendaStack.Navigator>
);

const BookingsStackScreen = () => (
  <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingsStack.Screen name="Bookings" component={BookingsScreen} />
    <BookingsStack.Screen name="BookingHistory" component={BookingHistoryScreen} />
  </BookingsStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="MyPurchases" component={MyPurchasesScreen} />
    <ProfileStack.Screen name="ClassHistory" component={ClassHistoryScreen} />
    <ProfileStack.Screen name="MyCards" component={MyCardsScreen} />
    <ProfileStack.Screen name="AddCard" component={AddCardScreen} />
    {/* <ProfileStack.Screen name="BringAFriend" component={BringAFriendScreen} /> */}
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Packages" component={PackagesScreen} />
    <ProfileStack.Screen name="Cart" component={CartScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationSettingsScreen} />
    <ProfileStack.Screen name="Payment" component={PaymentScreen} />
    <ProfileStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
  </ProfileStack.Navigator>
);

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.black,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 83,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />

      <Tab.Screen
        name="AgendaTab"
        component={AgendaStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Agenda',
        }}
      />

      <Tab.Screen
        name="BookingsTab"
        component={BookingsStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarLabel: 'Reservas',
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
