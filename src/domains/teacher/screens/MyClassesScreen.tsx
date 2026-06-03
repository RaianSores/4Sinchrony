import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius, shadow } from '../../../shared/theme';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';

const MyClassesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();
  useEffect(() => { fetchMyClasses(); }, [fetchMyClasses]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in_progress': return colors.success;
      case 'completed': return colors.textSecondary;
      case 'cancelled': return colors.danger;
      default: return colors.primary;
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
      <View style={styles.header}><Text style={styles.title}>Minhas Aulas</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhuma aula encontrada</Text>
          </View>
        ) : (
          classes.map(cls => (
            <TouchableOpacity key={cls.id} style={styles.classCard}
              onPress={() => navigation.navigate('ClassSession', { classId: cls.id })}>
              <View style={styles.classHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cls.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(cls.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(cls.status) }]}>{getStatusLabel(cls.status)}</Text>
                </View>
                <Text style={styles.classTime}>{cls.startTime}</Text>
              </View>
              <Text style={styles.className}>{cls.name}</Text>
              <View style={styles.classDetails}>
                <View style={styles.detailRow}><Ionicons name="location-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{cls.studio.name}</Text></View>
                <View style={styles.detailRow}><Ionicons name="time-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{cls.duration} minutos</Text></View>
                <View style={styles.detailRow}><Ionicons name="people-outline" size={16} color={colors.textSecondary} /><Text style={styles.detailText}>{cls.totalSpots - cls.availableSpots}/{cls.totalSpots} vagas ocupadas</Text></View>
              </View>
              <View style={styles.classActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('StudentList', { classId: cls.id })}>
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Alunos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CheckInTab', { screen: 'CheckInSession', params: { classId: cls.id } })}>
                  <Ionicons name="checkbox" size={18} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Check-in</Text>
                </TouchableOpacity>
              </View>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  classCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...shadow.sm },
  classHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  classTime: { fontSize: 16, fontWeight: '700', color: colors.text },
  className: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 10 },
  classDetails: { gap: 6, marginBottom: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: colors.textSecondary },
  classActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: borderRadius.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  actionBtnText: { fontSize: 14, fontWeight: '500' },
});

export default MyClassesScreen;
