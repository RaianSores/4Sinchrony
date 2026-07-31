import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useClassStore } from '../store/useClassStore';
import { classService } from '../services/classService';
import type { Class } from '../../../../shared/types';
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
import { dependentService, Dependent } from '../../plan/services/dependentService';

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
  const classFromStore = classes.find(c => c.id === classId);
  // O store de classes é compartilhado com a Agenda e pode estar filtrado por uma data
  // diferente da aula navegada aqui (ex: veio de "Próximas Aulas" na Home enquanto a Agenda
  // deixou um filtro de outra data no store) — nesse caso buscamos a aula diretamente pelo
  // id em vez de mostrar "Aula não encontrada" sem tentar.
  const [fallbackClass, setFallbackClass] = useState<Class | null>(null);
  const [fallbackNotFound, setFallbackNotFound] = useState(false);
  const classItem = classFromStore ?? fallbackClass ?? undefined;
  const [selectedBike, setSelectedBike] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [bikeStatuses, setBikeStatuses] = useState<{ number: number; status: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // Pacote família: o titular pode reservar em nome de um dependente (que é um Student com
  // canBook). `bookingFor` = studentId do dependente escolhido, ou null = o próprio titular.
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [bookingFor, setBookingFor] = useState<string | null>(null);

  useEffect(() => {
    if (!classFromStore && !fallbackClass && !fallbackNotFound) {
      classService.getClassById(classId).then((c) => {
        if (c) setFallbackClass(c);
        else setFallbackNotFound(true);
      });
    }
  }, [classId, classFromStore, fallbackClass, fallbackNotFound]);

  useEffect(() => {
    if (resolveIsBikeClass(classItem)) {
      bookingService.getBikesForClass(classId).then(setBikeStatuses).catch((error) => { captureError(error); });
    }
  }, [classId, classItem]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Carrega os dependentes que o titular pode reservar (ativos + canBook). Silencioso: se o
  // aluno não tem pacote família, a API responde lista vazia e o seletor simplesmente não aparece.
  useEffect(() => {
    dependentService.list()
      .then(list => setDependents(list.filter(d => d.active && d.canBook)))
      .catch(() => { /* sem dependentes/família — segue como reserva normal do titular */ });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (resolveIsBikeClass(classItem)) {
      await bookingService.getBikesForClass(classId).then(setBikeStatuses).catch((error) => { captureError(error); });
    }
    setRefreshing(false);
  }, [classId, classItem]);

  if (!classItem) {
    if (!fallbackNotFound) {
      return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <Header title="Detalhes" showBack onBackPress={() => navigation.goBack()} />
          <View style={styles.emptyState}><Text style={styles.emptyText}>Carregando...</Text></View>
        </SafeAreaView>
      );
    }
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

  // A lista (ClassesScreen) já filtra aulas cujo horário passou, mas essa tela pode ter sido
  // aberta antes do horário passar e só ser usada depois (ex: app em segundo plano) — sem essa
  // checagem, o botão "Reservar" continuava disponível e só falhava com um 409 genérico do
  // backend na hora de enviar, sem explicar o motivo pro aluno.
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let hasClassStarted = classItem.date < todayStr;
  if (!hasClassStarted && classItem.date === todayStr && typeof classItem.startTime === 'string' && classItem.startTime.length >= 5) {
    const h = parseInt(classItem.startTime.slice(0, 2), 10);
    const min = parseInt(classItem.startTime.slice(3, 5), 10);
    if (!isNaN(h) && !isNaN(min)) {
      hasClassStarted = (h * 60 + min) < (now.getHours() * 60 + now.getMinutes());
    }
  }
  // Uma aula cancelada com data futura passa pela checagem de horário acima sem problema
  // (ainda não "começou"), mas continua indisponível pra reserva — precisa da própria checagem.
  const isCancelled = classItem.status === 'cancelled';

  const deductCredit = () => updateUser({ credits: Math.max(0, (user?.credits || 0) - 1) });

  const handleBook = async () => {
    if (isAlreadyBooked) return;
    if (isCancelled) {
      showAlert({ title: 'Aula indisponível', message: 'Essa aula foi cancelada.' });
      return;
    }
    if (hasClassStarted) {
      showAlert({ title: 'Aula indisponível', message: 'Essa aula já começou ou já foi encerrada.' });
      return;
    }
    if (isBikeClass && !effectiveBike) return;
    // Reserva em nome de um dependente: o backend valida `canBook` e debita da alocação dele
    // dentro do pacote do responsável. As checagens abaixo (créditos/limite/conflito) são do
    // titular, então não se aplicam — deixamos o backend validar a alocação do dependente.
    if (bookingFor) {
      const dep = dependents.find(d => d.id === bookingFor);
      // `studentId` no POST /bookings é o studentId REAL do dependente (`userId`), não o id do
      // registro de dependente (`bookingFor`/`dep.id`). Fallback pro id antigo se `userId` faltar.
      const dependentStudentId = dep?.userId ?? bookingFor;
      setLoading(true);
      try {
        await bookClass(classItem.id, isBikeClass ? effectiveBike! : undefined, dependentStudentId);
        showAlert({ title: 'Reservado!', message: `Aula ${classItem.name} reservada para ${dep?.name ?? 'o dependente'}.`, buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
      } catch (error) {
        captureError(error);
        await Promise.all([fetchClasses(), fetchBookings()]);
        showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível reservar para o dependente') });
      } finally { setLoading(false); }
      return;
    }
    if (!hasCredits) {
      showAlert({ title: 'Sem créditos', message: 'Você não possui créditos disponíveis.',
        buttons: [{ text: 'Fechar', style: 'cancel' }, { text: 'Ver Planos', onPress: () => navigation.navigate('ProfileTab', { screen: 'Packages' }) }] });
      return;
    }
    // O limite de reservas (maxFutureBookings/maxBookingsPerDay…) agora é per-pacote e validado
    // pelo backend, que devolve a mensagem exata (surfaçada no catch abaixo). Removida a trava
    // client-side antiga (`user.maxBookings ?? 5`), que contava reservas passadas e usava um teto
    // fixo — bloqueava por engano quem tinha muitas aulas no histórico.
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

        {dependents.length > 0 && !isAlreadyBooked && !isCancelled && !hasClassStarted && classItem.availableSpots > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reservar para</Text>
            <View style={styles.bookForRow}>
              <TouchableOpacity style={[styles.bookForChip, !bookingFor && styles.bookForChipActive]} onPress={() => setBookingFor(null)}>
                <Ionicons name="person" size={16} color={!bookingFor ? colors.primary : colors.textSecondary} />
                <Text style={[styles.bookForChipText, !bookingFor && styles.bookForChipTextActive]}>Você</Text>
              </TouchableOpacity>
              {dependents.map(dep => {
                const active = bookingFor === dep.id;
                return (
                  <TouchableOpacity key={dep.id} style={[styles.bookForChip, active && styles.bookForChipActive]} onPress={() => setBookingFor(dep.id)}>
                    <Ionicons name="people" size={16} color={active ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.bookForChipText, active && styles.bookForChipTextActive]}>{dep.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {bookingFor ? (
              <Text style={styles.bookForHint}>Usa os créditos do pacote família e aparece na frequência do dependente.</Text>
            ) : null}
          </View>
        )}

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
          {!isAlreadyBooked && !bookingFor && (
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
          ) : isCancelled ? (
            <View style={styles.soldOut}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
              <Text style={styles.soldOutText}>Essa aula foi cancelada</Text>
            </View>
          ) : hasClassStarted ? (
            <View style={styles.soldOut}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
              <Text style={styles.soldOutText}>Essa aula já ocorreu</Text>
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

