import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './ClassSessionScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const ClassSessionScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sessão da Aula</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={styles.studentName}>{record.studentName}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: record.status === 'attended' ? colors.success : colors.grayLight },
              ]} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {!isActive ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => startSession(classId)}
            disabled={isLoading}
          >
            <Ionicons name="play" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Iniciando...' : 'Iniciar Aula'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={async () => { await endSession(classId); navigation.goBack(); }}
            disabled={isLoading}
          >
            <Ionicons name="stop" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Encerrando...' : 'Encerrar Aula'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primaryDark }]}
          onPress={() => navigation.navigate('CheckInTab', { screen: 'CheckInSession', params: { classId } })}
        >
          <Ionicons name="checkbox" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Gerenciar Presença</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default ClassSessionScreen;
