import React, { useState, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useClassStore } from '../../classes/store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import { useProgressStore } from '../../profile/store/useProgressStore';
import StatCard from '../../../../shared/components/StatCard';
import ClassCard from '../../../../shared/components/ClassCard';
import ClassCardSkeleton from '../../../../shared/components/ClassCardSkeleton';
import Skeleton from '../../../../shared/components/Skeleton';
import { Avatar } from '../../../../shared/components/Avatar';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './HomeScreen.styles';
import type { HomeScreenProps } from '../../../../core/navigation/types/screenProps';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user } = useAuthStore();
  const { classes, fetchClasses, isLoading: classesLoading } = useClassStore();
  const { bookings, fetchBookings, isLoading: bookingsLoading } = useBookingStore();
  const { progress, fetchProgress, isLoading: progressLoading } = useProgressStore();
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  const initialLoading = progress === null && (classesLoading || bookingsLoading || progressLoading);

  const firstName = user?.name?.split(' ')[0] || 'Aluno';

  useFocusEffect(useCallback(() => {
    mountedRef.current = true;
    fetchClasses();
    fetchBookings();
    fetchProgress();
    return () => { mountedRef.current = false; };
  }, [fetchClasses, fetchBookings, fetchProgress]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchClasses(), fetchBookings(), fetchProgress()]);
    if (mountedRef.current) setRefreshing(false);
  }, [fetchClasses, fetchBookings, fetchProgress]);

  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Uma aula cancelada com data/horário futuro passava só pela checagem de data/hora e
  // acabava aparecendo em "Próxima Aula" — a checagem de status também é necessária.
  const isUpcoming = (c: { date: string; startTime: string; status?: string }) =>
    (c.date > todayStr || (c.date === todayStr && c.startTime > currentTimeStr)) &&
    c.status !== 'cancelled' && c.status !== 'completed';

  const nextClass = classes.find(isUpcoming) ?? null;

  // O objeto `class` embutido em cada reserva (`b.class`, vindo de `GET /bookings`) nem
  // sempre carrega o `status` real da aula — por isso cruzamos com a lista de aulas buscada
  // à parte (`classes`, de `GET /classes`, já confirmada confiável) pra decidir se a aula já
  // aconteceu. Sem isso, uma reserva pra uma aula já encerrada mais cedo (mas com horário
  // agendado ainda no futuro, ex: aula marcada pras 22:00 encerrada às 12:10) continuava
  // aparecendo em "Próximas Aulas" pra sempre.
  const classesById = new Map(classes.map(c => [c.id, c]));
  const getRealClass = (b: (typeof bookings)[number]) => classesById.get(b.class.id) ?? b.class;

  // "confirmed" sozinho não basta: uma reserva fica "confirmed" pra sempre se o professor
  // encerrar a aula sem marcar presença/ausência de ninguém — sem checar a data/hora da
  // aula, ela continuaria aparecendo aqui mesmo depois de já ter acontecido.
  const activeBookings = bookings.filter(b => b.status === 'confirmed' && isUpcoming(getRealClass(b)));

  // `progress.classesAttended`/`streakWeeks` (GET /profile/progress) ficam travados em
  // 0/desatualizados pela mesma causa raiz documentada em
  // docs/DEMANDA_PROGRESSO_ALUNO_NAO_ATUALIZA_BACKEND.md — o aluno não tem acesso a um
  // endpoint de check-in real (diferente do admin, que cruza com GET /api/checkin) pra
  // calcular isso com precisão. Como aproximação melhor que mostrar 0, contamos reservas não
  // canceladas de aulas cujo status real já é "completed" — não distingue um "no_show" de
  // presença real (essa distinção também está travada no backend, ver
  // DEMANDA_CHECKIN_ATTENDANCE_BACKEND.md), mas é muito mais próximo da realidade do que
  // confiar no agregado quebrado do backend.
  const attendedBookings = bookings.filter(b => b.status !== 'cancelled' && getRealClass(b).status === 'completed');
  const totalAttended = attendedBookings.length;

  // Streak: conta semanas consecutivas (bucket de 7 dias a partir de uma âncora fixa) com
  // pelo menos uma aula "atendida" (mesma aproximação acima), voltando a partir da semana
  // mais recente com aula — não quebra o streak só porque a semana atual ainda não teve aula.
  const weekKey = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const days = Math.floor((new Date(y, (m || 1) - 1, d || 1).getTime() - new Date(2020, 0, 1).getTime()) / 86400000);
    return Math.floor(days / 7);
  };
  const attendedWeeks = new Set(attendedBookings.map(b => weekKey(getRealClass(b).date)));
  const streakWeeks = (() => {
    let week = weekKey(todayStr);
    if (!attendedWeeks.has(week)) week -= 1;
    let streak = 0;
    while (attendedWeeks.has(week)) {
      streak += 1;
      week -= 1;
    }
    return streak;
  })();

  // Meta dinâmica por marcos de 10 em vez de um alvo fixo (a API tem um `classesGoal`
  // fixo, mas 50 não faz sentido pra quem já fez muito mais aulas que isso no ano).
  // Sempre mostra progresso em direção ao próximo marco, nunca trava em 100%.
  const targetClasses = Math.ceil((totalAttended + 1) / 10) * 10;
  const remainingToMilestone = targetClasses - totalAttended;
  const progressPct = Math.round((totalAttended / targetClasses) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Enterprise header: greeting + avatar */}
      <View style={styles.enterpriseHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>{timeGreeting()},</Text>
          <Text style={styles.headerName}>{firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Profile' })}
          activeOpacity={0.8}
        >
          <Avatar uri={user?.avatar} name={user?.name || 'A'} size="md" />
        </TouchableOpacity>
      </View>

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
            {...({ backgroundColor: colors.background } as any)}
          />
        }
      >
        {initialLoading ? (
          <>
            <View style={styles.statsContainer}>
              <Skeleton height={84} borderRadius={16} style={{ flex: 1 }} />
              <Skeleton height={84} borderRadius={16} style={{ flex: 1 }} />
              <Skeleton height={84} borderRadius={16} style={{ flex: 1 }} />
            </View>
            <View style={styles.section}>
              <Skeleton width={140} height={18} style={{ marginHorizontal: 16, marginBottom: 12 }} />
              <ClassCardSkeleton />
            </View>
          </>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <StatCard title="Aulas Realizadas" value={totalAttended} />
              <StatCard title="Reservas" value={activeBookings.length} />
              <StatCard title="Streak" value={streakWeeks} subtitle="semanas" />
            </View>

            <TouchableOpacity
              style={styles.creditsBanner}
              onPress={() => navigation.navigate('ProfileTab', { screen: 'MyPurchases' })}
            >
              <Ionicons name="flash" size={22} color={colors.primary} />
              <Text style={styles.creditsBannerText}>
                {(user?.credits ?? 0) > 0
                  ? `${user?.credits} crédito${user?.credits !== 1 ? 's' : ''} disponível(is)`
                  : 'Sem créditos — Adquira um plano'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {activeBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximas Aulas</Text>
                {activeBookings.slice(0, 2).map(b => {
                  const liveClass = classes.find(c => c.id === b.class.id);
                  const spots = liveClass?.availableSpots ?? b.class.availableSpots;
                  return (
                    <ClassCard
                      key={b.id}
                      enrolled
                      instructor={b.class.instructor}
                        instructorAvatar={b.class.instructorAvatar}
                        className={b.class.name}
                        time={b.class.startTime}
                        duration={b.class.duration}
                        studio={b.class.studio?.name || ''}
                        availableSpots={spots}
                        totalSpots={b.class.totalSpots}
                        onPress={() => navigation.navigate('ClassDetail', { classId: b.class.id })}
                      />
                  );
                })}
              </View>
            )}

            {nextClass && activeBookings.length === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próxima Aula</Text>
                <ClassCard
                  instructor={nextClass.instructor}
                  instructorAvatar={nextClass.instructorAvatar}
                  className={nextClass.name}
                  time={nextClass.startTime}
                  duration={nextClass.duration}
                  studio={nextClass.studio?.name || ''}
                  availableSpots={nextClass.availableSpots}
                  totalSpots={nextClass.totalSpots}
                  onPress={() => navigation.navigate('ClassDetail', { classId: nextClass.id })}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minha Jornada 2026</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>{totalAttended} / {targetClasses} aulas</Text>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressSubtext}>
                  Faltam {remainingToMilestone} aula{remainingToMilestone !== 1 ? 's' : ''} para o próximo marco
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AgendaTab')}>
            <Ionicons name="calendar" size={24} color={colors.text} />
            <Text style={styles.actionText}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProfileTab', { screen: 'Packages' })}>
            <Ionicons name="pricetags" size={24} color={colors.text} />
            <Text style={styles.actionText}>Planos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
