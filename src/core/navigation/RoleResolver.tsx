import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useTheme } from '../../shared/theme/useTheme';
import { StudentNavigator } from './student/StudentNavigator';
import { TeacherNavigator } from './teacher/TeacherNavigator';
import { AdminNavigator } from './admin/AdminNavigator';

import LoginScreen from '../auth/screens/LoginScreen';
import RegisterScreen from '../auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../auth/screens/ForgotPasswordScreen';
import VerifyEmailScreen from '../auth/screens/VerifyEmailScreen';
import ResetPasswordScreen from '../auth/screens/ResetPasswordScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email?: string };
  ResetPassword: { token: string };
  StudentTabs: undefined;
  TeacherTabs: undefined;
  AdminTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['4sinchrony://'],
  config: {
    screens: {
      ResetPassword: 'auth/reset-password',
      VerifyEmail: 'auth/verify-email',
      ForgotPassword: 'auth/forgot-password',
      Login: 'auth/login',
      Register: 'auth/register',
    },
  },
};

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

export const RoleResolver = () => {
  const { isAuthenticated, isLoading, initialized, activeRole, initialize } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary:      colors.primary,
      background:   colors.background,
      card:         colors.card,
      text:         colors.text,
      border:       colors.border,
      notification: colors.primary,
    },
  };

  if (!initialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderNavigator = () => {
    if (!isAuthenticated) return <AuthNavigator />;
    switch (activeRole) {
      case 'student': return <StudentNavigator />;
      case 'teacher': return <TeacherNavigator />;
      case 'admin':   return <AdminNavigator />;
      default:        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      {renderNavigator()}
    </NavigationContainer>
  );
};
