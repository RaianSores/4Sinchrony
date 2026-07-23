import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { benefitAdminService, AdminBenefit } from '../../services/benefitAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from '../classTypes/ClassTypeListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const BenefitListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [benefits, setBenefits] = useState<AdminBenefit[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Toggle de status inline (padrão de todas as listas). O PUT não é partial, então mandamos
  // o objeto completo com o active invertido.
  const handleToggleActive = async (item: AdminBenefit, value: boolean) => {
    setTogglingId(item.id);
    try {
      await benefitAdminService.update(item.id, { ...item, active: value } as any);
      setBenefits(prev => prev.map(x => (x.id === item.id ? { ...x, active: value } : x)));
    } catch (error) {
      captureError(error);
    } finally {
      setTogglingId(null);
    }
  };
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<AdminBenefit | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [active, setActive] = useState(true);
  const [nameError, setNameError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await benefitAdminService.list();
      setBenefits(data);
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

  const filtered = benefits.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setEditing(null); setName(''); setDescription(''); setIcon(''); setActive(true); setNameError(''); setModalVisible(true);
  };

  const openEditModal = (b: AdminBenefit) => {
    setEditing(b); setName(b.name); setDescription(b.description ?? ''); setIcon(b.icon ?? ''); setActive(b.active); setNameError(''); setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim() || undefined, icon: icon.trim() || undefined, active };
      if (editing) {
        await benefitAdminService.update(editing.id, payload);
      } else {
        await benefitAdminService.create(payload);
      }
      setModalVisible(false);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar o benefício.') });
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: AdminBenefit }) => (
    <ListItemCard
      icon="gift"
      title={`${item.icon ? item.icon + ' ' : ''}${item.name}`}
      subtitle={item.description || undefined}
      onPress={() => openEditModal(item)}
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
          <Text style={styles.title}>Benefícios</Text>
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
            benefits.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} benefício{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="gift-outline"
              title={search ? 'Nenhum benefício encontrado' : 'Nenhum benefício cadastrado'}
              subtitle={search ? 'Tente buscar por outro nome' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Benefício' : 'Novo Benefício'}</Text>

              <FormInput label="Nome" required value={name} onChangeText={setName} error={nameError} placeholder="Ex: Sauna, Estacionamento" />
              <FormInput label="Descrição" value={description} onChangeText={setDescription} placeholder="Opcional" />
              <FormInput label="Ícone (emoji)" value={icon} onChangeText={setIcon} placeholder="Ex: 🧖 🅿️ (opcional)" />
              <FormToggle label="Ativo" description="Benefícios inativos não aparecem pra associar a pacotes" value={active} onValueChange={setActive} />

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

export default BenefitListScreen;
