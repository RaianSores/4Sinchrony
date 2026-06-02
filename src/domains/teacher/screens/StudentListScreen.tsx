import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import type { AttendanceStatus } from '../../../core/types/attendance';

const StudentListScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'attended': return colors.success;
      case 'no_show': return colors.danger;
      default: return colors.grayLight;
    }
  };

  const renderStudent = ({ item }: any) => (
    <TouchableOpacity
      style={styles.studentRow}
      onPress={() => navigation.navigate('CheckInTab', {
        screen: 'Attendance',
        params: { classId },
      })}
    >
      <View style={styles.studentAvatar}>
        <Ionicons name="person" size={22} color={colors.primary} />
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.studentEmail}>{item.studentEmail}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
          {item.status === 'attended' ? 'Presente' : item.status === 'no_show' ? 'Ausente' : 'Pendente'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Alunos</Text>
        <TouchableOpacity>
          <Text style={styles.confirmAll}>Confirmar Todos</Text>
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
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {records.filter(r => r.status === 'no_show').length}
          </Text>
          <Text style={styles.statLabel}>Ausentes</Text>
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
  confirmAll: { fontSize: 14, fontWeight: '600', color: colors.primaryDark },
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
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
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
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  studentEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
});

export default StudentListScreen;
