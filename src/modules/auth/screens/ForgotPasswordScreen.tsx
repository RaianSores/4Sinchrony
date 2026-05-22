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
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { theme } from '../../../shared/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SCALE_BASE = 375;

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = SCREEN_WIDTH / SCALE_BASE;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert } = useAppAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSubmit = async () => {
    if (!email) {
      showAlert({ title: 'Erro', message: 'Informe seu email' });
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      showAlert({ title: 'Erro', message: 'Email nao encontrado' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.topSection, { paddingTop: Math.min(SCREEN_HEIGHT * 0.12, 120) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: SCREEN_HEIGHT * 0.04 }]}
          >
            <Ionicons name="chevron-back" size={ms(24)} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={[styles.iconCircle, { width: ms(56), height: ms(56), borderRadius: ms(28) }]}>
            <Ionicons name="lock-open-outline" size={ms(26)} color={theme.colors.primaryDark} />
          </View>
          <Text style={[styles.title, { fontSize: ms(26) }]}>Recuperar Senha</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {sent ? (
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={ms(64)} color={theme.colors.primaryDark} />
                </View>
                <Text style={[styles.successTitle, { fontSize: ms(22) }]}>Email enviado!</Text>
                <Text style={[styles.successSubtitle, { fontSize: ms(15) }]}>
                  Verifique sua caixa de entrada e siga as instrucoes para redefinir sua senha.
                </Text>
                <Button
                  title="Voltar ao Login"
                  variant="dark"
                  onPress={() => navigation.goBack()}
                />
              </>
            ) : (
              <>
                <Text style={[styles.formTitle, { fontSize: ms(20) }]}>Esqueceu sua senha?</Text>
                <Text style={[styles.formSubtitle, { fontSize: ms(14) }]}>
                  Digite seu email para receber o link de recuperacao.
                </Text>

                <View style={[styles.inputWrapper, { height: ms(52) }]}>
                  <Ionicons name="mail-outline" size={ms(20)} color={theme.colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { fontSize: ms(16) }]}
                    placeholder="Seu email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={theme.colors.grayLight}
                  />
                </View>

                <Button
                  title={loading ? 'Enviando...' : 'Enviar Link'}
                  onPress={handleSubmit}
                  disabled={loading}
                  loading={loading}
                  variant="dark"
                />

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                  <Ionicons name="arrow-back" size={ms(16)} color={theme.colors.primaryDark} />
                  <Text style={[styles.backLinkText, { fontSize: ms(15) }]}> Voltar ao login</Text>
                </TouchableOpacity>
              </>
            )}
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
    marginBottom: 28,
    lineHeight: 20,
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backLinkText: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  successTitle: {
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});

export default ForgotPasswordScreen;
