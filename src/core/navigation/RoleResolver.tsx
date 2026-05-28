import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../auth/store/useAuthStore';
import { StudentNavigator } from './student/StudentNavigator';
import { TeacherNavigator } from './teacher/TeacherNavigator';
import { AdminNavigator } from './admin/AdminNavigator';
import { theme } from '../theme';

import LoginScreen from '../auth/screens/LoginScreen';
import RegisterScreen from '../auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../auth/screens/ForgotPasswordScreen';

let DevLoginScreen: React.ComponentType<any> | null = null;
if (__DEV__) {
  DevLoginScreen = require('../auth/screens/DevLoginScreen').default;
}

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    {__DEV__ && DevLoginScreen && (
      <Stack.Screen name="DevLogin" component={DevLoginScreen} />
    )}
  </Stack.Navigator>
);

const SplashScreen = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

export const RoleResolver = () => {
  const { isAuthenticated, isLoading, activeRole } = useAuthStore();

  if (isLoading) {
    return <SplashScreen />;
  }

  const renderNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (activeRole) {
      case 'student':
        return <StudentNavigator />;
      case 'teacher':
        return <TeacherNavigator />;
      case 'admin':
        return <AdminNavigator />;
      default:
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
