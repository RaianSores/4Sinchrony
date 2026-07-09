import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { studentAdminService, StudentHistoryItem } from '../../services/studentAdminService';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './StudentHistoryScreen.styles';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: '#1287AF' },
  attended: { label: 'Compareceu', color: '#22C55E' },
  no_show: { label: 'Faltou', color: '#FF453A' },
  cancelled: { label: 'Cancelou', color: '#F59E0B' },
};

const StudentHistoryScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { studentId, studentName } = route.params || {};

  const [items, setItems] = useState<StudentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAdminService.getHistory(studentId)
      .then(setItems)
      .catch(error => captureError(error))
      .finally(() => setLoading(false));
  }, [studentId]);

  const renderItem = ({ item }: { item: StudentHistoryItem }) => {
    const cfg = STATUS_CONFIG[item.status] || { label: item.status, color: colors.textSecondary };
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Histórico de Aulas</Text>
          {studentName ? <Text style={styles.subtitle}>{studentName}</Text> : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="time-outline" title="Nenhum histórico encontrado" subtitle="Esse aluno ainda não participou de nenhuma aula" />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default StudentHistoryScreen;
