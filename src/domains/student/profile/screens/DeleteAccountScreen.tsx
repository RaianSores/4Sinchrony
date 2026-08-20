import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authService } from '../../../../core/auth/services/authService';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { captureError } from '../../../../lib/sentry';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './DeleteAccountScreen.styles';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import type { DeleteAccountScreenProps } from '../../../../core/navigation/types/screenProps';

const DeleteAccountScreen = ({ navigation }: DeleteAccountScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();
  const { logout } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const performDeletion = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount(password);
      await logout(true);
    } catch (err: any) {
      captureError(err);
      showAlert({
        title: 'Erro',
        message: err.response?.data?.error?.message || err.message || 'Não foi possível excluir sua conta.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!password) {
      showAlert({ title: 'Atenção', message: 'Digite sua senha atual para confirmar.' });
      return;
    }
    showAlert({
      title: 'Excluir conta',
      message: 'Essa ação não pode ser desfeita. Tem certeza que deseja excluir sua conta?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: performDeletion },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Excluir Conta" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Isso é permanente</Text>
            <Text style={styles.warningText}>
              Seus dados pessoais (nome, e-mail, CPF, telefone, endereço e foto) serão removidos e
              você não poderá mais acessar essa conta.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>O que pode ser mantido</Text>
          <Text style={styles.bulletText}>
            Registros de aulas, check-ins e pagamentos já realizados podem ser mantidos por
            período adicional quando exigido por obrigação legal, fiscal ou contábil.
          </Text>

          <Text style={styles.label}>Confirme sua senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            {loading
              ? <ActivityIndicator color={colors.danger} />
              : <Button title="Excluir minha conta" onPress={handleSubmit} variant="dark" style={{ backgroundColor: colors.danger }} />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;
