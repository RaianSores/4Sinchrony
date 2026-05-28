import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import Header from '../../../shared/components/Header';
import { theme } from '../../../shared/theme';

const ClassHistoryScreen = ({ navigation }: any) => {
  const { bookings } = useBookingStore();

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.class.date + 'T' + b.class.startTime).getTime() - new Date(a.class.date + 'T' + a.class.startTime).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Histórico de Aulas" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma aula realizada</Text>
            <Text style={styles.emptySubtitle}>Seu histórico aparecerá aqui</Text>
          </View>
        ) : (
          sorted.map(b => (
            <View key={b.id} style={styles.historyCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={b.status === 'confirmed' ? 'checkmark' : 'close'}
                    size={20}
                    color={b.status === 'confirmed' ? theme.colors.success : theme.colors.danger}
                  />
                </View>
                <View>
                  <Text style={styles.className}>{b.class.name}</Text>
                  <Text style={styles.instructor}>{b.class.instructor}</Text>
                </View>
              </View>
              <Text style={styles.date}>
                {b.class.date} {b.class.startTime}
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
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: theme.colors.textSecondary, fontSize: 15, marginTop: 8, textAlign: 'center' },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  className: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  instructor: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  date: { color: theme.colors.textSecondary, fontSize: 13 },
});

export default ClassHistoryScreen;
