import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius, shadow } from '../../../shared/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';

const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();
  const { currentSession, isActive, startSession } = useTeacherSessionStore();

  useEffect(() => { fetchMyClasses(); }, [fetchMyClasses]);

  const todayClasses = classes;
  const pendingCheckin = todayClasses.reduce((sum, c) => sum + (c.totalSpots - c.availableSpots), 0);

  const handleStartClass = async (classId: string) => {
    await startSession(classId);
    navigation.navigate('ClassesTab', { screen: 'ClassSession', params: { classId } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Professor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          {[
            { icon: 'calendar', value: todayClasses.length, label: 'Aulas hoje' },
            { icon: 'people', value: pendingCheckin, label: 'Alunos previstos' },
            { icon: 'checkbox', value: pendingCheckin, label: 'Check-in pendente' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={24} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {currentSession && isActive && (
          <View style={styles.activeSessionBanner}>
            <Ionicons name="play-circle" size={28} color={colors.success} />
            <View style={styles.activeSessionInfo}>
              <Text style={styles.activeSessionTitle}>Aula em andamento</Text>
              <Text style={styles.activeSessionName}>{currentSession.className}</Text>
            </View>
            <TouchableOpacity style={styles.continueButton}
              onPress={() => navigation.navigate('ClassesTab', { screen: 'ClassSession', params: { classId: currentSession.classId } })}>
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Próximas Aulas</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhuma aula hoje</Text>
          </View>
        ) : (
          todayClasses.map(cls => (
            <TouchableOpacity key={cls.id} style={styles.classCard}
              onPress={() => navigation.navigate('ClassesTab', { screen: 'ClassSession', params: { classId: cls.id } })}>
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{cls.startTime}</Text>
                <Text style={styles.classDuration}>{cls.duration}min</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classStudio}>{cls.studio.name}</Text>
                <View style={styles.classMeta}>
                  <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.classMetaText}>{cls.totalSpots - cls.availableSpots}/{cls.totalSpots}</Text>
                </View>
              </View>
              <View style={styles.classActions}>
                <TouchableOpacity style={styles.startButton} onPress={() => handleStartClass(cls.id)}>
                  <Text style={styles.startButtonText}>Iniciar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.metricsButton}
          onPress={() => navigation.navigate('DashboardTab', { screen: 'Metrics' })}>
          <Ionicons name="stats-chart" size={20} color={colors.white} />
          <Text style={styles.metricsButtonText}>Ver Métricas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 2 },
  scrollContent: { paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginVertical: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: borderRadius.lg, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, ...shadow.sm },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  activeSessionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 20, padding: 16, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.success, gap: 12 },
  activeSessionInfo: { flex: 1 },
  activeSessionTitle: { fontSize: 14, fontWeight: '600', color: colors.success },
  activeSessionName: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  continueButton: { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.sm },
  continueButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 12 },
  loadingText: { textAlign: 'center', color: colors.textSecondary, marginTop: 20 },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  classCard: { flexDirection: 'row', backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, ...shadow.sm },
  classTime: { alignItems: 'center', justifyContent: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: colors.border, minWidth: 60 },
  classTimeText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  classDuration: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  classInfo: { flex: 1, paddingLeft: 16, gap: 4 },
  className: { fontSize: 17, fontWeight: '600', color: colors.text },
  classStudio: { fontSize: 14, color: colors.textSecondary },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  classMetaText: { fontSize: 13, color: colors.textSecondary },
  classActions: { justifyContent: 'center', paddingLeft: 12 },
  startButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.sm },
  startButtonText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  metricsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: borderRadius.lg, gap: 8 },
  metricsButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});

export default DashboardScreen;
