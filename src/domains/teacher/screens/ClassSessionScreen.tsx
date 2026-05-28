import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const ClassSessionScreen = ({ route, navigation }: any) => {
  const { classId } = route.params;
  const { currentSession, isActive, isLoading, startSession, endSession } = useTeacherSessionStore();
  const { records, fetchAttendance, attendedCount, totalCount } = useAttendanceStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    await startSession(classId);
  };

  const handleEnd = async () => {
    await endSession(classId);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sessão da Aula</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {currentSession && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{currentSession.className}</Text>
            <Text style={styles.sessionStudio}>{currentSession.studioName}</Text>
            <Text style={styles.sessionInstructor}>{currentSession.instructorName}</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo de aula</Text>
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Alunos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendedCount}</Text>
            <Text style={styles.statLabel}>Presentes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCount - attendedCount}</Text>
            <Text style={styles.statLabel}>Ausentes</Text>
          </View>
        </View>

        <View style={styles.studentList}>
          <Text style={styles.listTitle}>Alunos</Text>
          {records.map((record) => (
            <View key={record.id} style={styles.studentRow}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.studentName}>{record.studentName}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: record.status === 'attended' ? theme.colors.success : theme.colors.grayLight },
              ]} />
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={handleStart}
              disabled={isLoading}
            >
              <Ionicons name="play" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Iniciando...' : 'Iniciar Aula'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
              onPress={handleEnd}
              disabled={isLoading}
            >
              <Ionicons name="stop" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Encerrando...' : 'Encerrar Aula'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryDark }]}
            onPress={() => navigation.navigate('CheckInTab', {
              screen: 'CheckInSession',
              params: { classId },
            })}
          >
            <Ionicons name="checkbox" size={20} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Gerenciar Presença</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: { flex: 1, padding: 16 },
  sessionInfo: { alignItems: 'center', marginBottom: 24 },
  sessionName: { fontSize: 24, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  sessionStudio: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 },
  sessionInstructor: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  timerContainer: { alignItems: 'center', marginBottom: 24 },
  timerLabel: { fontSize: 14, color: theme.colors.textSecondary },
  timer: { fontSize: 48, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  studentList: { flex: 1, marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.text },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  actions: { gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  actionButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 16 },
});

export default ClassSessionScreen;
