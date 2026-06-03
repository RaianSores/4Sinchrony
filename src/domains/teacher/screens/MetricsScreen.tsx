import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius, shadow } from '../../../shared/theme';
import { useTeacherMetricsStore } from '../stores/useTeacherMetricsStore';

const MetricsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { metrics, isLoading, fetchMetrics } = useTeacherMetricsStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Métricas</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading || !metrics ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando métricas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardsRow}>
            <View style={[styles.metricCard, { borderLeftColor: colors.primaryDark }]}>
              <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{metrics.totalClassesThisMonth}</Text>
              <Text style={styles.metricLabel} numberOfLines={2}>{`Aulas no mês`}</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.success }]}>
              <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{metrics.totalStudentsAttended}</Text>
              <Text style={styles.metricLabel} numberOfLines={2}>{`Alunos\natendidos`}</Text>
            </View>
          </View>

          <View style={styles.cardsRow}>
            <View style={[styles.metricCard, { borderLeftColor: colors.primary }]}>
              <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{metrics.uniqueStudents}</Text>
              <Text style={styles.metricLabel} numberOfLines={2}>{`Alunos\núnicos`}</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.success }]}>
              <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{metrics.averageOccupancyRate}%</Text>
              <Text style={styles.metricLabel} numberOfLines={2}>{`Taxa de\nocupação`}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Aulas por Semana</Text>
          <View style={styles.barChart}>
            {(() => {
              const maxCount = Math.max(...metrics.classesByWeek.map(w => w.count), 1);
              return metrics.classesByWeek.map((week, index) => (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barValue}>{week.count}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: Math.max((week.count / maxCount) * 80, 4) }]} />
                  </View>
                  <Text style={styles.barLabel}>{week.week}</Text>
                </View>
              ));
            })()}
          </View>

          <Text style={styles.sectionTitle}>Taxa de Ocupação</Text>
          <View style={styles.occupancyChart}>
            {metrics.occupancyTrend.map((day, index) => (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>{day.rate}%</Text>
                <View style={styles.occupancyTrack}>
                  <View style={[styles.occupancyBar, { height: Math.max((day.rate / 100) * 100, 4) }]} />
                </View>
                <Text style={styles.barLabel}>{day.date}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.primaryDark} />
            <Text style={styles.infoText}>
              Check-in rate: {metrics.averageCheckinRate}% — {metrics.averageOccupancyRate}% de ocupação média
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.textSecondary },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  metricValue: { fontSize: 28, fontWeight: '700', color: colors.text },
  metricLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 16 },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  occupancyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barColumn: { alignItems: 'center', gap: 4 },
  barValue: { fontSize: 12, fontWeight: '600', color: colors.text },
  barTrack: { height: 80, justifyContent: 'flex-end' },
  bar: { width: 24, backgroundColor: colors.primaryDark, borderRadius: 4 },
  occupancyTrack: { height: 100, justifyContent: 'flex-end' },
  occupancyBar: { width: 20, backgroundColor: colors.primary, borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.textSecondary },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark + '10',
    padding: 16,
    borderRadius: borderRadius.lg,
    marginTop: 20,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});

export default MetricsScreen;
