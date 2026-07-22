import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { captureError } from '../../../../lib/sentry';
import { studentPackageService, StudentPackage } from '../services/studentPackageService';
import { mkStyles } from './MyPackageScreen.styles';

const STATUS_LABEL: Record<StudentPackage['status'], { label: string; color: string }> = {
  active: { label: 'Ativo', color: '#22C55E' },
  queued: { label: 'Na fila', color: '#F59E0B' },
  expired: { label: 'Expirado', color: '#94A3B8' },
  cancelled: { label: 'Cancelado', color: '#EF4444' },
};

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

const MyPackageScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [pkg, setPkg] = useState<StudentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await studentPackageService.getMyActivePackage();
      setPkg(data);
    } catch (error) {
      captureError(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const status = pkg ? STATUS_LABEL[pkg.status] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Meu Pacote" showBack onBackPress={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        >
          {!pkg ? (
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>Você ainda não tem um pacote ativo</Text>
              <Text style={styles.emptySubtitle}>Escolha um plano para começar a reservar suas aulas.</Text>
              <View style={styles.emptyButton}>
                <Button title="Ver planos" onPress={() => navigation.navigate('Packages')} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.planTag}>
                    <Ionicons name="ribbon" size={16} color={colors.primary} />
                    <Text style={styles.planTagText}>{pkg.packageTypeName ?? 'Plano'}</Text>
                  </View>
                  {status && (
                    <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.pkgName}>{pkg.packageName ?? 'Pacote de aulas'}</Text>

                {pkg.creditsRemaining != null && (
                  <View style={styles.creditsRow}>
                    <Text style={styles.creditsValue}>{pkg.creditsRemaining}</Text>
                    <Text style={styles.creditsLabel}>
                      crédito{pkg.creditsRemaining !== 1 ? 's' : ''} restante{pkg.creditsRemaining !== 1 ? 's' : ''}
                      {pkg.credits != null ? ` de ${pkg.credits}` : ''}
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>Válido até {formatDateBR(pkg.endDate)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>Adquirido em {formatDateBR(pkg.purchasedAt ?? pkg.startDate)}</Text>
                </View>
              </View>

              {pkg.benefits && pkg.benefits.length > 0 && (
                <View style={styles.benefitsCard}>
                  <Text style={styles.benefitsTitle}>Benefícios inclusos</Text>
                  {pkg.benefits.map(b => (
                    <View key={b.id} style={styles.benefitRow}>
                      <Text style={styles.benefitIcon}>{b.icon || '✔️'}</Text>
                      <Text style={styles.benefitName}>{b.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('MyDependents')}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.linkText}>Gerenciar dependentes</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyPackageScreen;
