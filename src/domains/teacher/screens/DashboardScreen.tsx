import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './DashboardScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { Avatar } from '../../../shared/components/Avatar';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';




const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { user } = useAuthStore();

  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();
  const { currentSession, isActive, startSession } = useTeacherSessionStore();
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => { fetchMyClasses(todayStr); }, [fetchMyClasses, todayStr]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyClasses(todayStr);
    setRefreshing(false);
  }, [fetchMyClasses, todayStr]);

  // `classes` is a shared store also populated (unfiltered, any date) by other teacher
  // screens (MyClasses, CheckIn), so re-check the date here instead of trusting the
  // date filter passed to fetchMyClasses().
  const todayClasses = useMemo(() => classes.filter(c => c.date === todayStr), [classes, todayStr]);
  const pendingCheckin = todayClasses.reduce((sum, c) => sum + (c.totalSpots - c.availableSpots), 0);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return todayClasses.filter(c => {
      if (typeof c.startTime !== 'string' || c.startTime.length < 5) return true;
      const h = parseInt(c.startTime.slice(0, 2), 10);
      const min = parseInt(c.startTime.slice(3, 5), 10);
      if (isNaN(h) || isNaN(min)) return true;
      return (h * 60 + min) >= nowMinutes;
    });
  }, [todayClasses]);

  const handleStartClass = async (classId: string) => {
    await startSession(classId);
    navigation.navigate('ClassesTab', { screen: 'ClassSession', params: { classId } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Professor</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileTab', { screen: 'TeacherProfile' })}
          activeOpacity={0.8}
        >
          <Avatar uri={user?.avatar} name={user?.name || 'P'} size="md" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
        ) : upcomingClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhuma aula hoje</Text>
          </View>
        ) : (
          upcomingClasses.map(cls => (
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

