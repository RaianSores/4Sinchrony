import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useClassStore } from '../store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import { bookingService } from '../../bookings/services/bookingService';
import { useAppAlert } from '../../../shared/components/AlertModal';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import { theme } from '../../../shared/theme';

const ClassDetailScreen = ({ navigation, route }: any) => {
  const { classId } = route.params;
  const { classes } = useClassStore();
  const { bookings, bookClass, cancelBooking } = useBookingStore();
  const { showAlert } = useAppAlert();
  const classItem = classes.find(c => c.id === classId);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  if (!classItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalhes" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aula não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBikeClass = classItem.type === 'bike';
  const occupancy = Math.round(
    ((classItem.totalSpots - classItem.availableSpots) / classItem.totalSpots) * 100
  );

  const handleBook = async () => {
    if (isBikeClass && !selectedBike) {
      showAlert({ title: 'Selecione uma bike', message: 'Escolha o número da bike antes de reservar' });
      return;
    }

    const conflict = bookingService.checkConflicts(classItem, bookings);
    if (conflict) {
      if (conflict.type === 'duplicate') {
        showAlert({ title: 'Aula já reservada', message: conflict.message });
        return;
      }

      showAlert({
        title: 'Conflito de horário',
        message: `${conflict.message}\n\nDeseja cancelar a aula existente e reservar esta?`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cancelar e Reservar',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              try {
                await cancelBooking(conflict.existingBooking.id);
                await bookClass(classItem.id, isBikeClass ? selectedBike! : undefined);
                showAlert({
                  title: 'Reservado!',
                  message: `Aula ${classItem.name} reservada com sucesso.`,
                  buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
                });
              } catch {
                showAlert({ title: 'Erro', message: 'Não foi possível completar a reserva' });
              } finally {
                setLoading(false);
              }
            },
          },
        ],
      });
      return;
    }

    setLoading(true);
    try {
      await bookClass(classItem.id, isBikeClass ? selectedBike! : undefined);
      showAlert({
        title: 'Reservado!',
        message: `Aula ${classItem.name} reservada com sucesso!`,
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch {
      showAlert({ title: 'Erro', message: 'Não foi possível reservar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Detalhes da Aula" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.instructorRow}>
            <View style={styles.instructorAvatar}>
              <Ionicons name="person" size={32} color={theme.colors.black} />
            </View>
            <View>
              <Text style={styles.instructorName}>{classItem.instructor}</Text>
              <Text style={styles.className}>{classItem.name}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                {classItem.startTime} • {classItem.duration}min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{classItem.date}</Text>
            </View>
          </View>

          {classItem.studio && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                {classItem.studio.name} - {classItem.studio.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vagas Disponíveis</Text>
          <View style={styles.spotsCard}>
            <Text style={styles.spotsValue}>
              {classItem.availableSpots}
              <Text style={styles.spotsTotal}>/{classItem.totalSpots}</Text>
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${occupancy}%` }]} />
            </View>
          </View>
        </View>

        {isBikeClass && classItem.availableSpots > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolha sua Bike</Text>
            <View style={styles.bikeGrid}>
              {Array.from({ length: classItem.totalSpots }, (_, i) => i + 1).map(
                num => {
                  const isOccupied = num > classItem.availableSpots;
                  const isSelected = selectedBike === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.bikeItem,
                        isOccupied && styles.bikeOccupied,
                        isSelected && styles.bikeSelected,
                      ]}
                      onPress={() => !isOccupied && setSelectedBike(num)}
                      disabled={isOccupied}
                    >
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={
                          isOccupied
                            ? theme.colors.border
                            : isSelected
                            ? theme.colors.black
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.bikeNumber,
                          isOccupied && styles.bikeNumberOccupied,
                          isSelected && styles.bikeNumberSelected,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {classItem.availableSpots > 0 ? (
            <Button
              title={
                loading
                  ? 'Reservando...'
                  : isBikeClass && !selectedBike
                  ? 'Selecione uma bike'
                  : 'Reservar Aula'
              }
              onPress={handleBook}
              disabled={loading || (isBikeClass && !selectedBike)}
            />
          ) : (
            <View style={styles.soldOut}>
              <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              <Text style={styles.soldOutText}>Aula lotada</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontSize: 17 },
  headerCard: {
    backgroundColor: theme.colors.card,
    margin: 16,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  instructorName: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  className: { fontSize: 15, color: theme.colors.text, marginTop: 2 },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 8 },
  metaText: { color: theme.colors.textSecondary, fontSize: 14, marginLeft: 6 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  spotsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  spotsValue: { fontSize: 48, fontWeight: '700', color: theme.colors.primary },
  spotsTotal: { fontSize: 24, fontWeight: '400', color: theme.colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
    marginTop: 16,
  },
  progress: { height: '100%', backgroundColor: theme.colors.primary },
  bikeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bikeItem: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  bikeOccupied: { backgroundColor: theme.colors.border, opacity: 0.5 },
  bikeSelected: { backgroundColor: theme.colors.primary },
  bikeNumber: { fontSize: 12, color: theme.colors.primary, marginTop: 2, fontWeight: '600' },
  bikeNumberOccupied: { color: theme.colors.textSecondary },
  bikeNumberSelected: { color: theme.colors.black },
  buttonContainer: { paddingHorizontal: 16, marginTop: 8 },
  soldOut: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  soldOutText: { color: theme.colors.danger, fontSize: 18, fontWeight: '600', marginLeft: 8 },
});

export default ClassDetailScreen;
