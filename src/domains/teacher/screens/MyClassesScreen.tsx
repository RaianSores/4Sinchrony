import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';

const MyClassesScreen = ({ navigation }: any) => {
  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in_progress': return theme.colors.success;
      case 'completed': return theme.colors.textSecondary;
      case 'cancelled': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Agendada';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Aulas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.grayLight} />
            <Text style={styles.emptyText}>Nenhuma aula encontrada</Text>
          </View>
        ) : (
          classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={styles.classCard}
              onPress={() => navigation.navigate('ClassSession', { classId: cls.id })}
            >
              <View style={styles.classHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cls.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(cls.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(cls.status) }]}>
                    {getStatusLabel(cls.status)}
                  </Text>
                </View>
                <Text style={styles.classTime}>{cls.startTime}</Text>
              </View>

              <Text style={styles.className}>{cls.name}</Text>

              <View style={styles.classDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{cls.studio.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{cls.duration} minutos</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {cls.totalSpots - cls.availableSpots}/{cls.totalSpots} vagas ocupadas
                  </Text>
                </View>
              </View>

              <View style={styles.classActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('StudentList', { classId: cls.id })}
                >
                  <Ionicons name="people" size={18} color={theme.colors.primaryDark} />
                  <Text style={styles.actionBtnText}>Alunos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('CheckInTab', {
                    screen: 'CheckInSession',
                    params: { classId: cls.id },
                  })}
                >
                  <Ionicons name="checkbox" size={18} color={theme.colors.primaryDark} />
                  <Text style={styles.actionBtnText}>Check-in</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: theme.colors.grayLight },
  classCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  classTime: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  className: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  classDetails: { gap: 6, marginBottom: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: theme.colors.textSecondary },
  classActions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnText: { fontSize: 14, fontWeight: '500', color: theme.colors.primaryDark },
});

export default MyClassesScreen;
