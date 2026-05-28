import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useTeacherMetricsStore } from '../stores/useTeacherMetricsStore';

const MetricsScreen = ({ navigation }: any) => {
  const { metrics, isLoading, fetchMetrics } = useTeacherMetricsStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Métricas</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading || !metrics ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando métricas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardsRow}>
            <View style={[styles.metricCard, { borderLeftColor: theme.colors.primaryDark }]}>
              <Text style={styles.metricValue}>{metrics.totalClassesThisMonth}</Text>
              <Text style={styles.metricLabel}>Aulas no mês</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: theme.colors.success }]}>
              <Text style={styles.metricValue}>{metrics.totalStudentsAttended}</Text>
              <Text style={styles.metricLabel}>Alunos atendidos</Text>
            </View>
          </View>

          <View style={styles.cardsRow}>
            <View style={[styles.metricCard, { borderLeftColor: theme.colors.primary }]}>
              <Text style={styles.metricValue}>{metrics.uniqueStudents}</Text>
              <Text style={styles.metricLabel}>Alunos únicos</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: theme.colors.success }]}>
              <Text style={styles.metricValue}>{metrics.averageOccupancyRate}%</Text>
              <Text style={styles.metricLabel}>Taxa de ocupação</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Aulas por Semana</Text>
          <View style={styles.barChart}>
            {metrics.classesByWeek.map((week, index) => (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barValue}>{week.count}</Text>
                <View style={[styles.bar, { height: week.count * 6 }]} />
                <Text style={styles.barLabel}>{week.week}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Taxa de Ocupação</Text>
          <View style={styles.occupancyChart}>
            {metrics.occupancyTrend.map((day, index) => (
              <View key={index} style={styles.occupancyBarContainer}>
                <Text style={styles.occupancyValue}>{day.rate}%</Text>
                <View style={[styles.occupancyBar, { height: day.rate * 1.5 }]} />
                <Text style={styles.occupancyLabel}>{day.date}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primaryDark} />
            <Text style={styles.infoText}>
              Check-in rate: {metrics.averageCheckinRate}% — {metrics.averageOccupancyRate}% de ocupação média
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: theme.colors.textSecondary },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  metricValue: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  metricLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    height: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  barContainer: { alignItems: 'center', gap: 4 },
  barValue: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  bar: { width: 24, backgroundColor: theme.colors.primaryDark, borderRadius: 4 },
  barLabel: { fontSize: 10, color: theme.colors.textSecondary },
  occupancyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    height: 140,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  occupancyBarContainer: { alignItems: 'center', gap: 4 },
  occupancyValue: { fontSize: 11, fontWeight: '600', color: theme.colors.text },
  occupancyBar: { width: 20, backgroundColor: theme.colors.primary, borderRadius: 4 },
  occupancyLabel: { fontSize: 10, color: theme.colors.textSecondary },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark + '10',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginTop: 20,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
});

export default MetricsScreen;
