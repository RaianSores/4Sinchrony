import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { teacherAdminService, AdminTeacher } from '../../services/teacherAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './TeacherListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const TeacherListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await teacherAdminService.list();
      setTeachers(data);
    } catch (error) {
      captureError(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // Refaz a busca sempre que a tela volta a ficar em foco (ex: depois de criar/editar
  // um professor e voltar da tela de formulário).
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle rápido ativar/desativar direto na lista — paridade com o ERP
  // (`studio-wellness-erp/src/app/admin/teachers/page.tsx`), que já tem essa ação na linha da
  // tabela em vez de exigir abrir o formulário. Sem confirmação, mesmo comportamento do ERP.
  const handleToggleActive = async (item: AdminTeacher, value: boolean) => {
    setTogglingId(item.id);
    try {
      if (value) await teacherAdminService.activate(item.id);
      else await teacherAdminService.deactivate(item.id);
      setTeachers(prev => prev.map(t => (t.id === item.id ? { ...t, active: value } : t)));
    } catch (error) {
      captureError(error);
    } finally {
      setTogglingId(null);
    }
  };

  const renderItem = ({ item }: { item: AdminTeacher }) => {
    const specialtiesLabel = item.specialties.length > 0
      ? ` · ${item.specialties.length} especialidade${item.specialties.length !== 1 ? 's' : ''}`
      : '';
    return (
      <ListItemCard
        icon="school"
        title={item.name}
        subtitle={`${item.email}${specialtiesLabel}`}
        onPress={() => navigation.navigate('TeacherForm', { teacherId: item.id })}
        rightElement={
          <Switch
            value={item.active}
            onValueChange={(value) => handleToggleActive(item, value)}
            disabled={togglingId === item.id}
            trackColor={{ true: colors.primary }}
          />
        }
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
        <Text style={styles.title}>Professores</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('TeacherForm', {})}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome ou email..." />
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
            teachers.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} professor{filtered.length !== 1 ? 'es' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="school-outline"
              title={search ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
              subtitle={search ? 'Tente buscar por outro nome ou email' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TeacherListScreen;
