import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './CheckInSessionScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
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
          showsVerticalScrollIndicator={false}
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


export default CheckInSessionScreen;
