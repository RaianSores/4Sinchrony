import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/useTheme';

import TeacherDashboardScreen from '../../../domains/teacher/screens/DashboardScreen';
import TeacherMetricsScreen from '../../../domains/teacher/screens/MetricsScreen';
import MyClassesScreen from '../../../domains/teacher/screens/MyClassesScreen';
import ClassSessionScreen from '../../../domains/teacher/screens/ClassSessionScreen';
import StudentListScreen from '../../../domains/teacher/screens/StudentListScreen';
import CheckInDashboardScreen from '../../../domains/teacher/screens/CheckInDashboardScreen';
import CheckInSessionScreen from '../../../domains/teacher/screens/CheckInSessionScreen';
import AttendanceScreen from '../../../domains/teacher/screens/AttendanceScreen';
import TeacherProfileScreen from '../../../domains/teacher/screens/TeacherProfileScreen';
import ChangePasswordScreen from '../../../domains/student/profile/screens/ChangePasswordScreen';

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
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </ProfileStack.Navigator>
);

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 14,
      backgroundColor: focused ? colors.primary + '28' : 'transparent',
    }}>
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

export const TeacherNavigator = () => {
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
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', gap: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('DashboardTab', { screen: 'Dashboard' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="ClassesTab"
        component={ClassesStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('ClassesTab', { screen: 'MyClasses' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />
          ),
          tabBarLabel: 'Aulas',
        }}
      />
      <Tab.Screen
        name="CheckInTab"
        component={CheckInStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('CheckInTab', { screen: 'CheckInDashboard' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'checkbox' : 'checkbox-outline'} focused={focused} color={color} />
          ),
          tabBarLabel: 'Check-in',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('ProfileTab', { screen: 'TeacherProfile' }); },
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
