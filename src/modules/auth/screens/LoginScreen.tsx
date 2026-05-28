import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import GoogleSignInButton from '../../../shared/components/GoogleSignInButton';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { theme } from '../../../shared/theme';
import { googleSignInService } from '../services/googleSignInService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SCALE_BASE = 375;

const LoginScreen = ({ navigation }: any) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = SCREEN_WIDTH / SCALE_BASE;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { showAlert } = useAppAlert();
  const login = useAuthStore(state => state.login);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
    } catch {
      showAlert({ title: 'Erro', message: 'Email ou senha invalidos' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await googleSignInService.signIn();
      const response = await authService.login({
        email: googleUser.email,
        password: 'google_oauth',
      });
      login(response.user, response.token);
    } catch (error: any) {
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
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.topSection, { paddingTop: Math.min(SCREEN_HEIGHT * 0.12, 120) }]}>
          <View style={[styles.iconCircle, { width: ms(64), height: ms(64), borderRadius: ms(32) }]}>
            <Ionicons name="fitness" size={ms(32)} color={theme.colors.primaryDark} />
          </View>
          <Text style={[styles.title, { fontSize: ms(28) }]}>Studio Wellness</Text>
          <Text style={[styles.tagline, { fontSize: ms(15) }]}>Transforme seu corpo, eleve sua mente</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Text style={[styles.formTitle, { fontSize: ms(22) }]}>Bem-vindo de volta</Text>
            <Text style={[styles.formSubtitle, { fontSize: ms(15) }]}>Faca login para continuar</Text>

            <View style={[styles.inputWrapper, { height: ms(52) }]}>
              <Ionicons name="mail-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(16) }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(52) }]}>
              <Ionicons name="lock-closed-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(16) }]}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={theme.colors.grayLight}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ms(20)} color={theme.colors.gray} />
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              variant="dark"
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
              <Text style={[styles.forgotPassword, { fontSize: ms(15) }]}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              loading={googleLoading}
            />

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
          </ScrollView>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  iconCircle: {
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadow.md,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 4,
    paddingBottom: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayLight,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  formTitle: {
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  formSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPassword: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 14,
    color: theme.colors.textSecondary,
  },
});

export default LoginScreen;
