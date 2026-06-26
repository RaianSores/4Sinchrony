import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useClassStore } from '../../classes/store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import { useProgressStore } from '../../profile/store/useProgressStore';
import StatCard from '../../../../shared/components/StatCard';
import ClassCard from '../../../../shared/components/ClassCard';
import { Avatar } from '../../../../shared/components/Avatar';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './HomeScreen.styles';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const HomeScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const { bookings, fetchBookings } = useBookingStore();
  const { progress, fetchProgress } = useProgressStore();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Aluno';
  const activeBookings = bookings.filter(b => b.status === 'confirmed');

  useEffect(() => {
    fetchClasses();
    fetchBookings();
    fetchProgress();
  }, [fetchClasses, fetchBookings, fetchProgress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchClasses(), fetchBookings(), fetchProgress()]);
    setRefreshing(false);
  }, [fetchClasses, fetchBookings, fetchProgress]);

  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const nextClass = classes.find(c =>
    c.status === 'scheduled' &&
    (c.date > todayStr || (c.date === todayStr && c.startTime > currentTimeStr))
  ) ?? null;
  const totalAttended = progress?.classesAttended ?? 0;
  const targetClasses = progress?.classesGoal ?? 50;
  const streakWeeks = progress?.streakWeeks ?? 0;
  const progressPct = targetClasses > 0 ? Math.round((totalAttended / targetClasses) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Enterprise header: greeting + avatar */}
      <View style={styles.enterpriseHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>{timeGreeting()},</Text>
          <Text style={styles.headerName}>{firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Profile' })}
          activeOpacity={0.8}
        >
          <Avatar uri={user?.avatar} name={user?.name || 'A'} size="md" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            {...({ backgroundColor: colors.background } as any)}
          />
        }
      >
        <View style={styles.statsContainer}>
          <StatCard title="Aulas Realizadas" value={totalAttended} />
          <StatCard title="Reservas" value={activeBookings.length} />
          <StatCard title="Streak" value={streakWeeks} subtitle="semanas" />
        </View>

        <TouchableOpacity
          style={styles.creditsBanner}
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Packages' })}
        >
          <Ionicons name="flash" size={22} color={colors.primary} />
          <Text style={styles.creditsBannerText}>
            {(user?.credits ?? 0) > 0
              ? `${user?.credits} crédito${user?.credits !== 1 ? 's' : ''} disponível(is)`
              : 'Sem créditos — Adquira um plano'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {activeBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximas Aulas</Text>
            {activeBookings.slice(0, 2).map(b => (
              <ClassCard
                key={b.id}
                instructor={b.class.instructor}
                instructorAvatar={b.class.instructorAvatar}
                className={b.class.name}
                time={b.class.startTime}
                duration={b.class.duration}
                studio={b.class.studio?.name || ''}
                availableSpots={b.class.availableSpots}
                totalSpots={b.class.totalSpots}
                onPress={() => navigation.navigate('ClassDetail', { classId: b.class.id })}
              />
            ))}
          </View>
        )}

        {nextClass && activeBookings.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próxima Aula</Text>
            <ClassCard
              instructor={nextClass.instructor}
              instructorAvatar={nextClass.instructorAvatar}
              className={nextClass.name}
              time={nextClass.startTime}
              duration={nextClass.duration}
              studio={nextClass.studio?.name || ''}
              availableSpots={nextClass.availableSpots}
              totalSpots={nextClass.totalSpots}
              onPress={() => navigation.navigate('ClassDetail', { classId: nextClass.id })}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Jornada 2026</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{totalAttended} / {targetClasses} aulas</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${progressPct}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AgendaTab')}>
            <Ionicons name="calendar" size={24} color={colors.text} />
            <Text style={styles.actionText}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProfileTab', { screen: 'Packages' })}>
            <Ionicons name="pricetags" size={24} color={colors.text} />
            <Text style={styles.actionText}>Planos</Text>
          </TouchableOpacity>
          {/* FEATURE: bring-a-friend (paid add-on)
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProfileTab', { screen: 'BringAFriend' })}>
            <Ionicons name="people" size={24} color={colors.text} />
            <Text style={styles.actionText}>Indicar</Text>
          </TouchableOpacity>
          */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

