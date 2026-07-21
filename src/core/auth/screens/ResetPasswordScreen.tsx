import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { captureError } from '../../../lib/sentry';
import { mkStyles } from './ResetPasswordScreen.styles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RoleResolver';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const SCALE_BASE = 375;

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scale = useMemo(() => SCREEN_WIDTH / SCALE_BASE, [SCREEN_WIDTH]);

  const token = route.params?.token || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { showAlert } = useAppAlert();

  const ms = (size: number, factor = 0.3) => size + (scale - 1) * size * factor;

  const handleReset = async () => {
    if (!token) {
      showAlert({ title: 'Erro', message: 'Link inválido — token não encontrado. Solicite um novo link.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showAlert({ title: 'Erro', message: 'A senha deve ter ao menos 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ title: 'Erro', message: 'As senhas nao conferem' });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Token invalido ou expirado. Solicite um novo link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
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
        <Text style={[styles.title, { fontSize: ms(26) }]}>Nova Senha</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {done ? (
            <>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={ms(64)} color={colors.primaryDark} />
              </View>
              <Text style={[styles.successTitle, { fontSize: ms(22) }]}>Senha redefinida!</Text>
              <Text style={[styles.successSubtitle, { fontSize: ms(15) }]}>
                Sua senha foi alterada com sucesso. Faca login com sua nova senha.
              </Text>
              <Button
                title="Ir para Login"
                variant="dark"
                onPress={() => navigation.navigate('Login')}
              />
            </>
          ) : (
            <>
              <Text style={[styles.formTitle, { fontSize: ms(20) }]}>Redefinir Senha</Text>
              <Text style={[styles.formSubtitle, { fontSize: ms(14) }]}>
                Digite sua nova senha.
              </Text>

              <View style={[styles.inputWrapper, { height: ms(52) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: ms(16) }]}
                  placeholder="Nova senha"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor={colors.grayLight}
                />
              </View>

              <View style={[styles.inputWrapper, { height: ms(52) }]}>
                <Ionicons name="lock-closed-outline" size={ms(20)} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { fontSize: ms(16) }]}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor={colors.grayLight}
                />
              </View>

              <Button
                title={loading ? 'Redefinindo...' : 'Redefinir Senha'}
                onPress={handleReset}
                disabled={loading}
                loading={loading}
                variant="dark"
              />

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={ms(16)} color={colors.primaryDark} />
                <Text style={[styles.backLinkText, { fontSize: ms(15) }]}> Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
