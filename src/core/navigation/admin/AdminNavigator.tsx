import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/useTheme';
import AdminDashboardScreen from '../../../domains/admin/screens/AdminDashboardScreen';
import { ManagementScreen, StudentsScreen, TeachersScreen, StudiosScreen } from '../../../domains/admin/screens/ManagementScreen';
import AdminProfileScreen from '../../../domains/admin/screens/AdminProfileScreen';
import EditProfileScreen from '../../../domains/student/profile/screens/EditProfileScreen';
import SettingsScreen from '../../../domains/student/profile/screens/SettingsScreen';
import ChangePasswordScreen from '../../../domains/student/profile/screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../../../domains/student/notifications/screens/NotificationSettingsScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ManagementStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const DashboardStackScreen = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
  </DashboardStack.Navigator>
);

const ManagementStackScreen = () => (
  <ManagementStack.Navigator screenOptions={{ headerShown: false }}>
    <ManagementStack.Screen name="Management" component={ManagementScreen} />
    <ManagementStack.Screen name="Students" component={StudentsScreen} />
    <ManagementStack.Screen name="Teachers" component={TeachersScreen} />
    <ManagementStack.Screen name="Studios" component={StudiosScreen} />
  </ManagementStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="AdminProfile" component={AdminProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationSettingsScreen} />
  </ProfileStack.Navigator>
);

const TAB_BAR_BASE_HEIGHT = 55;

export const AdminNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: TAB_BAR_BASE_HEIGHT + insets.bottom,
      paddingBottom: insets.bottom,
    }),
    [colors, insets.bottom],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={DashboardStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('AdminDashboardTab', { screen: 'AdminDashboard' }); },
        })}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="AdminManagementTab"
        component={ManagementStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('AdminManagementTab', { screen: 'Management' }); },
        })}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          tabBarLabel: 'Gestão',
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={ProfileStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('AdminProfileTab', { screen: 'AdminProfile' }); },
        })}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
