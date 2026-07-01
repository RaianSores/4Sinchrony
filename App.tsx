import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleResolver } from './src/core/navigation/RoleResolver';
import { AlertProvider } from './src/shared/components/AlertModal';
import { initSentry } from './src/lib/sentry';
import { googleSignInService } from './src/core/auth/services/googleSignInService';
import { env } from './src/config/env';

initSentry();

if (env.GOOGLE_WEB_CLIENT_ID) {
  googleSignInService.configure(env.GOOGLE_WEB_CLIENT_ID);
}

const queryClient = new QueryClient();

const App = () => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <RoleResolver />
        </AlertProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
