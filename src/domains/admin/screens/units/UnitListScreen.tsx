import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { unitAdminService, AdminUnit } from '../../services/unitAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './UnitListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const UnitListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await unitAdminService.list();
      setUnits(data);
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

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.address ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: AdminUnit }) => {
    const subtitleParts = [item.address, item.studiosCount != null ? `${item.studiosCount} sala${item.studiosCount !== 1 ? 's' : ''}` : null].filter(Boolean);
    return (
      <ListItemCard
        icon="business"
        title={item.name}
        badge={{ label: item.active ? 'Ativo' : 'Inativo', variant: item.active ? 'success' : 'danger' }}
        subtitle={subtitleParts.join(' · ') || undefined}
        onPress={() => navigation.navigate('UnitForm', { unitId: item.id })}
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
        <Text style={styles.title}>Unidades</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('UnitForm', {})}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome ou endereço..." />
      </View>

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered.filter(i => matchesStatus(statusFilter, i.active))}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            units.length > 0 ? (
              <Text style={styles.resultCount}>{filtered.length} unidade{filtered.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title={search ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
              subtitle={search ? 'Tente buscar por outro nome ou endereço' : 'Toque em + para cadastrar a primeira'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default UnitListScreen;
