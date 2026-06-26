import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
    <NavigationContainer theme={navTheme}>
      {renderNavigator()}
    </NavigationContainer>
  );
};
