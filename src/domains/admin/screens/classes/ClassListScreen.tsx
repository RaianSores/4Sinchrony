import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { classAdminService, AdminClass, ClassStatus } from '../../services/classAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { isoDateToBR } from '../../../../shared/utils/formatDate';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './ClassListScreen.styles';

const STATUS_FILTERS: { label: string; value: ClassStatus | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Agendadas', value: 'scheduled' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Concluídas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
];

const STATUS_BADGE: Record<ClassStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
  scheduled: { label: 'Agendada', variant: 'info' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
  completed: { label: 'Concluída', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

const ClassListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | ''>('');

  const load = useCallback(async () => {
    try {
      const data = await classAdminService.list();
      const sorted = [...data].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
      setClasses(sorted);
    } catch (error) {
      captureError(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = classes.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderItem = ({ item }: { item: AdminClass }) => {
    const badgeCfg = STATUS_BADGE[item.status];
    const subtitle = `${isoDateToBR(item.date)} · ${item.startTime}-${item.endTime} · ${item.instructor} · ${item.studioName}`;
    return (
      <ListItemCard
        icon="calendar"
        title={item.name}
        subtitle={subtitle}
        badge={{ label: badgeCfg.label, variant: badgeCfg.variant }}
        onPress={() => navigation.navigate('ClassForm', { classId: item.id })}
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
        <Text style={styles.title}>Aulas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ClassForm', {})}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome da aula..." />
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
            classes.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} aula{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={search || statusFilter ? 'Nenhuma aula encontrada' : 'Nenhuma aula cadastrada'}
              subtitle={search || statusFilter ? 'Tente ajustar a busca ou o filtro' : 'Toque em + para cadastrar a primeira'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ClassListScreen;
