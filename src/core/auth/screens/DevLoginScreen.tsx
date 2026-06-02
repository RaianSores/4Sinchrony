import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DevLoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const [loading, setLoading] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const login = useAuthStore(state => state.login);

  const handleDevLogin = async (role: 'student' | 'teacher' | 'admin') => {
    setLoading(role);
    try {
      const fn = role === 'teacher'
        ? authService.loginAsTeacher
        : role === 'admin'
          ? authService.loginAsAdmin
          : () => authService.login({ email: 'dev@studiowellness.com', password: 'dev123' });

      const response = await fn();
      login(response.user, response.token);
    } finally {
      setLoading(null);
    }
  };

  const roles = [
    { key: 'student' as const, label: 'Aluno', icon: 'person-outline', color: colors.primary },
    { key: 'teacher' as const, label: 'Professor', icon: 'school-outline', color: '#8B5CF6' },
    { key: 'admin' as const, label: 'Admin', icon: 'shield-checkmark-outline', color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Dev Login</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="flask" size={20} color="#F59E0B" />
          <Text style={styles.badgeText}>Ambiente de Desenvolvimento</Text>
        </View>

        <Text style={styles.subtitle}>
          Selecione um perfil para entrar sem autenticação real.
        </Text>

        {roles.map(({ key, label, icon, color }) => (
          <TouchableOpacity
            key={key}
            style={[styles.roleButton, { borderColor: color }]}
            onPress={() => handleDevLogin(key)}
            disabled={loading !== null}
          >
            <View style={[styles.roleIcon, { backgroundColor: color + '15' }]}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>Entrar como {label}</Text>
              <Text style={styles.roleDescription}>
                {key === 'student' ? 'Reservas, aulas, perfil' :
                 key === 'teacher' ? 'Dashboard, check-in, métricas' :
                 'Gerenciamento da plataforma'}
              </Text>
            </View>
            {loading === key ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 32, lineHeight: 22 },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1.5,
    gap: 14,
  },
  roleIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  roleDescription: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});

export default DevLoginScreen;
