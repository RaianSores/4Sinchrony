import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Button from '../../../shared/components/Button';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import { verifyEmailService } from '../services/verifyEmailService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { captureError } from '../../../lib/sentry';
import { mkStyles } from './VerifyEmailScreen.styles';

const SCALE_BASE = 375;

interface VerifyEmailScreenProps {
  navigation: any;
  route: any;
}

const VerifyEmailScreen = ({ navigation, route }: VerifyEmailScreenProps) => {
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = SCREEN_WIDTH / SCALE_BASE;
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { showAlert } = useAppAlert();

  const email = route.params?.email ?? '';
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await verifyEmailService.resendVerification({ email });
      setResent(true);
      setCooldown(60);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Nao foi possivel reenviar o email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Login');
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
          <View style={[styles.iconCircle, { width: ms(72), height: ms(72), borderRadius: ms(36) }]}>
            <Ionicons name="mail-unread-outline" size={ms(34)} color={colors.primaryDark} />
          </View>
          <Text style={[styles.title, { fontSize: ms(26) }]}>Verifique seu Email</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Text style={[styles.formTitle, { fontSize: ms(20) }]}>Quase la!</Text>
            <Text style={[styles.formSubtitle, { fontSize: ms(15) }]}>
              Enviamos um email de verificacao para:
            </Text>
            <Text style={[styles.emailText, { fontSize: ms(16) }]}>{email}</Text>
            <Text style={[styles.instructions, { fontSize: ms(14) }]}>
              Clique no link enviado para ativar sua conta. Depois faca login normalmente.
            </Text>

            <View style={styles.resendSection}>
              <Button
                title={
                  loading
                    ? 'Enviando...'
                    : cooldown > 0
                      ? `Reenviar em ${cooldown}s`
                      : resent
                        ? 'Reenviar'
                        : 'Reenviar Email'
                }
                onPress={handleResend}
                disabled={loading || cooldown > 0}
                loading={loading}
                variant="outline"
              />
              {resent && (
                <Text style={[styles.resentText, { fontSize: ms(13) }]}>
                  Email reenviado! Verifique sua caixa de entrada.
                </Text>
              )}
            </View>

            <Button
              title="Ja verifiquei — Ir para Login"
              onPress={handleContinue}
              variant="dark"
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
              <Ionicons name="arrow-back" size={ms(16)} color={colors.primaryDark} />
              <Text style={[styles.backLinkText, { fontSize: ms(15) }]}> Voltar ao login</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmailScreen;
