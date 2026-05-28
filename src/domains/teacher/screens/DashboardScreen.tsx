import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';

const DashboardScreen = ({ navigation }: any) => {
  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();
  const { currentSession, isActive, startSession } = useTeacherSessionStore();

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const todayClasses = classes;
  const pendingCheckin = todayClasses.reduce(
    (sum, c) => sum + (c.totalSpots - c.availableSpots), 0
  );

  const handleStartClass = async (classId: string) => {
    await startSession(classId);
    navigation.navigate('ClassesTab', {
      screen: 'ClassSession',
      params: { classId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Professor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="calendar" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.statValue}>{todayClasses.length}</Text>
            <Text style={styles.statLabel}>Aulas hoje</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="people" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.statValue}>{pendingCheckin}</Text>
            <Text style={styles.statLabel}>Alunos previstos</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="checkbox" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.statValue}>{pendingCheckin}</Text>
            <Text style={styles.statLabel}>Check-in pendente</Text>
          </View>
        </View>

        {currentSession && isActive && (
          <View style={styles.activeSessionBanner}>
            <Ionicons name="play-circle" size={28} color={theme.colors.success} />
            <View style={styles.activeSessionInfo}>
              <Text style={styles.activeSessionTitle}>Aula em andamento</Text>
              <Text style={styles.activeSessionName}>{currentSession.className}</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('ClassesTab', {
                screen: 'ClassSession',
                params: { classId: currentSession.classId },
              })}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Próximas Aulas</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.grayLight} />
            <Text style={styles.emptyText}>Nenhuma aula hoje</Text>
          </View>
        ) : (
          todayClasses.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={styles.classCard}
              onPress={() => navigation.navigate('ClassesTab', {
                screen: 'ClassSession',
                params: { classId: cls.id },
              })}
            >
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{cls.startTime}</Text>
                <Text style={styles.classDuration}>{cls.duration}min</Text>
              </View>

              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classStudio}>{cls.studio.name}</Text>
                <View style={styles.classMeta}>
                  <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.classMetaText}>
                    {cls.totalSpots - cls.availableSpots}/{cls.totalSpots}
                  </Text>
                </View>
              </View>

              <View style={styles.classActions}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartClass(cls.id)}
                >
                  <Text style={styles.startButtonText}>Iniciar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.metricsButton}
          onPress={() => navigation.navigate('DashboardTab', { screen: 'Metrics' })}
        >
          <Ionicons name="stats-chart" size={20} color={theme.colors.white} />
          <Text style={styles.metricsButtonText}>Ver Métricas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 2 },
  scrollContent: { paddingBottom: 40 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
    gap: 12,
  },
  activeSessionInfo: { flex: 1 },
  activeSessionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.success },
  activeSessionName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  continueButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  continueButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 14 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loadingText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { fontSize: 16, color: theme.colors.grayLight },
  classCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  classTime: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    minWidth: 60,
  },
  classTimeText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  classDuration: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  classInfo: { flex: 1, paddingLeft: 16, gap: 4 },
  className: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  classStudio: { fontSize: 14, color: theme.colors.textSecondary },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  classMetaText: { fontSize: 13, color: theme.colors.textSecondary },
  classActions: { justifyContent: 'center', paddingLeft: 12 },
  startButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  startButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 13 },
  metricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  metricsButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
});

export default DashboardScreen;
