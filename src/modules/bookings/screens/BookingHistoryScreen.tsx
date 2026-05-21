import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../store/useBookingStore';
import Header from '../../../shared/components/Header';
import { theme } from '../../../shared/theme';

const BookingHistoryScreen = ({ navigation }: any) => {
  const { bookings } = useBookingStore();

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Histórico" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhum histórico</Text>
          </View>
        ) : (
          sorted.map(b => (
            <View key={b.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: b.status === 'confirmed' ? theme.colors.success : theme.colors.danger },
                  ]}
                />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyClassName}>{b.class.name}</Text>
                  <Text style={styles.historyInstructor}>{b.class.instructor}</Text>
                  <Text style={styles.historyDate}>
                    {b.class.date} às {b.class.startTime}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.historyStatus,
                  { color: b.status === 'confirmed' ? theme.colors.success : theme.colors.danger },
                ]}
              >
                {b.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: theme.colors.textSecondary, fontSize: 20, fontWeight: '700', marginTop: 16 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  historyInfo: { flex: 1 },
  historyClassName: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  historyInstructor: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  historyDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  historyStatus: { fontSize: 12, fontWeight: '600' },
});

export default BookingHistoryScreen;
