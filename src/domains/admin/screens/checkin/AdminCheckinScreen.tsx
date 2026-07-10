import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { bookingAdminService, AdminBooking } from '../../services/bookingAdminService';
import { checkinAdminService, AdminCheckinRecord, CheckinStatus } from '../../services/checkinAdminService';
import { classAdminService, AdminClass } from '../../services/classAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import FormSelect from '../../../../shared/components/FormSelect';
import EmptyState from '../../../../shared/components/EmptyState';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { isoDateToBR } from '../../../../shared/utils/formatDate';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './AdminCheckinScreen.styles';

type RowStatus = CheckinStatus | 'pending';

interface CheckinRow {
  bookingId: string;
  checkinId: string | null;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  startTime: string;
  status: RowStatus;
}

const STATUS_CONFIG: Record<RowStatus, { label: string; color: string }> = {
  pending: { label: 'Sem registro', color: '#94A3B8' },
  confirmed: { label: 'Aguardando', color: '#1287AF' },
  attended: { label: 'Presente', color: '#22C55E' },
  no_show: { label: 'Faltou', color: '#F59E0B' },
};

// "Sem registro" cobre o bug de backend já documentado (docs/DEMANDA_CHECKIN_ATTENDANCE_BACKEND.md):
// reservas confirmadas podem não ter um registro de check-in correspondente ainda. Em vez de
// esconder essas reservas (o que faria o admin achar que ninguém reservou) ou tentar confirmar
// um id que não existe, mostramos a reserva com um estado "Sem registro" sem ação disponível —
// igual ao contorno já usado no fluxo do professor, que lê a lista de alunos a partir das
// reservas em vez da tabela de check-in.
const AdminCheckinScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [checkins, setCheckins] = useState<AdminCheckinRecord[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [bookingsData, checkinsData, classesData] = await Promise.all([
        bookingAdminService.list(),
        checkinAdminService.listAll(),
        classAdminService.list(),
      ]);
      setBookings(bookingsData);
      setCheckins(checkinsData);
      setClasses(classesData);
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

  const rows = useMemo<CheckinRow[]>(() => {
    const checkinByBookingId = new Map<string, AdminCheckinRecord>(checkins.map(c => [c.bookingId, c]));
    const classesById = new Map<string, AdminClass>(classes.map(c => [c.id, c]));
    return bookings
      .filter(b => b.status === 'confirmed')
      .map(b => {
        const checkin = checkinByBookingId.get(b.id);
        const cls = classesById.get(b.classId);
        return {
          bookingId: b.id,
          checkinId: checkin?.id ?? null,
          studentName: b.studentName,
          classId: b.classId,
          className: b.className,
          date: cls?.date ?? '',
          startTime: cls?.startTime ?? '',
          status: (checkin?.status ?? 'pending') as RowStatus,
        };
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [bookings, checkins, classes]);

  const classOptions = useMemo(
    () => [
      { label: 'Todas as aulas', value: '' },
      ...classes.map(c => ({ label: `${c.name} (${isoDateToBR(c.date)})`, value: c.id })),
    ],
    [classes]
  );

  const filtered = rows.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || r.classId === classFilter;
    return matchSearch && matchClass;
  });

  const handleConfirm = async (row: CheckinRow) => {
    if (!row.checkinId) return;
    setActingId(row.checkinId);
    try {
      await checkinAdminService.confirm(row.checkinId);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível confirmar a presença.') });
    } finally {
      setActingId(null);
    }
  };

  const handleNoShow = (row: CheckinRow) => {
    if (!row.checkinId) return;
    const checkinId = row.checkinId;
    showAlert({
      title: 'Marcar falta',
      message: `Confirmar que ${row.studentName} não compareceu?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar Falta',
          style: 'destructive',
          onPress: async () => {
            setActingId(checkinId);
            try {
              await checkinAdminService.markNoShow(checkinId);
              await load();
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível marcar a falta.') });
            } finally {
              setActingId(null);
            }
          },
        },
      ],
    });
  };

  const renderItem = ({ item }: { item: CheckinRow }) => {
    const cfg = STATUS_CONFIG[item.status];
    const dateLabel = item.date ? `${isoDateToBR(item.date)} · ${item.startTime}` : '';
    const busy = actingId === item.checkinId;
    return (
      <View style={styles.row}>
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.studentName} numberOfLines={1}>{item.studentName}</Text>
            <Text style={styles.rowSubtitle} numberOfLines={1}>{item.className}{dateLabel ? ` · ${dateLabel}` : ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {item.status === 'confirmed' && (
          <View style={styles.actionsRow}>
            {busy ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item)}>
                  <Text style={styles.confirmButtonText}>Confirmar Presença</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noShowButton} onPress={() => handleNoShow(item)}>
                  <Text style={styles.noShowButtonText}>Marcar Falta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {item.status === 'pending' && (
          <Text style={styles.pendingNote}>Reserva confirmada, mas ainda sem registro de check-in no backend.</Text>
        )}
      </View>
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
        <Text style={styles.title}>Check-in</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por aluno..." />
      </View>

      <View style={styles.filterContainer}>
        <FormSelect label="Aula" value={classFilter} options={classOptions} onSelect={setClassFilter} placeholder="Todas as aulas" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.bookingId}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            rows.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} reserva{filtered.length !== 1 ? 's' : ''} confirmada{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-circle-outline"
              title="Nenhuma reserva confirmada"
              subtitle="Reservas confirmadas aparecem aqui pra check-in"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminCheckinScreen;
