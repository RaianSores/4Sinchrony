import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../core/theme';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import type { AttendanceStatus } from '../../../core/types/attendance';

const StudentListScreen = ({ route, navigation }: any) => {
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'attended': return theme.colors.success;
      case 'no_show': return theme.colors.danger;
      default: return theme.colors.grayLight;
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
        <Ionicons name="person" size={22} color={theme.colors.primary} />
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {records.filter(r => r.status === 'attended').length}
          </Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.danger }]}>
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
  confirmAll: { fontSize: 14, fontWeight: '600', color: theme.colors.primaryDark },
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
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
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
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  studentEmail: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
});

export default StudentListScreen;
