import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import { useAppAlert } from '../../../shared/components/AlertModal';
import Header from '../../../shared/components/Header';
import Button from '../../../shared/components/Button';
import { theme } from '../../../shared/theme';

const BookingsScreen = ({ navigation }: any) => {
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showAlert } = useAppAlert();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled');

  const handleCancel = (booking: any) => {
    showAlert({
      title: 'Cancelar Reserva',
      message: `Tem certeza que deseja cancelar ${booking.class.name}?`,
      buttons: [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              await cancelBooking(booking.id);
              showAlert({ title: 'Cancelada', message: 'Reserva cancelada com sucesso' });
            } catch {
              showAlert({ title: 'Erro', message: 'Não foi possível cancelar' });
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Reservas" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                      <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.className}>{b.class.name}</Text>
                      <Text style={styles.instructor}>{b.class.instructor}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmada</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{b.class.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{b.class.startTime} • {b.class.duration}min</Text>
                  </View>
                  {b.class.studio && (
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.detailText}>{b.class.studio.name}</Text>
                    </View>
                  )}
                  {b.bikeNumber && (
                    <View style={styles.detailItem}>
                      <Ionicons name="receipt" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailText, { color: theme.colors.primary }]}>Bike #{b.bikeNumber}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(b)}
                  disabled={cancellingId === b.id}
                >
                  <Text style={styles.cancelText}>
                    {cancellingId === b.id ? 'Cancelando...' : 'Cancelar Reserva'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
            <Text style={styles.emptySubtitle}>
              Suas reservas agendadas aparecerão aqui
            </Text>
            <Button
              title="Ver Agenda"
              onPress={() => navigation.navigate('AgendaTab')}
              style={{ marginTop: 32, paddingHorizontal: 40 }}
            />
          </View>
        )}

        {pastBookings.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Canceladas</Text>
            {pastBookings.map(b => (
              <View key={b.id} style={[styles.bookingCard, styles.cancelledCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View>
                      <Text style={[styles.className, { color: theme.colors.textSecondary }]}>{b.class.name}</Text>
                      <Text style={[styles.instructor, { color: theme.colors.textSecondary }]}>{b.class.instructor}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, styles.statusCancelled]}>
                    <Text style={[styles.statusText, { color: theme.colors.danger }]}>Cancelada</Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{b.class.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{b.class.startTime}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.historyLink}
          onPress={() => navigation.navigate('BookingHistory')}
        >
          <Text style={styles.historyLinkText}>Ver Histórico Completo</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.black} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40 },
  loadingText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 40 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cancelledCard: { opacity: 0.7 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  className: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  instructor: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusCancelled: { backgroundColor: theme.colors.danger + '20' },
  statusText: { color: theme.colors.success, fontSize: 12, fontWeight: '600' },
  cardDetails: { marginTop: 14, gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: theme.colors.textSecondary, fontSize: 14 },
  cancelButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  cancelText: { color: theme.colors.danger, fontSize: 15, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
    lineHeight: 22,
  },
  historyLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
  },
  historyLinkText: { color: theme.colors.black, fontSize: 16, fontWeight: '500', marginRight: 4 },
});

export default BookingsScreen;
