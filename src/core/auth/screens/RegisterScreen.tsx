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

const RegisterScreen = ({ navigation }: any) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = SCREEN_WIDTH / SCALE_BASE;

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
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
      const response = await authService.register({
        name,
        email,
        phone,
        password,
      });

      login(response.user, response.token);

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
      login(response.user, response.token);
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
            <Ionicons name="chevron-back" size={ms(24)} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={[styles.iconCircle, { width: ms(56), height: ms(56), borderRadius: ms(28) }]}>
            <Ionicons name="fitness" size={ms(26)} color={theme.colors.primaryDark} />
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
              <Ionicons name="person-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor={theme.colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="mail-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="call-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Telefone (com DDD)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.grayLight}
              />
            </View>

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="lock-closed-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
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

            <View style={[styles.inputWrapper, { height: ms(50) }]}>
              <Ionicons name="lock-closed-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize: ms(15) }]}
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={theme.colors.grayLight}
              />
            </View>

            <Button
              title={loading ? 'Criando conta...' : 'Criar Conta'}
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              variant="dark"
            />

            <GoogleSignInButton
              onPress={handleGoogleRegister}
              loading={googleLoading}
              label="Cadastrar com Google"
            />

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
    paddingBottom: 16,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,
  },
  iconCircle: {
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...theme.shadow.md,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 4,
    ...theme.shadow.lg,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayLight,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
  loginLink: {
    alignItems: 'center',
    marginBottom: 8,
  },
  loginLinkText: {
    color: theme.colors.textSecondary,
  },
  loginLinkHighlight: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});

export default RegisterScreen;
