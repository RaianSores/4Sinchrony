import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './CheckInDashboardScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';
import { useAttendanceStore } from '../stores/useAttendanceStore';




const CheckInDashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { classes, fetchMyClasses, isLoading: classesLoading } = useTeacherClassStore();
  const { fetchAttendance } = useAttendanceStore();
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    fetchMyClasses(todayStr);
  }, [fetchMyClasses, todayStr]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyClasses(todayStr);
    setRefreshing(false);
  }, [fetchMyClasses, todayStr]);

  // `classes` is a shared store also populated (unfiltered, any date) by other teacher
  // screens (Dashboard, MyClasses), so re-check the date here instead of trusting the
  // date filter passed to fetchMyClasses().
  const todayClasses = useMemo(() => classes.filter(c => c.date === todayStr), [classes, todayStr]);

  const handleOpenCheckIn = async (cls: { id: string }) => {
    await fetchAttendance(cls.id);
    navigation.navigate('CheckInSession', { classId: cls.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-in</Text>
        <Text style={styles.subtitle}>Gerencie a presença dos alunos</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {classesLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color={colors.grayLight} />
            <Text style={styles.emptyText}>Nenhuma aula hoje</Text>
          </View>
        ) : (
          todayClasses.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={styles.classCard}
              onPress={() => handleOpenCheckIn(cls)}
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
