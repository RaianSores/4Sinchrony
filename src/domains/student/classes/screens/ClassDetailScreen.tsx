import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useClassStore } from '../store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { bookingService } from '../../bookings/services/bookingService';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Button from '../../../../shared/components/Button';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const ClassDetailScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { classId } = route.params;
  const { classes } = useClassStore();
  const { bookings, bookClass, cancelBooking } = useBookingStore();
  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const classItem = classes.find(c => c.id === classId);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  if (!classItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Detalhes" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyState}><Text style={styles.emptyText}>Aula não encontrada</Text></View>
      </SafeAreaView>
    );
  }

  const existingBooking = bookings.find(b => b.class.id === classId && b.status === 'confirmed');
  const isAlreadyBooked = !!existingBooking;
  const effectiveBike = isAlreadyBooked ? (existingBooking?.bikeNumber ?? null) : selectedBike;
  const isBikeClass = classItem.type === 'bike';
  const occupancy = Math.round(((classItem.totalSpots - classItem.availableSpots) / classItem.totalSpots) * 100);
  const hasCredits = (user?.credits || 0) > 0;

  const deductCredit = () => updateUser({ credits: Math.max(0, (user?.credits || 0) - 1) });

  const handleBook = async () => {
    if (isAlreadyBooked) return;
    if (isBikeClass && !effectiveBike) return;
    if (!hasCredits) {
      showAlert({ title: 'Sem créditos', message: 'Você não possui créditos disponíveis.',
        buttons: [{ text: 'Fechar', style: 'cancel' }, { text: 'Ver Planos', onPress: () => navigation.navigate('ProfileTab', { screen: 'Packages' }) }] });
      return;
    }
    const conflict = bookingService.checkConflicts(classItem, bookings);
    if (conflict) {
      if (conflict.type === 'duplicate') { showAlert({ title: 'Aula já reservada', message: conflict.message }); return; }
      showAlert({ title: 'Conflito de horário', message: `${conflict.message}\n\nDeseja cancelar a aula existente e reservar esta?`,
        buttons: [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cancelar e Reservar', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            updateUser({ credits: (user?.credits || 0) + 1 });
            await cancelBooking(conflict.existingBooking.id);
            deductCredit();
            await bookClass(classItem.id, isBikeClass ? effectiveBike! : undefined);
            showAlert({ title: 'Reservado!', message: `Aula ${classItem.name} reservada com sucesso.`, buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
          } catch { showAlert({ title: 'Erro', message: 'Não foi possível completar a reserva' }); }
          finally { setLoading(false); }
        }}] });
      return;
    }
    setLoading(true);
    try {
      deductCredit();
      await bookClass(classItem.id, isBikeClass ? effectiveBike! : undefined);
      showAlert({ title: 'Reservado!', message: `Aula ${classItem.name} reservada com sucesso!`, buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch { showAlert({ title: 'Erro', message: 'Não foi possível reservar' }); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Detalhes da Aula" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.instructorRow}>
            <View style={styles.instructorAvatar}>
              <Ionicons name="person" size={32} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.instructorName}>{classItem.instructor}</Text>
              <Text style={styles.className}>{classItem.name}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.metaText}>{classItem.startTime} • {classItem.duration}min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.metaText}>{classItem.date}</Text>
            </View>
          </View>
          {classItem.studio && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.metaText}>{classItem.studio.name} - {classItem.studio.address}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vagas Disponíveis</Text>
          <View style={styles.spotsCard}>
            <Text style={styles.spotsValue}>{classItem.availableSpots}<Text style={styles.spotsTotal}>/{classItem.totalSpots}</Text></Text>
            <View style={styles.progressBar}><View style={[styles.progress, { width: `${occupancy}%` }]} /></View>
          </View>
        </View>

        {isBikeClass && (classItem.availableSpots > 0 || isAlreadyBooked) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isAlreadyBooked ? 'Sua Bike' : 'Escolha sua Bike'}</Text>
            <View style={styles.bikeGrid}>
              {Array.from({ length: classItem.totalSpots }, (_, i) => i + 1).map(num => {
                const isOccupied = !isAlreadyBooked && num > classItem.availableSpots;
                const isSelected = effectiveBike === num;
                return (
                  <TouchableOpacity key={num}
                    style={[styles.bikeItem, isOccupied && styles.bikeOccupied, isSelected && styles.bikeSelected]}
                    onPress={() => !isAlreadyBooked && !isOccupied && setSelectedBike(num)}
                    disabled={isAlreadyBooked || isOccupied}>
                    <Ionicons name="bicycle" size={24} color={isOccupied ? colors.border : isSelected ? colors.white : colors.primary} />
                    <Text style={[styles.bikeNumber, isOccupied && styles.bikeNumberOccupied, isSelected && styles.bikeNumberSelected]}>{num}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isAlreadyBooked && (
            <View style={styles.creditsBar}>
              <Ionicons name="flash" size={18} color={colors.primary} />
              <Text style={styles.creditsText}>{hasCredits ? `${user?.credits} crédito${user?.credits !== 1 ? 's' : ''} disponível(is)` : 'Sem créditos disponíveis'}</Text>
            </View>
          )}
          {isAlreadyBooked && existingBooking ? (
            <View style={styles.bookedInfo}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <View>
                <Text style={styles.bookedTitle}>Você está inscrito</Text>
                {existingBooking.bikeNumber && <Text style={styles.bookedDetail}>Bike {existingBooking.bikeNumber}</Text>}
              </View>
            </View>
          ) : classItem.availableSpots > 0 ? (
            <Button title={loading ? 'Reservando...' : isBikeClass && !effectiveBike ? 'Selecione uma bike' : 'Reservar Aula'}
              onPress={handleBook} disabled={loading || (isBikeClass && !effectiveBike)} variant="primary" />
          ) : (
            <View style={styles.soldOut}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
              <Text style={styles.soldOutText}>Aula lotada</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 17 },
  headerCard: { backgroundColor: colors.card, margin: 16, borderRadius: borderRadius.xl, padding: 20, borderWidth: 1, borderColor: colors.border },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  instructorAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  instructorName: { fontSize: 18, fontWeight: '700', color: colors.text },
  className: { fontSize: 15, color: colors.secondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 8 },
  metaText: { color: colors.textSecondary, fontSize: 14, marginLeft: 6 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  spotsCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  spotsValue: { fontSize: 48, fontWeight: '700', color: colors.primary },
  spotsTotal: { fontSize: 24, fontWeight: '400', color: colors.textSecondary },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', width: '100%', marginTop: 16 },
  progress: { height: '100%', backgroundColor: colors.primary },
  bikeGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 12, borderWidth: 1, borderColor: colors.border },
  bikeItem: { width: '20%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', margin: 4, borderRadius: borderRadius.md, backgroundColor: colors.background },
  bikeOccupied: { backgroundColor: colors.border, opacity: 0.5 },
  bikeSelected: { backgroundColor: colors.primary },
  bikeNumber: { fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '600' },
  bikeNumberOccupied: { color: colors.textSecondary },
  bikeNumberSelected: { color: colors.white },
  buttonContainer: { paddingHorizontal: 16, marginTop: 8 },
  creditsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12, paddingVertical: 8, backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  creditsText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  bookedInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.success, gap: 12 },
  bookedTitle: { fontSize: 17, fontWeight: '600', color: colors.success },
  bookedDetail: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  soldOut: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20 },
  soldOutText: { color: colors.danger, fontSize: 18, fontWeight: '600', marginLeft: 8 },
});

export default ClassDetailScreen;
