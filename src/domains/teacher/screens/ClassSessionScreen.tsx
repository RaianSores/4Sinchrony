import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { mkStyles } from './ClassSessionScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';


// ââ€â‚¬ââ€â‚¬ââ€â‚¬ Circular countdown timer ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬
const TIMER_SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularTimer({
  elapsed,
  totalSeconds,
  colors,
}: {
  elapsed: number;
  totalSeconds: number;
  colors: any;
}) {
  const remaining = Math.max(totalSeconds - elapsed, 0);
  const progress = totalSeconds > 0 ? Math.max(1 - elapsed / totalSeconds, 0) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const pct = Math.round(progress * 100);
  const finished = remaining === 0;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={TIMER_SIZE} height={TIMER_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={TIMER_SIZE / 2}
          cy={TIMER_SIZE / 2}
          r={RADIUS}
          stroke={colors.card}
          strokeWidth={STROKE_WIDTH + 2}
          fill="transparent"
        />
        {/* Progress arc */}
        <Circle
          cx={TIMER_SIZE / 2}
          cy={TIMER_SIZE / 2}
          r={RADIUS}
          stroke={finished ? colors.danger : 'url(#timerGrad)'}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center content (unrotated) */}
      <View style={{
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          fontSize: 42,
          fontWeight: '700',
          color: finished ? colors.danger : colors.text,
          letterSpacing: 2,
        }}>
          {timeStr}
        </Text>
        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '500',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {finished ? 'Encerrado' : 'Tempo restante'}
        </Text>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: finished ? colors.danger : colors.primary,
          marginTop: 6,
        }}>
          {pct}%
        </Text>
      </View>
    </View>
  );
}
// ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬ââ€â‚¬

const ClassSessionScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { classId } = route.params;
  const { currentSession, isActive, isLoading, startSession, endSession } = useTeacherSessionStore();
  const { records, fetchAttendance, attendedCount, totalCount } = useAttendanceStore();
  const [elapsed, setElapsed] = useState(0);
  const alertFired = useRef(false);

  const totalSeconds = (currentSession?.duration ?? 60) * 60;

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  // Sync elapsed with server-side startedAt so it's accurate after navigation
  useEffect(() => {
    if (isActive && currentSession?.startedAt) {
      const startMs = new Date(currentSession.startedAt).getTime();
      const initial = Math.floor((Date.now() - startMs) / 1000);
      setElapsed(initial > 0 ? initial : 0);
      alertFired.current = false;
    }
  }, [isActive, currentSession?.startedAt]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Alert when countdown reaches zero
  useEffect(() => {
    if (!isActive || !currentSession || alertFired.current) return;
    if (elapsed >= totalSeconds) {
      alertFired.current = true;
      Alert.alert(
        'Aula finalizada!',
        `O tempo de ${currentSession.duration} minutos encerrou. Deseja finalizar a sessÃ£o?`,
        [
          { text: 'Continuar', style: 'cancel' },
          {
            text: 'Encerrar',
            style: 'destructive',
            onPress: async () => { await endSession(classId); navigation.goBack(); },
          },
        ],
      );
    }
  }, [elapsed, totalSeconds, isActive, currentSession, classId, endSession, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>SessÃ£o da Aula</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
        {currentSession && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{currentSession.className}</Text>
            <Text style={styles.sessionStudio}>{currentSession.studioName}</Text>
            <Text style={styles.sessionInstructor}>{currentSession.instructorName}</Text>
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

        {isActive && currentSession ? (
          <View style={styles.timerContainer}>
            <CircularTimer elapsed={elapsed} totalSeconds={totalSeconds} colors={colors} />
          </View>
        ) : !isActive && attendedCount > 0 && (
          <View style={styles.timerPlaceholder}>
            <Ionicons name="timer-outline" size={64} color={colors.border} />
            <Text style={styles.timerPlaceholderText}>Inicie a aula para ativar o cronÃ´metro</Text>
          </View>
        )}

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

      <View style={[styles.actions, { paddingBottom: tabPadding }]}>
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
          <Text style={styles.actionButtonText}>Gerenciar PresenÃ§a</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ClassSessionScreen;
