import React, { useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './BookingHistoryScreen.styles';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import type { BookingHistoryScreenProps } from '../../../../core/navigation/types/screenProps';

const statusCfg: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmada', color: '#22C55E' },
  attended:  { label: 'Presente',   color: '#22C55E' },
  cancelled: { label: 'Cancelada',  color: '#EF4444' },
  no_show:   { label: 'Ausente',    color: '#F59E0B' },
};

const BookingHistoryScreen = ({ navigation }: BookingHistoryScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { bookings, isLoading, fetchBookings } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    fetchBookings();
  }, [fetchBookings]));

  const sorted = [...bookings].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Histórico" showBack onBackPress={() => navigation.goBack()} />
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
            {...({ backgroundColor: colors.background } as any)}
          />
        }
      >
        {isLoading && sorted.length === 0 ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhum histórico</Text>
          </View>
        ) : (
          sorted.map(b => {
            const cfg = statusCfg[b.status] || statusCfg.cancelled;
            return (
              <View key={b.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[styles.dot, { backgroundColor: cfg.color }]} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyClassName}>{b.class.name}</Text>
                    <Text style={styles.historyInstructor}>{b.class.instructor}</Text>
                    <Text style={styles.historyDate}>{b.class.date} às {b.class.startTime}</Text>
                  </View>
                </View>
                <Text style={[styles.historyStatus, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};



export default BookingHistoryScreen;

