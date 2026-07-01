import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
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
import EditProfileScreen from '../../../domains/student/profile/screens/EditProfileScreen';
import SettingsScreen from '../../../domains/student/profile/screens/SettingsScreen';
import ChangePasswordScreen from '../../../domains/student/profile/screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ClassesStack = createNativeStackNavigator();
const CheckInStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Root screens of each stack — tab bar stays visible only on these
const TAB_VISIBLE_SCREENS = new Set([
  'Dashboard', 'Metrics',
  'MyClasses', 'ClassSession', 'StudentList',
  'CheckInDashboard', 'CheckInSession', 'Attendance',
  'TeacherProfile', 'EditProfile', 'Settings', 'ChangePassword',
]);

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
    <ProfileStack.Screen name="TeacherProfile" component={TeacherProfileScreen as any} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen as any} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen as any} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
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

export const TeacherNavigator = () => {
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
        name="DashboardTab"
        component={DashboardStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('DashboardTab', { screen: 'Dashboard' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
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
          tabBarIconStyle: { marginTop: 5 },
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
          tabBarIconStyle: { marginTop: 5 },
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
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
