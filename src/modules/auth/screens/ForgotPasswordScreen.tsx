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
import { authService } from '../services/authService';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { theme } from '../../../shared/theme';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert } = useAppAlert();

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
      showAlert({ title: 'Erro', message: 'Email não encontrado' });
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
          title="Recuperar Senha"
          showBack
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.form}>
          {sent ? (
            <>
              <Text style={styles.icon}>✅</Text>
              <Text style={styles.title}>Email enviado!</Text>
              <Text style={styles.subtitle}>
                Verifique sua caixa de entrada e siga as instruções para
                redefinir sua senha.
              </Text>
              <Button
                title="Voltar ao Login"
                onPress={() => navigation.goBack()}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>Esqueceu sua senha?</Text>
              <Text style={styles.subtitle}>
                Digite seu email para receber o link de recuperação.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Seu email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Button
                title={loading ? 'Enviando...' : 'Enviar Link'}
                onPress={handleSubmit}
                disabled={loading}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  form: { padding: 24, flex: 1, justifyContent: 'center' },
  icon: { fontSize: 64, textAlign: 'center', marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
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
});

export default ForgotPasswordScreen;
