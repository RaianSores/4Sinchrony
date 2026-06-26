import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { useClassStore } from '../store/useClassStore';
import Header from '../../../../shared/components/Header';
import ClassCard from '../../../../shared/components/ClassCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './ClassesScreen.styles';

const TODAS = { label: 'Todas', value: '' };

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dt = new Date(+y, +m - 1, +d);
  return `${days[dt.getDay()]}, ${+d} ${months[+m - 1]}`;
};

const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

const ClassesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { classes, filters, isLoading, fetchClasses, setFilters } = useClassStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [classTypes, setClassTypes] = useState<{ label: string; value: string }[]>([TODAS]);

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

  useEffect(() => { fetchClasses(); }, [filters.date, filters.type, fetchClasses]);

  useFocusEffect(useCallback(() => {
    setFilters({ date: '', type: '' });
    fetchClasses();
  }, [fetchClasses, setFilters]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, [fetchClasses]);

  const handleDateChange = (newDate: string) => { setFilters({ date: newDate }); setShowCalendar(false); };
  const clearDateFilter = () => setFilters({ date: '' });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof classes>();
    classes.forEach(c => { const list = map.get(c.date) || []; list.push(c); map.set(c.date, list); });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [classes]);

  const markedDates = filters.date ? { [filters.date]: { selected: true, selectedColor: colors.primary } } : {};
  const hasActiveFilter = filters.date !== '' || filters.type !== '';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Agenda" rightComponent={
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
        </TouchableOpacity>
      } />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
      >
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

        {isLoading && classes.length === 0 ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
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
        ) : (
          grouped.map(([date, dayClasses]) => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <View style={styles.dateHeaderLeft}>
                  <Text style={styles.dateHeaderDay}>{formatDate(date)}</Text>
                  {isToday(date) && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Hoje</Text></View>}
                </View>
                <TouchableOpacity onPress={() => handleDateChange(date)}>
                  <Text style={styles.dateHeaderAction}>{dayClasses.length} aula{dayClasses.length > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              </View>
              {dayClasses.map(c => (
                <ClassCard key={c.id} instructor={c.instructor} instructorAvatar={c.instructorAvatar}
                  className={c.name} time={c.startTime} duration={c.duration} studio={c.studio?.name || ''}
                  availableSpots={c.availableSpots} totalSpots={c.totalSpots}
                  onPress={() => navigation.navigate('ClassDetail', { classId: c.id })} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

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
