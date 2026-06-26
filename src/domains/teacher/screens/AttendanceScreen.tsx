import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './AttendanceScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useAttendanceStore } from '../stores/useAttendanceStore';
import type { AttendanceStatus } from '../../../core/types/attendance';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';

const AttendanceScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params;
  const { records, isLoading, fetchAttendance, updateStatus } = useAttendanceStore();
  const tabPadding = useTabBarBottomPadding();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendance(classId);
  }, [classId, fetchAttendance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAttendance(classId);
    setRefreshing(false);
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
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
          style={{ flex: 1 }}
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};


export default AttendanceScreen;

