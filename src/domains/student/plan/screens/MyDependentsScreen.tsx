import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import Header from '../../../../shared/components/Header';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { dependentService, Dependent } from '../services/dependentService';
import ListItemCard from '../../../../shared/components/ListItemCard';
import EmptyState from '../../../../shared/components/EmptyState';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { formatCPF, cleanCPF } from '../../../../shared/utils/validateCPF';
import { mkStyles } from './MyDependentsScreen.styles';

const MyDependentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Dependent | null>(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [canBook, setCanBook] = useState(true);
  const [canCancel, setCanCancel] = useState(true);
  const [canViewHistory, setCanViewHistory] = useState(true);
  const [nameError, setNameError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await dependentService.list();
      setDependents(data);
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

  const openAddModal = () => {
    setEditing(null); setName(''); setCpf(''); setCanBook(true); setCanCancel(true); setCanViewHistory(true); setNameError(''); setModalVisible(true);
  };

  const openEditModal = (d: Dependent) => {
    setEditing(d); setName(d.name); setCpf(d.cpf ?? ''); setCanBook(d.canBook); setCanCancel(d.canCancel); setCanViewHistory(d.canViewHistory); setNameError(''); setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        cpf: cleanCPF(cpf) || undefined,
        canBook, canCancel, canViewHistory,
        active: editing?.active ?? true,
      };
      if (editing) {
        await dependentService.update(editing.id, payload);
      } else {
        await dependentService.create(payload);
      }
      setModalVisible(false);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar o dependente.') });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    if (!editing) return;
    showAlert({
      title: 'Remover dependente',
      message: `Remover ${editing.name}? Reservas já confirmadas dele continuam valendo.`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await dependentService.remove(editing.id);
              setModalVisible(false);
              await load();
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível remover o dependente.') });
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    });
  };

  const permsSummary = (d: Dependent) => {
    const perms = [d.canBook && 'reservar', d.canCancel && 'cancelar', d.canViewHistory && 'histórico'].filter(Boolean);
    return perms.length ? perms.join(' · ') : 'sem permissões';
  };

  const renderItem = ({ item }: { item: Dependent }) => (
    <ListItemCard
      icon="person"
      title={item.name}
      subtitle={permsSummary(item)}
      badge={{ label: item.active ? 'Ativo' : 'Inativo', variant: item.active ? 'success' : 'danger' }}
      onPress={() => openEditModal(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="Meus Dependentes"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={dependents}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={
            <Text style={styles.intro}>
              Dependentes são pessoas do seu pacote família. Cada um tem o próprio saldo de créditos e permissões.
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Nenhum dependente"
              subtitle="Toque em + para adicionar. Disponível em pacotes família."
            />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>{editing ? 'Editar Dependente' : 'Novo Dependente'}</Text>

                <FormInput label="Nome" required value={name} onChangeText={setName} error={nameError} placeholder="Nome do dependente" />
                <FormInput label="CPF" value={formatCPF(cpf)} onChangeText={(v) => setCpf(cleanCPF(v).slice(0, 11))} placeholder="000.000.000-00 (opcional)" keyboardType="numeric" maxLength={14} />

                <FormToggle label="Pode reservar aulas" value={canBook} onValueChange={setCanBook} />
                <FormToggle label="Pode cancelar reservas" value={canCancel} onValueChange={setCanCancel} />
                <FormToggle label="Pode ver histórico" value={canViewHistory} onValueChange={setCanViewHistory} />

                <Button title={editing ? 'Salvar' : 'Adicionar'} onPress={handleSave} loading={saving} />

                <View style={styles.modalActions}>
                  {editing && (
                    <TouchableOpacity style={styles.removeButton} onPress={handleRemove} disabled={removing}>
                      <Text style={styles.removeText}>{removing ? 'Removendo…' : 'Remover'}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default MyDependentsScreen;
