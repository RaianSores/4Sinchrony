import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Modal, RefreshControl, SectionList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { Class } from '../../../../shared/types';
import { useFocusEffect } from '@react-navigation/native';
import { useClassStore } from '../store/useClassStore';
import Header from '../../../../shared/components/Header';
import ClassCard from '../../../../shared/components/ClassCard';
import ClassCardSkeleton from '../../../../shared/components/ClassCardSkeleton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './ClassesScreen.styles';
import type { ClassesScreenProps } from '../../../../core/navigation/types/screenProps';



const TODAS = { label: 'Todas', value: '' };

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dt = new Date(+y, +m - 1, +d);
  return `${days[dt.getDay()]}, ${+d} ${months[+m - 1]}`;
};

const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

const ClassesScreen = ({ navigation }: ClassesScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { classes, filters, isLoading, fetchClasses, setFilters } = useClassStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [classTypes, setClassTypes] = useState<{ label: string; value: string }[]>([TODAS]);
  const mountedRef = useRef(true);

  // Rebuild type chips from classes loaded without a type filter (all types present)
  useEffect(() => {
    if (filters.type === '' && classes.length > 0) {
      const seen = new Set<string>();
      const types: { label: string; value: string }[] = [];
      classes.forEach(c => {
        if (c.type && !seen.has(c.type.toLowerCase())) {
          seen.add(c.type.toLowerCase());
          types.push({ label: c.type, value: c.type.toLowerCase() });
        }
      });
      if (types.length > 0) setClassTypes([TODAS, ...types]);
    }
  }, [classes, filters.type]);

  const calendarTheme = useMemo(() => ({
    backgroundColor: colors.card,
    calendarBackground: colors.card,
    textSectionTitleColor: colors.textSecondary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.white,
    todayTextColor: colors.primary,
    dayTextColor: colors.text,
    textDisabledColor: colors.border,
    dotColor: colors.primary,
    selectedDotColor: colors.white,
    arrowColor: colors.primary,
    monthTextColor: colors.text,
    indicatorColor: colors.primary,
    textDayFontWeight: '500' as const,
    textMonthFontWeight: '700' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  }), [colors]);

  useEffect(() => {
    mountedRef.current = true;
    fetchClasses();
    return () => { mountedRef.current = false; };
  }, [filters.date, filters.type, fetchClasses]);

  useFocusEffect(useCallback(() => {
    setFilters({ date: '', type: '' });
    fetchClasses();
  }, [fetchClasses, setFilters]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    if (mountedRef.current) setRefreshing(false);
  }, [fetchClasses]);

  const handleDateChange = (newDate: string) => { setFilters({ date: newDate }); setShowCalendar(false); };
  const clearDateFilter = () => setFilters({ date: '' });

  const sections = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${y}-${m}-${d}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = classes.filter(c => {
      // Aulas canceladas não devem aparecer na agenda pra reserva, independente da data —
      // uma aula cancelada com data futura ainda passava por esse filtro (só olhava
      // data/horário, nunca o status), aparecendo como reservável quando não deveria.
      if (c.status === 'cancelled' || c.status === 'completed') return false;
      if (c.date > todayLocal) return true;
      if (c.date < todayLocal) return false;
      if (typeof c.startTime !== 'string' || c.startTime.length < 5) return true;
      const h = parseInt(c.startTime.slice(0, 2), 10);
      const min = parseInt(c.startTime.slice(3, 5), 10);
      if (isNaN(h) || isNaN(min)) return true;
      return (h * 60 + min) >= nowMinutes;
    });

    const map = new Map<string, Class[]>();
    upcoming.forEach(c => { const list = map.get(c.date) || []; list.push(c); map.set(c.date, list); });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ title: date, data }));
  }, [classes]);

  const markedDates = filters.date ? { [filters.date]: { selected: true, selectedColor: colors.primary } } : {};
  const hasActiveFilter = filters.date !== '' || filters.type !== '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Agenda" rightComponent={
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
        </TouchableOpacity>
      } />

      <SectionList
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={c => c.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            {...({ backgroundColor: colors.background } as any)}
          />
        }
        ListHeaderComponent={
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
              {classTypes.map(t => (
                <TouchableOpacity key={t.value} style={[styles.chip, filters.type === t.value && styles.chipActive]} onPress={() => setFilters({ type: t.value })}>
                  <Text style={[styles.chipText, filters.type === t.value && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
              <TouchableOpacity style={[styles.chip, !filters.date && styles.chipActive]} onPress={clearDateFilter}>
                <Text style={[styles.chipText, !filters.date && styles.chipTextActive]}>Todas as datas</Text>
              </TouchableOpacity>
              {[
                { label: 'Hoje', value: new Date().toISOString().split('T')[0] },
                { label: 'Amanhã', value: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() },
              ].map(p => (
                <TouchableOpacity key={p.value} style={[styles.chip, filters.date === p.value && styles.chipActive]} onPress={() => handleDateChange(p.value)}>
                  <Text style={[styles.chipText, filters.date === p.value && styles.chipTextActive]}>{p.label}</Text>
                  <Text style={[styles.chipSub, filters.date === p.value && styles.chipSubActive]}>{p.value.slice(5)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.chip, styles.chipCalendar]} onPress={() => setShowCalendar(true)}>
                <Ionicons name="calendar-outline" size={16} color={colors.text} />
              </TouchableOpacity>
            </ScrollView>

          </View>
        }
        ListEmptyComponent={
          isLoading && classes.length === 0 ? (
            <View>
              <ClassCardSkeleton />
              <ClassCardSkeleton />
              <ClassCardSkeleton />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>Nenhuma aula encontrada</Text>
              <Text style={styles.emptySubtitle}>Tente alterar os filtros</Text>
              {hasActiveFilter && (
                <TouchableOpacity style={styles.clearFilter} onPress={() => setFilters({ date: '', type: '' })}>
                  <Text style={styles.clearFilterText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.dateHeader}>
            <View style={styles.dateHeaderLeft}>
              <Text style={styles.dateHeaderDay}>{formatDate(section.title)}</Text>
              {isToday(section.title) && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Hoje</Text></View>}
            </View>
            <TouchableOpacity onPress={() => handleDateChange(section.title)}>
              <Text style={styles.dateHeaderAction}>{section.data.length} aula{section.data.length > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item: c }) => (
          <ClassCard instructor={c.instructor} instructorAvatar={c.instructorAvatar}
            className={c.name} time={c.startTime} duration={c.duration} studio={c.studio?.name || ''}
            availableSpots={c.availableSpots} totalSpots={c.totalSpots}
            onPress={() => navigation.navigate('ClassDetail', { classId: c.id })} />
        )}
      />

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a data</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Calendar current={filters.date || new Date().toISOString().split('T')[0]}
              minDate={(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0]; })()}
              maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })()}
              onDayPress={(day: any) => handleDateChange(day.dateString)}
              markedDates={markedDates} theme={calendarTheme} enableSwipeMonths />
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowCalendar(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



export default ClassesScreen;

