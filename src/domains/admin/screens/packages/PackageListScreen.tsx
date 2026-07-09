import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { packageAdminService, AdminPackage } from '../../services/packageAdminService';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './PackageListScreen.styles';

// Sem busca/filtro de propósito — o ERP também não tem (a lista de pacotes é curada e
// tipicamente pequena, diferente de listagens de alunos/aulas que crescem sem limite).
const PackageListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await packageAdminService.list();
      setPackages([...data].sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      captureError(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderItem = ({ item }: { item: AdminPackage }) => {
    const subtitle = `R$ ${item.price.toFixed(2)} · ${item.credits} aula${item.credits !== 1 ? 's' : ''} · ${item.validityDays} dias${item.popular ? ' · Popular' : ''}`;
    return (
      <ListItemCard
        icon={item.popular ? 'star' : 'albums'}
        title={item.name}
        subtitle={subtitle}
        badge={{ label: item.active ? 'Ativo' : 'Inativo', variant: item.active ? 'success' : 'danger' }}
        onPress={() => navigation.navigate('PackageForm', { packageId: item.id })}
      />
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
        <Text style={styles.title}>Pacotes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PackageForm', {})}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            packages.length > 0 ? (
              <Text style={styles.resultCount}>
                {packages.length} pacote{packages.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon="albums-outline" title="Nenhum pacote cadastrado" subtitle="Toque em + para cadastrar o primeiro" />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PackageListScreen;
