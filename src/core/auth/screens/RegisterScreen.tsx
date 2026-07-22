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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import GoogleSignInButton from '../../../shared/components/GoogleSignInButton';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import { googleSignInService } from '../services/googleSignInService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FourSinchronyIcone } from '../../../shared/components/FourSinchronyIcone';
import { captureError } from '../../../lib/sentry';
import { mkStyles } from './RegisterScreen.styles';
import { formatCPF, validateCPF, cleanCPF } from '../../../shared/utils/validateCPF';

interface RegisterErrors {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const SCALE_BASE = 375;
const SMALL_SCREEN = 568;

const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { isSmallScreen, scale } = useMemo(() => ({
    isSmallScreen: SCREEN_HEIGHT < SMALL_SCREEN,
    scale: SCREEN_WIDTH / SCALE_BASE,
  }), [SCREEN_WIDTH, SCREEN_HEIGHT]);
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const { showAlert } = useAppAlert();

  const clearError = (field: keyof RegisterErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const login = useAuthStore(state => state.login);
  const isGoogleConfigured = googleSignInService.isConfigured();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\d{10,11}$/;

  const handleRegister = async () => {
    const newErrors: RegisterErrors = {};
    if (!name) newErrors.name = 'Informe seu nome';
    if (!email) {
      newErrors.email = 'Informe seu email';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Email inválido';
    }
    const cpfClean = cleanCPF(cpf);
    if (!cpf) {
      newErrors.cpf = 'Informe seu CPF';
    } else if (!validateCPF(cpfClean)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!phone) {
      newErrors.phone = 'Informe seu telefone';
    } else if (!PHONE_REGEX.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido. Informe DDD + número';
    }
    if (!password) {
      newErrors.password = 'Informe uma senha';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo de 6 caracteres';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.register({ name, email, cpf: cpfClean, phone, password });
      login(response.user, response.token, response.refresh_token);
      showAlert({
        title: 'Sucesso!',
        message: 'Conta criada com sucesso. Bem-vindo(a) ao 4Sinchrony Experience!',
      });
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Nao foi possivel criar sua conta. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const googleUser = await googleSignInService.signIn();
      const response = await authService.register({
        name: googleUser.name,
        email: googleUser.email,
        cpf: '',
        phone: '',
        password: 'google_oauth',
      });
      login(response.user, response.token, response.refresh_token);
    } catch (error: any) {
      captureError(error);
      if (error.message !== 'Login cancelado') {
        showAlert({ title: 'Erro', message: 'Nao foi possivel cadastrar com Google.' });
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
          <View style={[styles.topSection, { paddingTop: isSmallScreen ? Math.min(SCREEN_HEIGHT * 0.04, 50) : Math.min(SCREEN_HEIGHT * 0.06, 80) }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { top: isSmallScreen ? SCREEN_HEIGHT * 0.02 : SCREEN_HEIGHT * 0.04 }]}
            >
              <Ionicons name="chevron-back" size={ms(22)} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.iconCircle, { width: ms(isSmallScreen ? 52 : 64), height: ms(isSmallScreen ? 52 : 64), borderRadius: ms(isSmallScreen ? 22 : 28) }]}>
              <FourSinchronyIcone size={ms(isSmallScreen ? 120 : 150)} />
            </View>
            <Text style={[styles.title, { fontSize: ms(isSmallScreen ? 22 : 26) }]}>Criar Conta</Text>
            <Text style={[styles.tagline, { fontSize: ms(isSmallScreen ? 13 : 14) }]}>Comece sua jornada de bem-estar</Text>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />

            <KeyboardAwareScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid
              extraScrollHeight={20}
            >
              <Text style={[styles.formTitle, { fontSize: ms(isSmallScreen ? 18 : 20) }]}>Vamos comecar</Text>
              <Text style={[styles.formSubtitle, { fontSize: ms(isSmallScreen ? 13 : 14) }]}>Preencha seus dados abaixo</Text>

              <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="person-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={text => { setName(text); clearError('name'); }}
                  autoCapitalize="words"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="mail-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Email"
                  value={email}
                  onChangeText={text => { setEmail(text); clearError('email'); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => cpfRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <View style={[styles.inputWrapper, errors.cpf && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="document-text-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={cpfRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="CPF"
                  value={cpf}
                  onChangeText={(t) => { setCpf(formatCPF(t)); clearError('cpf'); }}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

              <View style={[styles.inputWrapper, errors.phone && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="call-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Telefone (com DDD)"
                  value={phone}
                  onChangeText={text => { setPhone(text); clearError('phone'); }}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Senha"
                  value={password}
                  onChangeText={text => { setPassword(text); clearError('password'); }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ms(20)} color={colors.gray} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={text => { setConfirmPassword(text); clearError('confirmPassword'); }}
                  secureTextEntry
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

              <Button
                title={loading ? 'Criando conta...' : 'Criar Conta'}
                onPress={handleRegister}
                disabled={loading}
                loading={loading}
                variant="dark"
              />

              {isGoogleConfigured && (
                <GoogleSignInButton
                  onPress={handleGoogleRegister}
                  loading={googleLoading}
                  label="Cadastrar com Google"
                />
              )}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, { fontSize: ms(14) }]}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
                <Text style={[styles.loginLinkText, { fontSize: ms(14) }]}>
                  Ja tem uma conta? <Text style={styles.loginLinkHighlight}>Faca login</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.spacer} />
            </KeyboardAwareScrollView>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
