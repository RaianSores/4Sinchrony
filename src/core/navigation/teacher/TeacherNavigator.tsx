import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme';

import TeacherDashboardScreen from '../../../domains/teacher/screens/DashboardScreen';
import TeacherMetricsScreen from '../../../domains/teacher/screens/MetricsScreen';
import MyClassesScreen from '../../../domains/teacher/screens/MyClassesScreen';
import ClassSessionScreen from '../../../domains/teacher/screens/ClassSessionScreen';
import StudentListScreen from '../../../domains/teacher/screens/StudentListScreen';
import CheckInDashboardScreen from '../../../domains/teacher/screens/CheckInDashboardScreen';
import CheckInSessionScreen from '../../../domains/teacher/screens/CheckInSessionScreen';
import AttendanceScreen from '../../../domains/teacher/screens/AttendanceScreen';
import TeacherProfileScreen from '../../../domains/teacher/screens/TeacherProfileScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ClassesStack = createNativeStackNavigator();
const CheckInStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const DashboardStackScreen = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={TeacherDashboardScreen} />
    <DashboardStack.Screen name="Metrics" component={TeacherMetricsScreen} />
  </DashboardStack.Navigator>
);

const ClassesStackScreen = () => (
  <ClassesStack.Navigator screenOptions={{ headerShown: false }}>
    <ClassesStack.Screen name="MyClasses" component={MyClassesScreen} />
    <ClassesStack.Screen name="ClassSession" component={ClassSessionScreen} />
    <ClassesStack.Screen name="StudentList" component={StudentListScreen} />
  </ClassesStack.Navigator>
);

const CheckInStackScreen = () => (
  <CheckInStack.Navigator screenOptions={{ headerShown: false }}>
    <CheckInStack.Screen name="CheckInDashboard" component={CheckInDashboardScreen} />
    <CheckInStack.Screen name="CheckInSession" component={CheckInSessionScreen} />
    <CheckInStack.Screen name="Attendance" component={AttendanceScreen} />
  </CheckInStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
  </ProfileStack.Navigator>
);

export const TeacherNavigator = () => {
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
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="ClassesTab"
        component={ClassesStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Aulas',
        }}
      />

      <Tab.Screen
        name="CheckInTab"
        component={CheckInStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" size={size} color={color} />
          ),
          tabBarLabel: 'Check-in',
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
