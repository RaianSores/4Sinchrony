import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './CheckInDashboardScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
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


export default CheckInDashboardScreen;
