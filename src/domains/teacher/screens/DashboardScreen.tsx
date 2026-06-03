import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './DashboardScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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


export default DashboardScreen;
