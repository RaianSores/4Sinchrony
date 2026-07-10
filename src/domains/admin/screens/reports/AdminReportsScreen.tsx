import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { reportAdminService, ReportSummary, ReportPeriod } from '../../services/reportAdminService';
import { classAdminService, AdminClass } from '../../services/classAdminService';
import { bookingAdminService, AdminBooking } from '../../services/bookingAdminService';
import { checkinAdminService, AdminCheckinRecord } from '../../services/checkinAdminService';
import { isoDateToBR } from '../../../../shared/utils/formatDate';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './AdminReportsScreen.styles';

const PERIOD_OPTIONS: { label: string; period: ReportPeriod; days: number }[] = [
  { label: '7 dias', period: 'week', days: 7 },
  { label: '30 dias', period: 'month', days: 30 },
  { label: '90 dias', period: 'quarter', days: 90 },
  { label: 'Este ano', period: 'year', days: 365 },
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface OccupancyRow {
  date: string;
  className: string;
  totalSpots: number;
  booked: number;
  attended: number;
  occupancyPercent: number;
}

interface FrequencyRow {
  day: string;
  count: number;
}

const getOccupancyColor = (percent: number) => {
  if (percent >= 80) return '#FF453A';
  if (percent >= 50) return '#F59E0B';
  return '#22C55E';
};

// Ocupação, Frequência e a Taxa de Check-in são calculadas aqui no cliente, a partir de
// aulas/reservas/check-ins reais — não usamos mais `reportAdminService.getOccupancy()`/
// `getFrequencyByDay()`, e o card "Taxa de Check-in" não usa mais `summary.checkinRate`,
// porque os três voltaram dados incompletos/incorretos em teste ao vivo em 10/07/2026 (ver
// docs/DEMANDA_RELATORIOS_OCUPACAO_FREQUENCIA_INCORRETOS_BACKEND.md): frequência só retornava
// 2 dos 7 dias (ambos zerados mesmo com reserva real confirmada), ocupação mostrava
// `attended:0` pra uma aula com check-in já confirmado como "attended", e `checkinRate`
// voltava 0% na mesma situação. Os outros 3 cards do resumo (Alunos Ativos, Aulas no Período,
// Ocupação Média) continuam vindo do backend normalmente — não foi reportado problema neles.
export function buildOccupancy(classes: AdminClass[], bookings: AdminBooking[], checkins: AdminCheckinRecord[], days: number): OccupancyRow[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const attendedBookingIds = new Set(
    checkins.filter(c => c.status === 'attended').map(c => c.bookingId)
  );

  return classes
    .filter(c => c.date >= cutoffStr && c.status !== 'cancelled')
    .map(c => {
      const activeBookings = bookings.filter(b => b.classId === c.id && b.status !== 'cancelled');
      const booked = activeBookings.length;
      const attended = activeBookings.filter(b => attendedBookingIds.has(b.id)).length;
      const occupancyPercent = c.totalSpots > 0 ? Math.round((booked / c.totalSpots) * 100) : 0;
      return { date: c.date, className: c.name, totalSpots: c.totalSpots, booked, attended, occupancyPercent };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

// `summary.checkinRate` (`GET /api/reports/summary`) também confirmado incorreto ao vivo em
// 10/07/2026: voltava 0% mesmo com reserva confirmada + check-in real já marcado como
// "attended". Calculado aqui a partir das mesmas reservas/check-ins reais usados em Ocupação.
export function buildCheckinRate(bookings: AdminBooking[], checkins: AdminCheckinRecord[]): number {
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  if (activeBookings.length === 0) return 0;

  const attendedBookingIds = new Set(
    checkins.filter(c => c.status === 'attended').map(c => c.bookingId)
  );
  const attendedCount = activeBookings.filter(b => attendedBookingIds.has(b.id)).length;
  return Math.round((attendedCount / activeBookings.length) * 100);
}

export function buildFrequency(classes: AdminClass[], bookings: AdminBooking[]): FrequencyRow[] {
  const counts = new Array(7).fill(0);
  const classesById = new Map<string, AdminClass>(classes.map(c => [c.id, c]));

  bookings
    .filter(b => b.status !== 'cancelled')
    .forEach(b => {
      const cls = classesById.get(b.classId);
      if (!cls) return;
      const [y, m, d] = cls.date.split('-').map(Number);
      const weekday = new Date(y, m - 1, d).getDay();
      counts[weekday] += 1;
    });

  return WEEKDAY_LABELS.map((day, index) => ({ day, count: counts[index] }));
}

// O seletor de período fica na tela igual ao ERP, mas hoje nenhum dos dois filtra os dados de
// verdade — testado ao vivo, ver docs/DEMANDA_RELATORIOS_PERIODO_IGNORADO_BACKEND.md. Mantido
// pronto pra funcionar assim que o backend implementar o filtro. O período ainda filtra a
// tabela de Ocupação (calculada no cliente pela data real da aula).
const AdminReportsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [periodIndex, setPeriodIndex] = useState(1);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [checkins, setCheckins] = useState<AdminCheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (index: number) => {
    const opt = PERIOD_OPTIONS[index];
    try {
      const [summaryData, classesData, bookingsData, checkinsData] = await Promise.all([
        reportAdminService.getSummary(opt.period),
        classAdminService.list(),
        bookingAdminService.list(),
        checkinAdminService.listAll(),
      ]);
      setSummary(summaryData);
      setClasses(classesData);
      setBookings(bookingsData);
      setCheckins(checkinsData);
    } catch (error) {
      captureError(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(periodIndex).finally(() => setLoading(false));
  }, [load, periodIndex]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(periodIndex);
    setRefreshing(false);
  }, [load, periodIndex]);

  const occupancy = useMemo(
    () => buildOccupancy(classes, bookings, checkins, PERIOD_OPTIONS[periodIndex].days),
    [classes, bookings, checkins, periodIndex]
  );
  const frequency = useMemo(() => buildFrequency(classes, bookings), [classes, bookings]);
  const checkinRate = useMemo(() => buildCheckinRate(bookings, checkins), [bookings, checkins]);
  const maxFrequency = Math.max(...frequency.map(f => f.count), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Relatórios</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
        >
          <View style={styles.filterRow}>
            {PERIOD_OPTIONS.map((opt, index) => (
              <TouchableOpacity
                key={opt.period}
                style={[styles.filterChip, periodIndex === index && styles.filterChipActive]}
                onPress={() => setPeriodIndex(index)}
              >
                <Text style={[styles.filterChipText, periodIndex === index && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {summary && (
            <>
              <View style={styles.cardsRow}>
                <View style={[styles.metricCard, { borderLeftColor: colors.success }]}>
                  <Text style={styles.metricValue}>{summary.activeStudents}</Text>
                  <Text style={styles.metricLabel}>Alunos Ativos</Text>
                  <Text style={styles.metricSubtitle}>{summary.totalStudents} no total</Text>
                </View>
                <View style={[styles.metricCard, { borderLeftColor: colors.primaryDark }]}>
                  <Text style={styles.metricValue}>{summary.totalClasses}</Text>
                  <Text style={styles.metricLabel}>Aulas no Período</Text>
                  <Text style={styles.metricSubtitle}>{summary.totalBookings} reservas</Text>
                </View>
              </View>
              <View style={styles.cardsRow}>
                <View style={[styles.metricCard, { borderLeftColor: colors.primary }]}>
                  <Text style={styles.metricValue}>{summary.occupancyRate}%</Text>
                  <Text style={styles.metricLabel}>Ocupação Média</Text>
                </View>
                <View style={[styles.metricCard, { borderLeftColor: colors.warning }]}>
                  <Text style={styles.metricValue}>{checkinRate}%</Text>
                  <Text style={styles.metricLabel}>Taxa de Check-in</Text>
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Ocupação por Aula</Text>
          {occupancy.length === 0 ? (
            <View style={styles.chartEmptyState}>
              <Ionicons name="bar-chart-outline" size={28} color={colors.textSecondary} />
              <Text style={styles.chartEmptyText}>Nenhum dado disponível para o período selecionado</Text>
            </View>
          ) : (
            occupancy.map((item, index) => {
              const color = getOccupancyColor(item.occupancyPercent);
              return (
                <View key={index} style={styles.occupancyRow}>
                  <View style={styles.occupancyTop}>
                    <Text style={styles.occupancyClassName} numberOfLines={1}>{item.className}</Text>
                    <View style={[styles.occupancyBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.occupancyBadgeText, { color }]}>{item.occupancyPercent}%</Text>
                    </View>
                  </View>
                  <Text style={styles.occupancyDetail}>
                    {isoDateToBR(item.date)} · {item.booked}/{item.totalSpots} reservas · {item.attended} presentes
                  </Text>
                </View>
              );
            })
          )}

          <Text style={styles.sectionTitle}>Frequência por Dia da Semana</Text>
          <View style={styles.barChart}>
            {frequency.map((item, index) => (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>{item.count}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height: Math.max((item.count / maxFrequency) * 80, 4) }]} />
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AdminReportsScreen;
