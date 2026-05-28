import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const CheckInDashboardScreen = ({ navigation }: any) => {
  const { classes, fetchMyClasses, isLoading: classesLoading } = useTeacherClassStore();
  const { fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const handleOpenCheckIn = async (classId: string) => {
    await fetchAttendance(classId);
    navigation.navigate('CheckInSession', { classId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-in</Text>
        <Text style={styles.subtitle}>Gerencie a presença dos alunos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {classesLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color={theme.colors.grayLight} />
            <Text style={styles.emptyText}>Nenhuma aula disponível</Text>
          </View>
        ) : (
          classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={styles.classCard}
              onPress={() => handleOpenCheckIn(cls.id)}
            >
              <View style={styles.classTime}>
                <Text style={styles.classTimeText}>{cls.startTime}</Text>
                <Text style={styles.classDuration}>{cls.duration}min</Text>
              </View>

              <View style={styles.classInfo}>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classStudio}>{cls.studio.name}</Text>
                <Text style={styles.classOccupancy}>
                  {cls.totalSpots - cls.availableSpots}/{cls.totalSpots} alunos
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={theme.colors.grayLight} />
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
  subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: theme.colors.grayLight },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  classTime: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    minWidth: 55,
  },
  classTimeText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  classDuration: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  classInfo: { flex: 1, paddingLeft: 16, gap: 3 },
  className: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  classStudio: { fontSize: 13, color: theme.colors.textSecondary },
  classOccupancy: { fontSize: 12, color: theme.colors.primaryDark, fontWeight: '500' },
});

export default CheckInDashboardScreen;
