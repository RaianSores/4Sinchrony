import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleResolver } from './src/core/navigation/RoleResolver';
import { AlertProvider } from './src/shared/components/AlertModal';
import OfflineBanner from './src/shared/components/OfflineBanner';
import { googleSignInService } from './src/core/auth/services/googleSignInService';
import { env } from './src/config/env';

// TODO(google-signin): desativado temporariamente nos dois plataformas até fazer a config
// completa do iOS (GoogleService-Info.plist + iosClientId + reversed URL scheme) e resolver a
// regra 4.8 da Apple (Sign in with Apple). Para reativar: descomentar abaixo e os botões em
// LoginScreen/RegisterScreen. Ver docs/CHECKLIST_GO_LIVE.md.
// if (env.GOOGLE_WEB_CLIENT_ID) {
//   googleSignInService.configure(env.GOOGLE_WEB_CLIENT_ID);
// }

const queryClient = new QueryClient();

const App = () => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <OfflineBanner />
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
