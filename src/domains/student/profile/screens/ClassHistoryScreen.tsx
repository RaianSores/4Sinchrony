import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBookingStore } from '../../bookings/store/useBookingStore';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './ClassHistoryScreen.styles';

const ClassHistoryScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { bookings } = useBookingStore();

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.class.date + 'T' + b.class.startTime).getTime() - new Date(a.class.date + 'T' + a.class.startTime).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Histórico de Aulas" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={colors.border} />
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
                    color={b.status === 'confirmed' ? colors.success : colors.danger}
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



export default ClassHistoryScreen;
