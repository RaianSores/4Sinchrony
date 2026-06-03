import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './BookingHistoryScreen.styles';

const BookingHistoryScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { bookings } = useBookingStore();

  const sorted = [...bookings].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Histórico" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhum histórico</Text>
          </View>
        ) : (
          sorted.map(b => (
            <View key={b.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View style={[styles.dot, { backgroundColor: b.status === 'confirmed' ? colors.success : colors.danger }]} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyClassName}>{b.class.name}</Text>
                  <Text style={styles.historyInstructor}>{b.class.instructor}</Text>
                  <Text style={styles.historyDate}>{b.class.date} às {b.class.startTime}</Text>
                </View>
              </View>
              <Text style={[styles.historyStatus, { color: b.status === 'confirmed' ? colors.success : colors.danger }]}>
                {b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};



export default BookingHistoryScreen;
