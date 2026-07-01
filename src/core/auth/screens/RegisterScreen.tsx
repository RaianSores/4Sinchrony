import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
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
import { FourSinchronyIcone } from '../../../shared/components/FourSinchronyIcone';
import { captureError } from '../../../lib/sentry';
import { mkStyles } from './RegisterScreen.styles';

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
  const { showAlert } = useAppAlert();

  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const focusedInputKey = useRef<string | null>(null);

  const fieldOffsets: Record<string, number> = {
    name: 0, email: 1, cpf: 2, phone: 3, password: 4, confirmPassword: 5,
  };

  const getFieldY = (key: string) => {
    const idx = fieldOffsets[key];
    if (idx === undefined) return 0;
    const inputH = ms(isSmallScreen ? 44 : 48);
    const inputM = 10;
    const header = 10 + 4 + 12 + ms(isSmallScreen ? 18 : 20) + 2 + ms(isSmallScreen ? 13 : 14) + 14;
    return header + idx * (inputH + inputM);
  };

  const scrollToInput = (key: string) => {
    const y = getFieldY(key);
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: false });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      if (focusedInputKey.current) {
        scrollToInput(focusedInputKey.current);
      }
    });
    return () => sub.remove();
  }, []);

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
    if (!name || !email || !cpf || !phone || !password || !confirmPassword) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      showAlert({ title: 'Erro', message: 'Email inválido' });
      return;
    }
    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      showAlert({ title: 'Erro', message: 'CPF inválido. Deve conter 11 dígitos' });
      return;
    }
    if (!PHONE_REGEX.test(phone.replace(/\D/g, ''))) {
      showAlert({ title: 'Erro', message: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos)' });
      return;
    }
    if (password !== confirmPassword) {
      showAlert({ title: 'Erro', message: 'As senhas nao coincidem' });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: 'Erro', message: 'A senha deve ter no minimo 6 caracteres' });
      return;
    }

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

            <ScrollView
              ref={scrollViewRef}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.formTitle, { fontSize: ms(isSmallScreen ? 18 : 20) }]}>Vamos comecar</Text>
              <Text style={[styles.formSubtitle, { fontSize: ms(isSmallScreen ? 13 : 14) }]}>Preencha seus dados abaixo</Text>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="person-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => { focusedInputKey.current = 'name'; scrollToInput('name'); }}
                />
              </View>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="mail-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => cpfRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => { focusedInputKey.current = 'email'; scrollToInput('email'); }}
                />
              </View>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="document-text-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={cpfRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="CPF"
                  value={cpf}
                  onChangeText={(t) => {
                    const d = t.replace(/\D/g, '').slice(0, 11);
                    setCpf(d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'));
                  }}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => { focusedInputKey.current = 'cpf'; scrollToInput('cpf'); }}
                />
              </View>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="call-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Telefone (com DDD)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => { focusedInputKey.current = 'phone'; scrollToInput('phone'); }}
                />
              </View>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => { focusedInputKey.current = 'password'; scrollToInput('password'); }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ms(20)} color={colors.gray} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputWrapper, { height: ms(isSmallScreen ? 44 : 48) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, { fontSize: ms(isSmallScreen ? 14 : 15) }]}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor={colors.grayLight}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  onFocus={() => { focusedInputKey.current = 'confirmPassword'; scrollToInput('confirmPassword'); }}
                />
              </View>

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
            </ScrollView>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
