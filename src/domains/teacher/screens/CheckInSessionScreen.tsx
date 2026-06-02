import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const CheckInSessionScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance, confirmAll, updateStatus } = useAttendanceStore();

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  const handleToggle = async (studentId: string) => {
    const record = records.find(r => r.studentId === studentId);
    if (!record) return;
    const newStatus = record.status === 'attended' ? 'no_show' : 'attended';
    await updateStatus(classId, studentId, newStatus);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Check-in</Text>
        <TouchableOpacity onPress={() => confirmAll(classId)}>
          <Text style={styles.confirmAllText}>Todos Presentes</Text>
        </TouchableOpacity>
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
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.attendanceButton}
        onPress={() => navigation.navigate('Attendance', { classId })}
      >
        <Ionicons name="list" size={20} color={colors.white} />
        <Text style={styles.attendanceButtonText}>Ver registro completo de presença</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  confirmAllText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  studentRowPresent: {
    borderColor: colors.success,
    backgroundColor: colors.success + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.success, borderColor: colors.success },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  studentDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 14,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  attendanceButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});

export default CheckInSessionScreen;
