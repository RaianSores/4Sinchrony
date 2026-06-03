import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius, shadow } from '../../../shared/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const CheckInDashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {classesLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color={colors.grayLight} />
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
              <Ionicons name="chevron-forward" size={20} color={colors.grayLight} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: colors.grayLight },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  classTime: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 55,
  },
  classTimeText: { fontSize: 16, fontWeight: '700', color: colors.text },
  classDuration: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  classInfo: { flex: 1, paddingLeft: 16, gap: 3 },
  className: { fontSize: 16, fontWeight: '600', color: colors.text },
  classStudio: { fontSize: 13, color: colors.textSecondary },
  classOccupancy: { fontSize: 12, color: colors.primaryDark, fontWeight: '500' },
});

export default CheckInDashboardScreen;
