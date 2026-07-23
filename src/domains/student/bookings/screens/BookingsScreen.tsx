import React, { useState, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, RefreshControl, SectionList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Booking } from '../../../../shared/types';
import { useBookingStore } from '../store/useBookingStore';
import { useClassStore } from '../../classes/store/useClassStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { canCancelBooking } from '../../../../shared/utils/canCancelBooking';
import type { BookingsScreenProps } from '../../../../core/navigation/types/screenProps';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './BookingsScreen.styles';
import Skeleton from '../../../../shared/components/Skeleton';

const BookingCardSkeleton = ({ styles }: { styles: ReturnType<typeof mkStyles> }) => (
  <View style={styles.bookingCard}>
    <View style={styles.cardHeader}>
      <View style={styles.cardLeft}>
        <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
        <View style={{ gap: 6 }}>
          <Skeleton width={130} height={15} />
          <Skeleton width={90} height={13} />
        </View>
      </View>
      <Skeleton width={70} height={22} borderRadius={12} />
    </View>
    <View style={styles.cardDetails}>
      <Skeleton width={110} height={13} />
      <Skeleton width={140} height={13} />
    </View>
  </View>
);




const BookingsScreen = ({ navigation }: BookingsScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user, updateUser } = useAuthStore();
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const { classes, fetchClasses, setFilters: setClassFilters } = useClassStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAppAlert();
  const mountedRef = useRef(true);

  useFocusEffect(useCallback(() => {
    mountedRef.current = true;
    fetchBookings();
    // Sem filtro de data/tipo — precisamos de todas as aulas pra cruzar com qualquer reserva,
    // independente de filtros deixados por outra tela (Agenda) na mesma store compartilhada.
    setClassFilters({ date: '', type: '' });
    fetchClasses();
    return () => { mountedRef.current = false; };
  }, [fetchBookings, fetchClasses, setClassFilters]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBookings(), fetchClasses()]);
    if (mountedRef.current) setRefreshing(false);
  }, [fetchBookings, fetchClasses]);

  const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: { label: 'Confirmada',   bg: colors.success + '20', color: colors.success },
    attended:  { label: 'Presente',     bg: colors.success + '20', color: colors.success },
    cancelled: { label: 'Cancelada',    bg: colors.danger + '20',  color: colors.danger },
    no_show:   { label: 'Não compareceu', bg: colors.warning + '20', color: colors.warning },
  };

  // "confirmed" sozinho não basta: uma reserva fica "confirmed" pra sempre se o professor
  // encerrar a aula sem marcar presença/ausência de ninguém — sem checar a data/hora da
  // aula, ela nunca sairia de "Ativas" mesmo depois de já ter acontecido.
  const now = new Date();
  const todayStr = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  // O objeto `class` embutido na reserva (`b.class`, vindo de `GET /bookings`) nem sempre
  // carrega o `status` real da aula — por isso cruzamos com a lista de aulas buscada à parte
  // (`classes`, de `GET /classes`, já confirmada confiável) em vez de confiar em `b.class.status`
  // diretamente. Sem isso, uma reserva pra uma aula já encerrada mais cedo (mas com horário
  // agendado ainda no futuro, ex: aula marcada pras 22:00 encerrada às 12:10) continuava
  // aparecendo em "Ativas" pra sempre — a checagem de data/hora sozinha não basta.
  const classesById = new Map(classes.map(c => [c.id, c]));
  const isUpcoming = (b: Booking) => {
    const realClass = classesById.get(b.class.id) ?? b.class;
    return realClass.status !== 'completed' && realClass.status !== 'cancelled' &&
      (realClass.date > todayStr || (realClass.date === todayStr && realClass.startTime > currentTimeStr));
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' && isUpcoming(b));
  const pastBookings = bookings.filter(b => b.status !== 'confirmed' || !isUpcoming(b));

  const handleCancel = (booking: Booking) => {
    const { allowed, reason } = canCancelBooking(booking);
    if (!allowed) {
      showAlert({ title: 'Cancelamento indisponível', message: reason! });
      return;
    }
    showAlert({ title: 'Cancelar Reserva', message: `Tem certeza que deseja cancelar ${booking.class.name}?`,
      buttons: [{ text: 'Não', style: 'cancel' }, { text: 'Sim, Cancelar', style: 'destructive', onPress: async () => {
        setCancellingId(booking.id);
        try {
          await cancelBooking(booking.id);
          updateUser({ credits: (user?.credits || 0) + 1 });
          showAlert({ title: 'Cancelada', message: 'Reserva cancelada com sucesso. 1 crédito foi estornado.' });
        } catch (error) { captureError(error); showAlert({ title: 'Erro', message: 'Não foi possível cancelar' }); }
        finally { setCancellingId(null); }
      }}] });
  };

  const sections: { title: string; data: Booking[]; kind: 'active' | 'past' }[] = [
    ...(activeBookings.length > 0 ? [{ title: 'Ativas', data: activeBookings, kind: 'active' as const }] : []),
    ...(pastBookings.length > 0 ? [{ title: 'Anteriores', data: pastBookings, kind: 'past' as const }] : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Minhas Reservas" />
      <SectionList
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={b => b.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            {...({ backgroundColor: colors.background } as any)}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              <BookingCardSkeleton styles={styles} />
              <BookingCardSkeleton styles={styles} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={80} color={colors.border} />
              <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
              <Text style={styles.emptySubtitle}>Suas reservas agendadas aparecerão aqui</Text>
              <Button title="Ver Agenda" onPress={() => navigation.navigate('AgendaTab')} style={{ marginTop: 32 }} />
            </View>
          )
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item: b, section }) =>
          section.kind === 'active' ? (
            <View style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardTexts}>
                    <Text style={styles.className} numberOfLines={2}>{b.class.name}</Text>
                    <Text style={styles.instructor} numberOfLines={1}>{b.class.instructor}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg[b.status]?.bg || colors.success + '20' }]}><Text style={[styles.statusText, { color: statusCfg[b.status]?.color || colors.success }]}>{statusCfg[b.status]?.label || 'Confirmada'}</Text></View>
              </View>
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}><Ionicons name="calendar-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.date}</Text></View>
                <View style={styles.detailItem}><Ionicons name="time-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.startTime} - {b.class.duration}min</Text></View>
                {b.class.studio && <View style={styles.detailItem}><Ionicons name="location-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.studio.name}</Text></View>}
                {b.bikeNumber && <View style={styles.detailItem}><Ionicons name="bicycle" size={16} color={colors.primary} /><Text style={[styles.detailText, { color: colors.primary }]}>Bike #{b.bikeNumber}</Text></View>}
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(b)} disabled={cancellingId === b.id}>
                <Text style={styles.cancelText}>{cancellingId === b.id ? 'Cancelando...' : 'Cancelar Reserva'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.bookingCard, { opacity: 0.7 }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <View>
                    <Text style={[styles.className, { color: colors.textSecondary }]}>{b.class.name}</Text>
                    <Text style={[styles.instructor, { color: colors.textSecondary }]}>{b.class.instructor}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (statusCfg[b.status] || statusCfg.cancelled).bg }]}>
                  <Text style={[styles.statusText, { color: (statusCfg[b.status] || statusCfg.cancelled).color }]}>{(statusCfg[b.status] || statusCfg.cancelled).label}</Text>
                </View>
              </View>
            </View>
          )
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('BookingHistory')}>
            <Text style={styles.historyLinkText}>Ver Histórico Completo</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};



export default BookingsScreen;

