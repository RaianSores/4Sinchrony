import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { studentAdminService, AdminStudent, StudentStatus } from '../../services/studentAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './StudentListScreen.styles';

const PAGE_SIZE = 20;

const STATUS_FILTERS: { label: string; value: StudentStatus | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
  { label: 'Bloqueados', value: 'blocked' },
];

const STATUS_BADGE: Record<StudentStatus, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'danger' },
  blocked: { label: 'Bloqueado', variant: 'warning' },
};

const StudentListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('active');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    const result = await studentAdminService.list(1, PAGE_SIZE);
    setStudents(result.data);
    setPage(1);
    setTotalPages(result.pagination.totalPages);
    setTotal(result.pagination.total);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFirstPage().catch(error => captureError(error)).finally(() => setLoading(false));
  }, [loadFirstPage]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFirstPage().catch(error => captureError(error));
    });
    return unsubscribe;
  }, [navigation, loadFirstPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirstPage().catch(error => captureError(error));
    setRefreshing(false);
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const result = await studentAdminService.list(page + 1, PAGE_SIZE);
      setStudents(prev => [...prev, ...result.data]);
      setPage(page + 1);
    } catch (error) {
      captureError(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Toggle rápido ativar/desativar direto na lista — paridade com o ERP
  // (`studio-wellness-erp/src/app/admin/students/page.tsx`), que já trata isso como
  // `checked: status === 'active'`, ligar chama reactivate, desligar chama deactivate — mesmo
  // comportamento replicado aqui, inclusive pra alunos "bloqueados" (o ERP também não trata
  // esse caso à parte: ligar o toggle de um bloqueado reativa, igual a um inativo comum).
  const handleToggleActive = async (item: AdminStudent, value: boolean) => {
    setTogglingId(item.id);
    try {
      if (value) await studentAdminService.reactivate(item.id);
      else await studentAdminService.deactivate(item.id);
      setStudents(prev => prev.map(s => (s.id === item.id ? { ...s, status: value ? 'active' : 'inactive' } : s)));
    } catch (error) {
      captureError(error);
    } finally {
      setTogglingId(null);
    }
  };

  const renderItem = ({ item }: { item: AdminStudent }) => {
    const badgeCfg = STATUS_BADGE[item.status];
    const detail = [item.plan, item.email].filter(Boolean).join(' · ');
    return (
      <ListItemCard
        icon="person"
        title={item.name}
        subtitle={detail}
        badge={{ label: badgeCfg.label, variant: badgeCfg.variant }}
        onPress={() => navigation.navigate('StudentForm', { studentId: item.id })}
        rightElement={
          <Switch
            value={item.status === 'active'}
            onValueChange={(value) => handleToggleActive(item, value)}
            disabled={togglingId === item.id}
            trackColor={{ true: colors.primary }}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Alunos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('StudentForm', {})}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome ou email..." />
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.value)}
          >
            <Text style={[styles.filterChipText, statusFilter === f.value && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            students.length > 0 ? (
              <Text style={styles.resultCount}>{total} aluno{total !== 1 ? 's' : ''} no total</Text>
            ) : null
          }
          ListFooterComponent={
            !statusFilter && !search && page < totalPages ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={styles.loadMoreText}>Carregar mais</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={search || statusFilter ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              subtitle={search || statusFilter ? 'Tente ajustar a busca ou o filtro' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default StudentListScreen;
