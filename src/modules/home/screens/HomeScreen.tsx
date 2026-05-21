import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useClassStore } from '../../classes/store/useClassStore';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import Header from '../../../shared/components/Header';
import StatCard from '../../../shared/components/StatCard';
import ClassCard from '../../../shared/components/ClassCard';
import { theme } from '../../../shared/theme';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { classes, fetchClasses } = useClassStore();
  const { bookings, fetchBookings } = useBookingStore();

  const activeBookings = bookings.filter(b => b.status === 'confirmed');

  useEffect(() => {
    fetchClasses();
    fetchBookings();
  }, [fetchClasses, fetchBookings]);

  const nextClass = classes[0];
  const totalAttended = 26;
  const targetClasses = 50;
  const progressPct = Math.round((totalAttended / targetClasses) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Velocity" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.greeting}>
          <Text style={styles.welcome}>
            Olá, {user?.name?.split(' ')[0] || 'Velover'}!
          </Text>
          <Text style={styles.subtitle}>Vamos treinar hoje?</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard title="Aulas Realizadas" value={totalAttended} />
          <StatCard title="Reservas" value={activeBookings.length} />
          <StatCard
            title="Streak"
            value={Math.floor(totalAttended / 4)}
            subtitle="semanas"
          />
        </View>

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
                onPress={() => navigation.navigate('AgendaTab', { screen: 'ClassDetail', params: { classId: b.class.id } })}
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
              onPress={() => navigation.navigate('AgendaTab', { screen: 'ClassDetail', params: { classId: nextClass.id } })}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Jornada 2026</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {totalAttended} / {targetClasses} aulas
              </Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${progressPct}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AgendaTab')}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.black} />
            <Text style={styles.actionText}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Packages' })}
          >
            <Ionicons name="pricetags" size={24} color={theme.colors.black} />
            <Text style={styles.actionText}>Planos</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'BringAFriend' })}
          >
            <Ionicons name="people" size={24} color={theme.colors.black} />
            <Text style={styles.actionText}>Indicar</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40 },
  greeting: { paddingHorizontal: 20, paddingVertical: 24 },
  welcome: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 17, color: theme.colors.textSecondary, marginTop: 4 },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: { color: theme.colors.text, fontSize: 17, fontWeight: '600' },
  progressPct: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  progressBar: {
    height: 10,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progress: { height: '100%', backgroundColor: theme.colors.text },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  actionText: { color: theme.colors.black, fontSize: 13, fontWeight: '600' },
});

export default HomeScreen;
