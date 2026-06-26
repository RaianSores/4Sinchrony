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
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './ForgotPasswordScreen.styles';

const SCALE_BASE = 375;

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

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
    } catch {
      // exibir sucesso independente do resultado (anti-enumeração)
    } finally {
      setLoading(false);
      setSent(true);
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
            <Ionicons name="chevron-back" size={ms(24)} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.iconCircle, { width: ms(56), height: ms(56), borderRadius: ms(28) }]}>
            <Ionicons name="lock-open-outline" size={ms(26)} color={colors.primaryDark} />
          </View>
          <Text style={[styles.title, { fontSize: ms(26) }]}>Recuperar Senha</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {sent ? (
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={ms(64)} color={colors.primaryDark} />
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
                  <Ionicons name="mail-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { fontSize: ms(16) }]}
                    placeholder="Seu email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.grayLight}
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
                  <Ionicons name="arrow-back" size={ms(16)} color={colors.primaryDark} />
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

export default ForgotPasswordScreen;
