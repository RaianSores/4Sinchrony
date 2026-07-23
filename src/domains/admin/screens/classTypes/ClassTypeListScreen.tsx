import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { classTypeAdminService, AdminClassType } from '../../services/classTypeAdminService';
import SearchBar from '../../../../shared/components/SearchBar';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './ClassTypeListScreen.styles';
import StatusFilter, { DEFAULT_STATUS_FILTER, matchesStatus, type StatusFilterValue } from '../../../../shared/components/StatusFilter';

const ClassTypeListScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [classTypes, setClassTypes] = useState<AdminClassType[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<AdminClassType | null>(null);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [usesBikes, setUsesBikes] = useState(false);
  const [nameError, setNameError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await classTypeAdminService.list();
      setClassTypes(data);
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

  const filtered = classTypes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setEditing(null);
    setName('');
    setActive(true);
    setUsesBikes(false);
    setNameError('');
    setModalVisible(true);
  };

  const openEditModal = (type: AdminClassType) => {
    setEditing(type);
    setName(type.name);
    setActive(type.active);
    setUsesBikes(!!type.usesBikes);
    setNameError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), active, usesBikes };
      if (editing) {
        await classTypeAdminService.update(editing.id, payload);
      } else {
        await classTypeAdminService.create(payload);
      }
      setModalVisible(false);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar o tipo de aula.') });
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: AdminClassType }) => (
    <ListItemCard
      icon="pricetag"
      title={item.name}
      subtitle={item.usesBikes ? 'Usa bicicletas' : undefined}
      badge={{ label: item.active ? 'Ativo' : 'Inativo', variant: item.active ? 'success' : 'danger' }}
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
          <Text style={styles.title}>Tipos de Aula</Text>
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
            classTypes.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} tipo{filtered.length !== 1 ? 's' : ''} de aula
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="pricetag-outline"
              title={search ? 'Nenhum tipo encontrado' : 'Nenhum tipo de aula cadastrado'}
              subtitle={search ? 'Tente buscar por outro nome' : 'Toque em + para cadastrar o primeiro'}
            />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Tipo de Aula' : 'Novo Tipo de Aula'}</Text>

              <FormInput label="Nome" required value={name} onChangeText={setName} error={nameError} placeholder="Ex: Yoga, Pilates..." />
              <FormToggle label="Ativo" description="Tipos inativos não aparecem pra escolher em novas aulas" value={active} onValueChange={setActive} />
              <FormToggle
                label="Usa bicicletas"
                description="Aulas desse tipo mostram o grid de bikes (ocupadas/disponíveis) pro aluno escolher"
                value={usesBikes}
                onValueChange={setUsesBikes}
              />

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

export default ClassTypeListScreen;
