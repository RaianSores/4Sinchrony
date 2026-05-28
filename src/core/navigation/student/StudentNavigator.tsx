import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';

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
import BringAFriendScreen from '../../../domains/student/profile/screens/BringAFriendScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AgendaStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="ClassDetail" component={ClassDetailScreen} />
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
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <ProfileStack.Screen name="Packages" component={PackagesScreen} />
    <ProfileStack.Screen name="Cart" component={CartScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationSettingsScreen} />
    <ProfileStack.Screen name="Payment" component={PaymentScreen} />
    <ProfileStack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
    <ProfileStack.Screen name="BringAFriend" component={BringAFriendScreen} />
  </ProfileStack.Navigator>
);

export const StudentNavigator = () => {
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
