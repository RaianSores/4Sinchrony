import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authService } from '../../../../core/auth/services/authService';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const ChangePasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { showAlert } = useAppAlert();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({ title: 'Atenção', message: 'Preencha todos os campos' });
      return;
    }
    if (newPassword.length < 6) {
      showAlert({ title: 'Atenção', message: 'Nova senha deve ter pelo menos 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ title: 'Atenção', message: 'Nova senha e confirmação não coincidem' });
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showAlert({
        title: 'Senha Alterada!',
        message: 'Sua senha foi atualizada com sucesso.',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (err: any) {
      showAlert({ title: 'Erro', message: err.message || 'Não foi possível alterar a senha' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Alterar Senha" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.hint}>
            Por segurança, confirme sua senha atual antes de criar uma nova.
          </Text>

          <Text style={styles.label}>Senha atual</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowCurrent(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nova senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar nova senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a nova senha"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            {loading
              ? <ActivityIndicator color={colors.primary} />
              : <Button title="Alterar Senha" onPress={handleSubmit} />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  form: { padding: 20 },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFlex: {
    flex: 1,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
  eyeBtn: { paddingHorizontal: 14 },
  buttonRow: { marginTop: 28 },
});

export default ChangePasswordScreen;
