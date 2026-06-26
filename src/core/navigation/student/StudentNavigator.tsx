import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
// import BringAFriendScreen from '../../../domains/student/profile/screens/BringAFriendScreen'; // FEATURE: bring-a-friend (paid add-on)

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
    {/* <ProfileStack.Screen name="BringAFriend" component={BringAFriendScreen} /> */}{/* FEATURE: bring-a-friend (paid add-on) */}
  </ProfileStack.Navigator>
);

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 36,
      borderRadius: 18,
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
    bottom: Math.max(insets.bottom, 12),
    left: 16,
    right: 16,
    borderRadius: 32,
    height: 62,
    borderTopWidth: 0,
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
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle,
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', paddingBottom: 4 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
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
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
