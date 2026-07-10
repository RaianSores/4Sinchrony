import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { bookingAdminService, AdminBooking, BookingStatus, resolveEffectiveBookingStatus } from '../../services/bookingAdminService';
import { checkinAdminService, AdminCheckinRecord } from '../../services/checkinAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './AdminBookingListScreen.styles';

const STATUS_FILTERS: { label: string; value: BookingStatus | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Presentes', value: 'attended' },
  { label: 'Canceladas', value: 'cancelled' },
  { label: 'Não compareceu', value: 'no_show' },
];

const STATUS_BADGE: Record<BookingStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
  confirmed: { label: 'Confirmada', variant: 'info' },
  attended: { label: 'Presente', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
  no_show: { label: 'Não compareceu', variant: 'warning' },
};

// Sem botão de "criar" de propósito — reservas só são criadas pelo aluno via app, nunca
// manualmente pelo admin (mesmo comportamento do ERP, confirmado no mapeamento desta fase).
const AdminBookingListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [checkins, setCheckins] = useState<AdminCheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  const load = useCallback(async () => {
    try {
      const [bookingsData, checkinsData] = await Promise.all([
        bookingAdminService.list(),
        checkinAdminService.listAll(),
      ]);
      setBookings([...bookingsData].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt)));
      setCheckins(checkinsData);
    } catch (error) {
      captureError(error);
    }
  }, []);

  // A reserva fica presa em "confirmed" pra sempre mesmo depois do check-in real acontecer
  // (ver comentário em bookingAdminService.ts) — por isso cruzamos com os check-ins reais em
  // vez de confiar só no `status` da própria reserva pro badge e pro filtro.
  const checkinByBookingId = useMemo(
    () => new Map<string, AdminCheckinRecord>(checkins.map(c => [c.bookingId, c])),
    [checkins]
  );
  const effectiveStatusById = useMemo(() => {
    const map = new Map<string, BookingStatus>();
    bookings.forEach(b => map.set(b.id, resolveEffectiveBookingStatus(b, checkinByBookingId.get(b.id))));
    return map;
  }, [bookings, checkinByBookingId]);

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

  const filtered = bookings.filter(b => {
    const term = search.toLowerCase();
    const matchSearch = b.studentName.toLowerCase().includes(term) || b.className.toLowerCase().includes(term);
    const matchStatus = !statusFilter || effectiveStatusById.get(b.id) === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderItem = ({ item }: { item: AdminBooking }) => {
    const badgeCfg = STATUS_BADGE[effectiveStatusById.get(item.id) ?? item.status];
    const bookedDate = new Date(item.bookedAt);
    const subtitle = `${item.className} · ${bookedDate.toLocaleDateString('pt-BR')} ${bookedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    return (
      <ListItemCard
        icon="ticket"
        title={item.studentName}
        subtitle={subtitle}
        badge={{ label: badgeCfg.label, variant: badgeCfg.variant }}
        onPress={() => navigation.navigate('AdminBookingDetail', { booking: item, checkin: checkinByBookingId.get(item.id) })}
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
        <Text style={styles.title}>Reservas</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por aluno ou aula..." />
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
            bookings.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} reserva{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="ticket-outline"
              title={search || statusFilter ? 'Nenhuma reserva encontrada' : 'Nenhuma reserva registrada'}
              subtitle={search || statusFilter ? 'Tente ajustar a busca ou o filtro' : 'Reservas aparecem aqui assim que os alunos agendarem'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminBookingListScreen;
