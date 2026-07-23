import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { studioAdminService, AdminStudio } from '../../services/studioAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './StudioListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const StudioListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [studios, setStudios] = useState<AdminStudio[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Toggle de status inline (padrão de todas as listas). activate/deactivate só devolvem
  // {success:true}, então atualizamos o estado local de forma otimista.
  const handleToggleActive = async (item: AdminStudio, value: boolean) => {
    setTogglingId(item.id);
    try {
      if (value) await studioAdminService.activate(item.id);
      else await studioAdminService.deactivate(item.id);
      setStudios(prev => prev.map(s => (s.id === item.id ? { ...s, active: value } : s)));
    } catch (error) {
      captureError(error);
    } finally {
      setTogglingId(null);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await studioAdminService.list();
      setStudios(data);
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

  const filtered = studios.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: AdminStudio }) => (
    <ListItemCard
      icon="business"
      title={item.name}
      subtitle={`${item.address} · ${item.capacity} vagas · ${item.openingTime}–${item.closingTime}`}
      onPress={() => navigation.navigate('StudioForm', { studioId: item.id })}
      rightElement={
        <Switch
          value={item.active}
          onValueChange={(value) => handleToggleActive(item, value)}
          disabled={togglingId === item.id}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Estúdios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('StudioForm', {})}>
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
            studios.length > 0 ? (
              <Text style={styles.resultCount}>{filtered.length} estúdio{filtered.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title={search ? 'Nenhum estúdio encontrado' : 'Nenhum estúdio cadastrado'}
              subtitle={search ? 'Tente buscar por outro nome ou endereço' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default StudioListScreen;
