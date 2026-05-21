import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AlertProvider } from './src/shared/components/AlertModal';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
          <AppNavigator />
        </AlertProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
