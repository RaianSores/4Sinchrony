jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: ({ children }: any) => children,
    State: {},
    PanGestureHandler: ({ children }: any) => children,
    Swipeable: ({ children }: any) => children,
    TouchableOpacity: ({ children }: any) => children,
    gestureHandlerRootHOC: (Component: any) => Component,
  };
});
jest.mock('react-native-mmkv');
jest.mock('react-native-nitro-modules');
jest.mock('react-native-keychain');
jest.mock('@sentry/react-native', () => {
  return {
    init: jest.fn(),
    captureException: jest.fn(),
    captureError: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setTag: jest.fn(),
    withScope: jest.fn(),
  };
});
jest.mock('@env', () => ({
  API_URL: 'http://test.api.com',
  GOOGLE_WEB_CLIENT_ID: '',
  GOOGLE_IOS_CLIENT_ID: '',
  GOOGLE_ANDROID_CLIENT_ID: '',
  SENTRY_DSN: '',
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
