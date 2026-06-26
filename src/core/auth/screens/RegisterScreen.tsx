import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { useTheme } from '../../../shared/theme/useTheme';
import { googleSignInService } from '../services/googleSignInService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './RegisterScreen.styles';

const SCALE_BASE = 375;

const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = SCREEN_WIDTH / SCALE_BASE;
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { showAlert } = useAppAlert();

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
    if (!name || !email || !phone || !password || !confirmPassword) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      showAlert({ title: 'Erro', message: 'Email inválido' });
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
      const response = await authService.register({ name, email, phone, password });
      login(response.user, response.token, response.refresh_token);
      showAlert({
        title: 'Sucesso!',
        message: 'Conta criada com sucesso. Bem-vindo(a) ao 4Sinchrony Experience!',
      });
    } catch {
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
        phone: '',
        password: 'google_oauth',
      });
      login(response.user, response.token, response.refresh_token);
    } catch (error: any) {
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
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.topSection, { paddingTop: Math.min(SCREEN_HEIGHT * 0.08, 80) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: SCREEN_HEIGHT * 0.04 }]}
          >
            <Ionicons name="chevron-back" size={ms(24)} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.iconCircle, { width: ms(56), height: ms(56), borderRadius: ms(28) }]}>
            <Ionicons name="fitness" size={ms(26)} color={colors.primaryDark} />
          </View>
          <Text style={[styles.title, { fontSize: ms(26) }]}>Criar Conta</Text>
          <Text style={[styles.tagline, { fontSize: ms(14) }]}>Comece sua jornada de bem-estar</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Text style={[styles.formTitle, { fontSize: ms(20) }]}>Vamos comecar</Text>
            <Text style={[styles.formSubtitle, { fontSize: ms(14) }]}>Preencha seus dados abaixo</Text>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="person-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor={colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="mail-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="call-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Telefone (com DDD)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.grayLight}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ms(20)} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={colors.grayLight}
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
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
