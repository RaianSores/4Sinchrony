import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { theme } from '../../../shared/theme';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAppAlert();

  const login = useAuthStore(state => state.login);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({ title: 'Erro', message: 'As senhas não coincidem' });
      return;
    }

    if (password.length < 6) {
      showAlert({ title: 'Erro', message: 'A senha deve ter no mínimo 6 caracteres' });
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
        message: 'Conta criada com sucesso. Bem-vindo(a) ao Studio Velocity!',
      });
    } catch {
      showAlert({ title: 'Erro', message: 'Não foi possível criar sua conta. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          title="Criar Conta"
          showBack
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.form}>
          <Text style={styles.title}>Vamos começar sua jornada</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone (com DDD)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Button
            title={loading ? "Criando conta..." : "Criar Conta"}
            onPress={handleRegister}
            disabled={loading}
          />

          <Text style={styles.loginLink} onPress={() => navigation.goBack()}>
            Já tem uma conta? Faça login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  form: { padding: 24, flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 16,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loginLink: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;
