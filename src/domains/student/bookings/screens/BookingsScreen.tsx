import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './BookingsScreen.styles';

const BookingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user, updateUser } = useAuthStore();
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAppAlert();

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled');

  const handleCancel = (booking: any) => {
    showAlert({ title: 'Cancelar Reserva', message: `Tem certeza que deseja cancelar ${booking.class.name}?`,
      buttons: [{ text: 'Não', style: 'cancel' }, { text: 'Sim, Cancelar', style: 'destructive', onPress: async () => {
        setCancellingId(booking.id);
        try {
          await cancelBooking(booking.id);
          updateUser({ credits: (user?.credits || 0) + 1 });
          showAlert({ title: 'Cancelada', message: 'Reserva cancelada com sucesso. 1 crédito foi estornado.' });
        } catch { showAlert({ title: 'Erro', message: 'Não foi possível cancelar' }); }
        finally { setCancellingId(null); }
      }}] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Minhas Reservas" />
      <ScrollView
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
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : activeBookings.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Ativas</Text>
            {activeBookings.map(b => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                      <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.className}>{b.class.name}</Text>
                      <Text style={styles.instructor}>{b.class.instructor}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>Confirmada</Text></View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}><Ionicons name="calendar-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.date}</Text></View>
                  <View style={styles.detailItem}><Ionicons name="time-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.startTime} • {b.class.duration}min</Text></View>
                  {b.class.studio && <View style={styles.detailItem}><Ionicons name="location-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{b.class.studio.name}</Text></View>}
                  {b.bikeNumber && <View style={styles.detailItem}><Ionicons name="bicycle" size={16} color={colors.primary} /><Text style={[styles.detailText, { color: colors.primary }]}>Bike #{b.bikeNumber}</Text></View>}
                </View>
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(b)} disabled={cancellingId === b.id}>
                  <Text style={styles.cancelText}>{cancellingId === b.id ? 'Cancelando...' : 'Cancelar Reserva'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
            <Text style={styles.emptySubtitle}>Suas reservas agendadas aparecerão aqui</Text>
            <Button title="Ver Agenda" onPress={() => navigation.navigate('AgendaTab')} style={{ marginTop: 32 }} />
          </View>
        )}

        {pastBookings.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Canceladas</Text>
            {pastBookings.map(b => (
              <View key={b.id} style={[styles.bookingCard, { opacity: 0.7 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View>
                      <Text style={[styles.className, { color: colors.textSecondary }]}>{b.class.name}</Text>
                      <Text style={[styles.instructor, { color: colors.textSecondary }]}>{b.class.instructor}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.danger + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.danger }]}>Cancelada</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('BookingHistory')}>
          <Text style={styles.historyLinkText}>Ver Histórico Completo</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};



export default BookingsScreen;

