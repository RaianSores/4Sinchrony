import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const BookingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { user, updateUser } = useAuthStore();
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showAlert } = useAppAlert();

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

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
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Reservas" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  bookingCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, marginHorizontal: 16, marginVertical: 6, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  className: { fontSize: 17, fontWeight: '600', color: colors.text },
  instructor: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { backgroundColor: colors.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm },
  statusText: { color: colors.success, fontSize: 12, fontWeight: '600' },
  cardDetails: { marginTop: 14, gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: colors.textSecondary, fontSize: 14 },
  cancelButton: { marginTop: 14, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.danger },
  cancelText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 24, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8 },
  historyLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, padding: 12 },
  historyLinkText: { color: colors.primary, fontSize: 16, fontWeight: '500', marginRight: 4 },
});

export default BookingsScreen;
