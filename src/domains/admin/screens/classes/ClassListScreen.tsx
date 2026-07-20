import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { classAdminService, AdminClass, ClassStatus } from '../../services/classAdminService';
import { classTypeAdminService, AdminClassType } from '../../services/classTypeAdminService';
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
  const [classTypes, setClassTypes] = useState<AdminClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, types] = await Promise.all([
        classAdminService.list(),
        classTypeAdminService.list(),
      ]);
      const sorted = [...data].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
      setClasses(sorted);
      setClassTypes(types.filter(t => t.active));
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
    const matchType = !typeFilter || c.classTypeId === typeFilter;
    const matchDate = !dateFilter || c.date === dateFilter;
    return matchSearch && matchStatus && matchType && matchDate;
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

      {/* Filtro por tipo de aula e por data — paridade com o ERP (`/admin/classes`, que já
          filtra por tipo em chips e por data), item I-11 do backlog. */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !typeFilter && styles.filterChipActive]}
          onPress={() => setTypeFilter('')}
        >
          <Text style={[styles.filterChipText, !typeFilter && styles.filterChipTextActive]}>Todos os tipos</Text>
        </TouchableOpacity>
        {classTypes.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.filterChip, typeFilter === t.id && styles.filterChipActive]}
            onPress={() => setTypeFilter(t.id)}
          >
            <Text style={[styles.filterChipText, typeFilter === t.id && styles.filterChipTextActive]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !dateFilter && styles.filterChipActive]}
          onPress={() => setDateFilter('')}
        >
          <Text style={[styles.filterChipText, !dateFilter && styles.filterChipTextActive]}>Todas as datas</Text>
        </TouchableOpacity>
        {dateFilter ? (
          <TouchableOpacity
            style={[styles.filterChip, styles.filterChipActive]}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{isoDateToBR(dateFilter)}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.filterChip, styles.filterChipCalendar]} onPress={() => setShowCalendar(true)}>
            <Ionicons name="calendar-outline" size={16} color={colors.text} />
          </TouchableOpacity>
        )}
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
              title={search || statusFilter || typeFilter || dateFilter ? 'Nenhuma aula encontrada' : 'Nenhuma aula cadastrada'}
              subtitle={search || statusFilter || typeFilter || dateFilter ? 'Tente ajustar a busca ou os filtros' : 'Toque em + para cadastrar a primeira'}
            />
          }
        />
      )}

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a data</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={dateFilter || new Date().toISOString().split('T')[0]}
              onDayPress={(day: any) => { setDateFilter(day.dateString); setShowCalendar(false); }}
              markedDates={dateFilter ? { [dateFilter]: { selected: true, selectedColor: colors.primary } } : {}}
              theme={{
                calendarBackground: colors.card,
                dayTextColor: colors.text,
                monthTextColor: colors.text,
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
              }}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowCalendar(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ClassListScreen;
