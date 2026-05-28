import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useAttendanceStore } from '../stores/useAttendanceStore';

const CheckInSessionScreen = ({ route, navigation }: any) => {
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

  const handleConfirmAll = async () => {
    await confirmAll(classId);
  };

  const renderStudent = ({ item }: any) => {
    const isPresent = item.status === 'attended';

    return (
      <TouchableOpacity
        style={[styles.studentRow, isPresent && styles.studentRowPresent]}
        onPress={() => handleToggle(item.studentId)}
      >
        <View style={[styles.checkbox, isPresent && styles.checkboxActive]}>
          {isPresent && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}
        </View>

        <View style={styles.studentAvatar}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Check-in</Text>
        <TouchableOpacity onPress={handleConfirmAll}>
          <Text style={styles.confirmAllText}>Todos Presentes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
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
        <Ionicons name="list" size={20} color={theme.colors.white} />
        <Text style={styles.attendanceButtonText}>Ver registro completo de presença</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  confirmAllText: { fontSize: 13, fontWeight: '600', color: theme.colors.primaryDark },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: theme.colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  studentRowPresent: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  studentDetail: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 14,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  attendanceButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 14 },
});

export default CheckInSessionScreen;
