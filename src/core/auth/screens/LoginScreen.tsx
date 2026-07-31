import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import GoogleSignInButton from '../../../shared/components/GoogleSignInButton';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import { googleSignInService } from '../services/googleSignInService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { captureError } from '../../../lib/sentry';
import { mkStyles } from './LoginScreen.styles';
import { FourSinchronyImage } from '../../../shared/components/FourSinchronyImage';

const SCALE_BASE = 375;
const SMALL_SCREEN = 568;

const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { isSmallScreen, scale } = useMemo(() => ({
    isSmallScreen: SCREEN_HEIGHT < SMALL_SCREEN,
    scale: SCREEN_WIDTH / SCALE_BASE,
  }), [SCREEN_WIDTH, SCREEN_HEIGHT]);
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { showAlert } = useAppAlert();
  const login = useAuthStore(state => state.login);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Informe seu email';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!password) {
      newErrors.password = 'Informe sua senha';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token, response.refresh_token);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Email ou senha invalidos' });
    } finally {
      setLoading(false);
    }
  };

  const isGoogleConfigured = googleSignInService.isConfigured();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await googleSignInService.signIn();
      const response = await authService.login({
        email: googleUser.email,
        password: 'google_oauth',
      });
      login(response.user, response.token, response.refresh_token);
    } catch (error: any) {
      captureError(error);
      if (error.message !== 'Login cancelado') {
        showAlert({ title: 'Erro', message: 'Nao foi possivel entrar com Google.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={[styles.topSection, { paddingTop: isSmallScreen ? Math.min(SCREEN_HEIGHT * 0.05, 60) : Math.min(SCREEN_HEIGHT * 0.08, 100) }]}>
            <View style={[styles.img, { width: ms(isSmallScreen ? 110 : 140), height: ms(isSmallScreen ? 110 : 140), borderRadius: ms(isSmallScreen ? 55 : 70) }]}>
              <FourSinchronyImage size={ms(isSmallScreen ? 220 : 280)} />
            </View>
            <Text style={[styles.tagline, { fontSize: ms(isSmallScreen ? 14 : 15) }]}>Transforme seu corpo, eleve sua mente</Text>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />

            <View style={styles.formContent}>
              <Text style={[styles.formTitle, { fontSize: ms(isSmallScreen ? 20 : 22) }]}>Bem-vindo de volta</Text>
              <Text style={[styles.formSubtitle, { fontSize: ms(isSmallScreen ? 14 : 15) }]}>Faca login para continuar</Text>

              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError, { height: ms(isSmallScreen ? 46 : 50) }]}>
                <Ionicons name="mail-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 15 : 16) }]}
                  placeholder="Email"
                  value={email}
                  onChangeText={text => { setEmail(text); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  placeholderTextColor={colors.grayLight}
                  importantForAutofill="no"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError, { height: ms(isSmallScreen ? 46 : 50) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 15 : 16) }]}
                  placeholder="Senha"
                  value={password}
                  onChangeText={text => { setPassword(text); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.grayLight}
                  importantForAutofill="no"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ms(20)} color={colors.gray} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <Button
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                disabled={loading}
                loading={loading}
                variant="dark"
              />

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
                <Text style={[styles.forgotPassword, { fontSize: ms(isSmallScreen ? 14 : 15) }]}>Esqueci minha senha</Text>
              </TouchableOpacity>

              {/* TODO(google-signin): oculto temporariamente (ver App.tsx). Reativar depois da config iOS + Sign in with Apple.
              {isGoogleConfigured && (
                <GoogleSignInButton
                  onPress={handleGoogleSignIn}
                  loading={googleLoading}
                />
              )}
              */}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, { fontSize: ms(14) }]}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Criar uma conta"
                variant="outline"
                onPress={() => navigation.navigate('Register')}
              />
            </View>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
