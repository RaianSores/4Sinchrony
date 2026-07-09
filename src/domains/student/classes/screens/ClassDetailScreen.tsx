import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useClassStore } from '../store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { bookingService } from '../../bookings/services/bookingService';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Button from '../../../../shared/components/Button';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './ClassDetailScreen.styles';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import type { ClassDetailScreenProps } from '../../../../core/navigation/types/screenProps';
import { captureError } from '../../../../lib/sentry';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';

// `usesBikes` (vindo do ClassType via backend) é a fonte de verdade quando presente.
// Fallback para o nome do tipo só existe pra manter compatibilidade até o backend
// implementar o campo — ver DEMANDA_CLASSTYPE_BIKE_FLAG_BACKEND.md.
const resolveIsBikeClass = (c?: { usesBikes?: boolean; type?: string }) =>
  typeof c?.usesBikes === 'boolean' ? c.usesBikes : c?.type?.toLowerCase() === 'bike';

const ClassDetailScreen = ({ navigation, route }: ClassDetailScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const tabPadding = useTabBarBottomPadding();
  const { classId } = route.params;
  const { classes, fetchClasses } = useClassStore();
  const { bookings, bookClass, cancelBooking, fetchBookings } = useBookingStore();
  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const classItem = classes.find(c => c.id === classId);
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [bikeStatuses, setBikeStatuses] = useState<{ number: number; status: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (resolveIsBikeClass(classItem)) {
      bookingService.getBikesForClass(classId).then(setBikeStatuses).catch((error) => { captureError(error); });
    }
  }, [classId, classItem]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (resolveIsBikeClass(classItem)) {
      await bookingService.getBikesForClass(classId).then(setBikeStatuses).catch((error) => { captureError(error); });
    }
    setRefreshing(false);
  }, [classId, classItem]);

  if (!classItem) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header title="Detalhes" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyState}><Text style={styles.emptyText}>Aula não encontrada</Text></View>
      </SafeAreaView>
    );
  }

  const existingBooking = bookings.find(b => b.class.id === classId && b.status === 'confirmed');
  const isAlreadyBooked = !!existingBooking;
  const effectiveBike = isAlreadyBooked ? (existingBooking?.bikeNumber ?? null) : selectedBike;
  const isBikeClass = resolveIsBikeClass(classItem);
  const occupancy = Math.round(((classItem.totalSpots - classItem.availableSpots) / classItem.totalSpots) * 100);
  const hasCredits = (user?.credits || 0) > 0;

  const deductCredit = () => updateUser({ credits: Math.max(0, (user?.credits || 0) - 1) });
  const refundCredit = () => updateUser({ credits: (user?.credits || 0) + 1 });

  const handleBook = async () => {
    if (isAlreadyBooked) return;
    if (isBikeClass && !effectiveBike) return;
    if (!hasCredits) {
      showAlert({ title: 'Sem créditos', message: 'Você não possui créditos disponíveis.',
        buttons: [{ text: 'Fechar', style: 'cancel' }, { text: 'Ver Planos', onPress: () => navigation.navigate('ProfileTab', { screen: 'Packages' }) }] });
      return;
    }
    const activeBookingCount = bookings.filter(b => b.status === 'confirmed').length;
    const maxBookings = user?.maxBookings ?? 5;
    if (activeBookingCount >= maxBookings) {
      showAlert({ title: 'Limite de reservas', message: `Você atingiu o limite de ${maxBookings} reservas ativas. Cancele uma reserva existente para fazer uma nova.`,
        buttons: [{ text: 'Fechar', style: 'cancel' }] });
      return;
    }
    const conflict = bookingService.checkConflicts(classItem, bookings);
    if (conflict) {
      if (conflict.type === 'duplicate') { showAlert({ title: 'Aula já reservada', message: conflict.message }); return; }
      showAlert({ title: 'Conflito de horário', message: `${conflict.message}\n\nDeseja cancelar a aula existente e reservar esta?`,
        buttons: [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cancelar e Reservar', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await cancelBooking(conflict.existingBooking.id);
            await bookClass(classItem.id, isBikeClass ? effectiveBike! : undefined);
            deductCredit();
            showAlert({ title: 'Reservado!', message: `Aula ${classItem.name} reservada com sucesso.`, buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
          } catch (error) {
            captureError(error);
            await Promise.all([fetchClasses(), fetchBookings()]);
            showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível completar a reserva') });
          }
          finally { setLoading(false); }
        }}] });
      return;
    }
    setLoading(true);
    try {
      await bookClass(classItem.id, isBikeClass ? effectiveBike! : undefined);
      deductCredit();
      showAlert({ title: 'Reservado!', message: `Aula ${classItem.name} reservada com sucesso!`, buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      captureError(error);
      await Promise.all([fetchClasses(), fetchBookings()]);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível reservar') });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Detalhes da Aula" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
              <Text style={styles.metaText}>{classItem.startTime} - {classItem.duration}min</Text>
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
              {(bikeStatuses.length > 0
                ? bikeStatuses
                : Array.from({ length: classItem.totalSpots }, (_, i) => ({ number: i + 1, status: 'available' }))
              ).map(bike => {
                const isUnavailable = !isAlreadyBooked && (bike.status === 'occupied' || bike.status === 'broken');
                const isSelected = effectiveBike === bike.number;
                return (
                  <TouchableOpacity key={bike.number}
                    style={[styles.bikeItem, isUnavailable && styles.bikeOccupied, isSelected && styles.bikeSelected]}
                    onPress={() => !isAlreadyBooked && !isUnavailable && setSelectedBike(bike.number)}
                    disabled={isAlreadyBooked || isUnavailable}>
                    <Ionicons name="bicycle" size={24} color={isUnavailable ? colors.border : isSelected ? colors.white : colors.primary} />
                    <Text style={[styles.bikeNumber, isUnavailable && styles.bikeNumberOccupied, isSelected && styles.bikeNumberSelected]}>{bike.number}</Text>
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



export default ClassDetailScreen;

