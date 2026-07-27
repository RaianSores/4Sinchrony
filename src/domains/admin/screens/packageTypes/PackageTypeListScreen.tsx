import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { packageTypeAdminService, AdminPackageType } from '../../services/packageTypeAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './PackageTypeListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const PackageTypeListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [types, setTypes] = useState<AdminPackageType[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<AdminPackageType | null>(null);
  const [name, setName] = useState('');
  const [rank, setRank] = useState('');
  const [isFamily, setIsFamily] = useState(false);
  const [active, setActive] = useState(true);
  const [nameError, setNameError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await packageTypeAdminService.list();
      setTypes(data);
    } catch (error) {
      captureError(error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = types
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  const openAddModal = () => {
    setEditing(null); setName(''); setRank(''); setIsFamily(false); setActive(true); setNameError(''); setModalVisible(true);
  };

  const openEditModal = (t: AdminPackageType) => {
    setEditing(t); setName(t.name); setRank(t.rank != null ? String(t.rank) : ''); setIsFamily(t.isFamily); setActive(t.active); setNameError(''); setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      const core = {
        name: name.trim(),
        active,
        isFamily,
        rank: rank.trim() === '' ? undefined : Number(rank),
      };
      if (editing) {
        // PUT não é partial — manda o objeto completo (preserva as regras padrão do ERP).
        await packageTypeAdminService.update(editing.id, { ...editing, ...core });
      } else {
        await packageTypeAdminService.create(core);
      }
      setModalVisible(false);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar o tipo de pacote.') });
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: AdminPackageType }) => (
    <ListItemCard
      icon="albums"
      title={item.name}
        badge={{ label: item.active ? 'Ativo' : 'Inativo', variant: item.active ? 'success' : 'danger' }}
      subtitle={item.isFamily ? 'Pacote família' : undefined}
      onPress={() => openEditModal(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Tipos de Pacote</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nome..." />
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
            types.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} tipo{filtered.length !== 1 ? 's' : ''} de pacote
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="albums-outline"
              title={search ? 'Nenhum tipo encontrado' : 'Nenhum tipo de pacote cadastrado'}
              subtitle={search ? 'Tente buscar por outro nome' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Tipo de Pacote' : 'Novo Tipo de Pacote'}</Text>

              <FormInput label="Nome" required value={name} onChangeText={setName} error={nameError} placeholder="Ex: Básico, Premium, Família" />
              <FormInput label="Ordem de exibição" value={rank} onChangeText={setRank} placeholder="1" keyboardType="numeric" />
              <FormToggle label="Pacote família" description="Permite adicionar dependentes com saldo de créditos próprio" value={isFamily} onValueChange={setIsFamily} />
              <FormToggle label="Ativo" description="Tipos inativos não aparecem pra escolher em novos pacotes" value={active} onValueChange={setActive} />

              <Text style={styles.helperNote}>
                As regras padrão detalhadas (limites, janelas, remarcação, faltas) são configuradas no ERP.
              </Text>

              <Button title={editing ? 'Salvar' : 'Cadastrar'} onPress={handleSave} loading={saving} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default PackageTypeListScreen;
