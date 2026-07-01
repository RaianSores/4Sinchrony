import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
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

const TAB_VISIBLE_SCREENS = new Set([
  'AdminDashboard',
  'Management', 'Students', 'Teachers', 'Studios',
  'AdminProfile', 'EditProfile', 'Settings', 'ChangePassword', 'Notifications',
]);

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
    <ProfileStack.Screen name="AdminProfile" component={AdminProfileScreen as any} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen as any} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen as any} />
    <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
    <ProfileStack.Screen name="Notifications" component={NotificationSettingsScreen as any} />
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

export const AdminNavigator = () => {
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
        name="AdminDashboardTab"
        component={DashboardStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => { e.preventDefault(); navigation.navigate('AdminDashboardTab', { screen: 'AdminDashboard' }); },
        })}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} focused={focused} color={color} />
          ),
          tabBarIconStyle: { marginTop: 5 },
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
