import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './MetricsScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
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


export default MetricsScreen;
