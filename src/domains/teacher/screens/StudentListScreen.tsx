import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './StudentListScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};


export default StudentListScreen;
