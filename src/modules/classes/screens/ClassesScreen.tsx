import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { useClassStore } from '../store/useClassStore';
import Header from '../../../shared/components/Header';
import ClassCard from '../../../shared/components/ClassCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../shared/theme';

const classTypes = [
  { label: 'Todas', value: '' },
  { label: 'Bike', value: 'bike' },
  { label: 'Boxe', value: 'box' },
  { label: 'Jiu-Jitsu', value: 'jiu-jitsu' },
  { label: 'Dança', value: 'danca' },
];

const calendarTheme = {
  backgroundColor: theme.colors.card,
  calendarBackground: theme.colors.card,
  textSectionTitleColor: theme.colors.textSecondary,
  selectedDayBackgroundColor: theme.colors.primary,
  selectedDayTextColor: theme.colors.black,
  todayTextColor: theme.colors.primary,
  dayTextColor: theme.colors.text,
  textDisabledColor: theme.colors.border,
  dotColor: theme.colors.primary,
  selectedDotColor: theme.colors.black,
  arrowColor: theme.colors.primary,
  monthTextColor: theme.colors.text,
  indicatorColor: theme.colors.primary,
  textDayFontWeight: '500' as const,
  textMonthFontWeight: '700' as const,
  textDayHeaderFontWeight: '600' as const,
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dt = new Date(+y, +m - 1, +d);
  return `${days[dt.getDay()]}, ${+d} ${months[+m - 1]}`;
};

const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

const ClassesScreen = ({ navigation }: any) => {
  const { classes, filters, isLoading, fetchClasses, setFilters } = useClassStore();
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [filters.date, filters.type, fetchClasses]);

  useFocusEffect(
    useCallback(() => {
      setFilters({ date: '', type: '' });
      fetchClasses();
    }, [fetchClasses, setFilters])
  );

  const handleDateChange = (newDate: string) => {
    setFilters({ date: newDate });
    setShowCalendar(false);
  };

  const clearDateFilter = () => {
    setFilters({ date: '' });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof classes>();
    classes.forEach(c => {
      const list = map.get(c.date) || [];
      list.push(c);
      map.set(c.date, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [classes]);

  const markedDates = filters.date
    ? { [filters.date]: { selected: true, selectedColor: theme.colors.primary } }
    : {};

  const hasActiveFilter = filters.date !== '' || filters.type !== '';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Agenda" rightComponent={
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      } />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipContent}
        >
          {classTypes.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, filters.type === t.value && styles.chipActive]}
              onPress={() => setFilters({ type: t.value })}
            >
              <Text style={[styles.chipText, filters.type === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipContent}
        >
          <TouchableOpacity
            style={[styles.chip, !filters.date && styles.chipActive]}
            onPress={clearDateFilter}
          >
            <Text style={[styles.chipText, !filters.date && styles.chipTextActive]}>Todas as datas</Text>
          </TouchableOpacity>

          {[
            { label: 'Hoje', value: new Date().toISOString().split('T')[0] },
            {
              label: 'Amanhã',
              value: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })(),
            },
          ].map(p => (
            <TouchableOpacity
              key={p.value}
              style={[styles.chip, filters.date === p.value && styles.chipActive]}
              onPress={() => handleDateChange(p.value)}
            >
              <Text style={[styles.chipText, filters.date === p.value && styles.chipTextActive]}>{p.label}</Text>
              <Text style={[styles.chipSub, filters.date === p.value && styles.chipSubActive]}>{p.value.slice(5)}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.chip, styles.chipCalendar]}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </ScrollView>

        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.border} />
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
                <ClassCard
                  key={c.id}
                  instructor={c.instructor}
                  instructorAvatar={c.instructorAvatar}
                  className={c.name}
                  time={c.startTime}
                  duration={c.duration}
                  studio={c.studio?.name || ''}
                  availableSpots={c.availableSpots}
                  totalSpots={c.totalSpots}
                  onPress={() => navigation.navigate('ClassDetail', { classId: c.id })}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a data</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Calendar
              current={filters.date || new Date().toISOString().split('T')[0]}
              minDate={'2026-01-01'}
              maxDate={'2026-12-31'}
              onDayPress={(day: any) => handleDateChange(day.dateString)}
              markedDates={markedDates}
              theme={calendarTheme}
              enableSwipeMonths
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  chipRow: { maxHeight: 44, marginBottom: 8 },
  chipContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: theme.colors.grayLight, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: theme.colors.black },
  chipSub: { color: theme.colors.textSecondary, fontSize: 11 },
  chipSubActive: { color: theme.colors.textSecondary },
  chipCalendar: { paddingHorizontal: 12, borderStyle: 'dashed', backgroundColor: theme.colors.background },

  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  dateHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateHeaderDay: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  todayBadge: {
    backgroundColor: theme.colors.primary + '30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  todayBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary },
  dateHeaderAction: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

  loadingText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptySubtitle: { color: theme.colors.textSecondary, fontSize: 15, marginTop: 8 },
  clearFilter: { marginTop: 20 },
  clearFilterText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 8,
  },
  modalButtonText: { color: theme.colors.black, fontSize: 17, fontWeight: '700' },
});

export default ClassesScreen;
