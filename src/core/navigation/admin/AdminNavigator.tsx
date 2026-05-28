import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';
import AdminDashboardScreen from '../../../domains/admin/screens/AdminDashboardScreen';
import { ManagementScreen, StudentsScreen, TeachersScreen, StudiosScreen } from '../../../domains/admin/screens/ManagementScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ManagementStack = createNativeStackNavigator();

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

export const AdminNavigator = () => {
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
        name="AdminDashboardTab"
        component={DashboardStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="AdminManagementTab"
        component={ManagementStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarLabel: 'Gestão',
        }}
      />
    </Tab.Navigator>
  );
};
