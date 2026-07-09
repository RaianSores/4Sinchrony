import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mkStyles } from './MyClassesScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { useTeacherClassStore } from '../stores/useTeacherClassStore';




const MyClassesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { classes, fetchMyClasses, isLoading } = useTeacherClassStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => { fetchMyClasses(); }, [fetchMyClasses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyClasses();
    setRefreshing(false);
  }, [fetchMyClasses]);

  const filteredClasses = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const isUpcoming = (c: typeof classes[number]) => {
      if (c.date > todayStr) return true;
      if (c.date < todayStr) return false;
      if (typeof c.startTime !== 'string' || c.startTime.length < 5) return true;
      const h = parseInt(c.startTime.slice(0, 2), 10);
      const min = parseInt(c.startTime.slice(3, 5), 10);
      if (isNaN(h) || isNaN(min)) return true;
      return (h * 60 + min) >= nowMinutes;
    };

    return classes
      .filter(c => (filterMode === 'upcoming' ? isUpcoming(c) : !isUpcoming(c)))
      .sort((a, b) => {
        const cmp = a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date);
        return filterMode === 'upcoming' ? cmp : -cmp;
      });
  }, [classes, filterMode]);

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

  // Só aulas ainda abertas (agendadas ou em andamento) podem ser acessadas para
  // check-in/sessão — uma aula concluída ou cancelada não tem mais ação possível ali.
  const isOpen = (status?: string) => status !== 'completed' && status !== 'cancelled';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}><Text style={styles.title}>Minhas Aulas</Text></View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'past' && styles.filterChipActive]}
          onPress={() => setFilterMode('past')}
        >
          <Text style={[styles.filterChipText, filterMode === 'past' && styles.filterChipTextActive]}>Anteriores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'upcoming' && styles.filterChipActive]}
          onPress={() => setFilterMode('upcoming')}
        >
          <Text style={[styles.filterChipText, filterMode === 'upcoming' && styles.filterChipTextActive]}>Próximas</Text>
        </TouchableOpacity>
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
        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>
              {filterMode === 'upcoming' ? 'Nenhuma aula futura encontrada' : 'Nenhuma aula anterior encontrada'}
            </Text>
          </View>
        ) : (
          filteredClasses.map(cls => {
            const open = isOpen(cls.status);
            return (
              <TouchableOpacity key={cls.id} style={[styles.classCard, !open && styles.classCardDisabled]}
                disabled={!open}
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
                  {open && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ClassSession', { classId: cls.id })}>
                      <Ionicons name="checkbox" size={18} color={colors.primary} />
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Check-in</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


export default MyClassesScreen;

