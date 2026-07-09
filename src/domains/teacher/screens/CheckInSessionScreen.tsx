import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './CheckInSessionScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

// Tela única de check-in: marcar presença e controlar a sessão da aula (iniciar/encerrar)
// juntos, no mesmo lugar. Antes eram 3 telas separadas (CheckIn, Sessão, Registro de
// Presença) sem ligação entre si — marcar presença não iniciava a aula. Ver
// docs/auditoria/11-prontidao-producao.md (09/07/2026) para o diagnóstico completo.
// Regra de negócio: iniciar a aula exige pelo menos 1 aluno presente E o professor
// apertar "Iniciar Aula" — não é automático, mas o botão fica desabilitado até a
// primeira condição ser satisfeita.

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const CheckInSessionScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance, confirmAll, updateStatus } = useAttendanceStore();
  const { currentSession, isActive, startSession, endSession, getSession } = useTeacherSessionStore();
  const classFromStore = useTeacherClassStore(s => s.classes.find(c => c.id === classId));
  const tabPadding = useTabBarBottomPadding();
  const [refreshing, setRefreshing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { showAlert } = useAppAlert();
  const alertFired = useRef(false);

  const finishSession = useCallback(async () => {
    try {
      await endSession(classId);
      useTeacherClassStore.getState().updateClassStatus(classId, 'completed');
      navigation.navigate('ClassesTab', { screen: 'MyClasses' });
    } catch (error) {
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível encerrar a aula. Tente novamente.') });
    }
  }, [classId, endSession, navigation, showAlert]);

  useEffect(() => {
    fetchAttendance(classId);
    getSession(classId);
  }, [classId, fetchAttendance, getSession]);

  // Sincroniza o cronômetro com o horário real de início (vindo do servidor), pra ficar
  // certo mesmo se o professor sair e voltar pra essa tela.
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

  useEffect(() => {
    const totalSeconds = (currentSession?.duration ?? 0) * 60;
    if (!isActive || !currentSession || alertFired.current || totalSeconds === 0) return;
    if (elapsed >= totalSeconds) {
      alertFired.current = true;
      showAlert({
        title: 'Aula finalizada!',
        message: `O tempo de ${currentSession.duration} minutos encerrou. Deseja finalizar a sessão?`,
        buttons: [
          { text: 'Continuar', style: 'cancel' },
          { text: 'Encerrar', style: 'destructive', onPress: finishSession },
        ],
      });
    }
  }, [elapsed, isActive, currentSession, finishSession, showAlert]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchAttendance(classId), getSession(classId)]);
    setRefreshing(false);
  }, [classId, fetchAttendance, getSession]);

  const attendedCount = records.filter(r => r.status === 'attended').length;
  // Usa o status da AULA (não da sessão) pra decidir se ainda pode iniciar: uma sessão
  // anterior pode aparecer "completed" mesmo numa aula que voltou a ficar "scheduled"
  // (ex: reagendada) — nesse caso iniciar de novo funciona normalmente no backend.
  // O que realmente bloqueia com 409 é a aula em si já estar concluída/cancelada.
  const isFinished = classFromStore ? (classFromStore.status === 'completed' || classFromStore.status === 'cancelled') : false;
  const canStartSession = attendedCount > 0 && !isFinished;

  const handleToggle = async (studentId: string) => {
    const record = records.find(r => r.studentId === studentId);
    if (!record) return;
    const newStatus = record.status === 'attended' ? 'no_show' : 'attended';
    try {
      await updateStatus(classId, studentId, newStatus);
    } catch (error) {
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível atualizar a presença deste aluno. Tente novamente.') });
    }
  };

  const handleConfirmAll = async () => {
    try {
      await confirmAll(classId);
    } catch (error) {
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível confirmar a presença de todos. Tente novamente.') });
    }
  };

  const handleStartSession = async () => {
    if (!canStartSession) return;
    try {
      await startSession(classId);
    } catch (error) {
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível iniciar a aula. Tente novamente.') });
    }
  };

  const handleEndSession = () => {
    showAlert({
      title: 'Encerrar aula',
      message: 'Tem certeza que deseja encerrar a sessão desta aula?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Encerrar', style: 'destructive', onPress: finishSession },
      ],
    });
  };

  const renderStudent = ({ item }: any) => {
    const isPresent = item.status === 'attended';
    return (
      <TouchableOpacity
        style={[styles.studentRow, isPresent && styles.studentRowPresent]}
        onPress={() => handleToggle(item.studentId)}
      >
        <View style={[styles.checkbox, isPresent && styles.checkboxActive]}>
          {isPresent && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
        <View style={styles.studentAvatar}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.studentDetail}>
            {item.status === 'confirmed' ? 'Pendente' : item.status === 'attended' ? 'Presente' : 'Ausente'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Check-in</Text>
        <TouchableOpacity onPress={handleConfirmAll}>
          <Text style={styles.confirmAllText}>Todos Presentes</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sessionBanner, isActive ? styles.sessionBannerActive : styles.sessionBannerIdle]}>
        <View style={styles.sessionBannerLeft}>
          <Ionicons
            name={isActive ? 'radio-button-on' : isFinished ? 'checkmark-done-circle' : 'time-outline'}
            size={20}
            color={isActive ? colors.success : colors.textSecondary}
          />
          <View>
            <Text style={styles.sessionBannerTitle}>
              {isActive ? 'Aula em andamento' : isFinished ? 'Aula já concluída' : 'Aula não iniciada'}
            </Text>
            <Text style={styles.sessionBannerSubtitle}>
              {isActive
                ? formatElapsed(elapsed)
                : isFinished
                  ? 'Esta sessão já foi encerrada e não pode ser reaberta'
                  : canStartSession
                    ? 'Pronto para iniciar'
                    : 'Marque ao menos 1 aluno presente para iniciar'}
            </Text>
          </View>
        </View>
        {isActive ? (
          <TouchableOpacity style={styles.endSessionButton} onPress={handleEndSession}>
            <Ionicons name="stop" size={14} color={colors.white} />
            <Text style={styles.endSessionButtonText}>Encerrar</Text>
          </TouchableOpacity>
        ) : !isFinished && (
          <TouchableOpacity
            style={[styles.startSessionButton, !canStartSession && styles.startSessionButtonDisabled]}
            onPress={handleStartSession}
            disabled={!canStartSession}
          >
            <Ionicons name="play" size={14} color={canStartSession ? colors.white : colors.textSecondary} />
            <Text style={[styles.startSessionButtonText, !canStartSession && styles.startSessionButtonTextDisabled]}>
              Iniciar Aula
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {records.filter(r => r.status === 'attended').length}
          </Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {records.filter(r => r.status === 'confirmed').length}
          </Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderStudent}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum aluno inscrito</Text>
              <Text style={styles.emptySubtext}>Alunos aparecerão aqui assim que reservarem esta aula.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};


export default CheckInSessionScreen;
