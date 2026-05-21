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

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAppAlert();

  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({ title: 'Erro', message: 'Preencha todos os campos' });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
    } catch {
      showAlert({ title: 'Erro', message: 'Email ou senha inválidos' });
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
        <Header title="Bem-vindo de volta" />

        <View style={styles.form}>
          <Text style={styles.title}>Faça login na sua conta</Text>

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
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Button
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
          />

          <Button
            title="Criar conta"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />

          <Text
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            Esqueci minha senha
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  form: { padding: 24, flex: 1, justifyContent: 'center' },
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
  forgotPassword: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 28,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
