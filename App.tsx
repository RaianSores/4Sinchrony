import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AlertProvider } from './src/shared/components/AlertModal';
import { googleSignInService } from './src/modules/auth/services/googleSignInService';
import { env } from './src/config/env';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if (env.GOOGLE_WEB_CLIENT_ID) {
      googleSignInService.configure(env.GOOGLE_WEB_CLIENT_ID);
    }
  }, []);

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
