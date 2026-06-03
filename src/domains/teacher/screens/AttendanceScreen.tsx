import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import type { AttendanceStatus } from '../../../core/types/attendance';

const AttendanceScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance, updateStatus } = useAttendanceStore();

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  const cycleStatus = async (studentId: string, currentStatus: AttendanceStatus) => {
    const nextStatus: Record<AttendanceStatus, AttendanceStatus> = {
      confirmed: 'attended',
      attended: 'no_show',
      no_show: 'confirmed',
    };
    await updateStatus(classId, studentId, nextStatus[currentStatus]);
  };

  const getStatusStyle = (status: AttendanceStatus) => {
    switch (status) {
      case 'attended':
        return { bg: colors.success + '20', text: colors.success, label: 'Presente' };
      case 'no_show':
        return { bg: colors.danger + '20', text: colors.danger, label: 'Ausente' };
      default:
        return { bg: colors.grayLight + '40', text: colors.textSecondary, label: 'Pendente' };
    }
  };

  const renderItem = ({ item }: any) => {
    const style = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.row} onPress={() => cycleStatus(item.studentId, item.status)}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.studentName}</Text>
          <Text style={styles.email}>{item.studentEmail}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
          <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
        </View>
        <View style={[styles.toggleArea, { backgroundColor: style.bg }]}>
          <Ionicons name="refresh" size={16} color={style.text} />
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
        <Text style={styles.title}>Registro de Presença</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Toque no aluno para alternar entre Presente / Ausente / Pendente</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  legend: { paddingHorizontal: 16, paddingBottom: 12 },
  legendText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  email: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  badgeText: { fontSize: 11, fontWeight: '600' },
  toggleArea: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default AttendanceScreen;
