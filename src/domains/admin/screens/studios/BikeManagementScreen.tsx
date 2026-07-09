import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { bikeAdminService, AdminBike, BikeStatus } from '../../services/bikeAdminService';
import FormInput from '../../../../shared/components/FormInput';
import Button from '../../../../shared/components/Button';
import EmptyState from '../../../../shared/components/EmptyState';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './BikeManagementScreen.styles';

const STATUS_CONFIG: Record<BikeStatus, { label: string; color: string }> = {
  available: { label: 'Disponível', color: '#22C55E' },
  broken: { label: 'Quebrada', color: '#FF453A' },
  maintenance: { label: 'Manutenção', color: '#F59E0B' },
};

const STATUS_OPTIONS: BikeStatus[] = ['available', 'maintenance', 'broken'];

const BikeManagementScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { studioId, studioName } = route.params || {};
  const { showAlert } = useAppAlert();

  const [bikes, setBikes] = useState<AdminBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBike, setEditingBike] = useState<AdminBike | null>(null);
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<BikeStatus>('available');
  const [notes, setNotes] = useState('');
  const [numberError, setNumberError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await bikeAdminService.listByStudio(studioId);
      setBikes(data.sort((a, b) => a.number - b.number));
    } catch (error) {
      captureError(error);
    }
  }, [studioId]);

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
    setEditingBike(null);
    setNumber('');
    setStatus('available');
    setNotes('');
    setNumberError('');
    setModalVisible(true);
  };

  const openEditModal = (bike: AdminBike) => {
    setEditingBike(bike);
    setNumber(String(bike.number));
    setStatus(bike.status);
    setNotes(bike.notes || '');
    setNumberError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const num = Number(number);
    if (!number || isNaN(num) || num <= 0) {
      setNumberError('Número deve ser maior que zero');
      return;
    }
    setSaving(true);
    try {
      if (editingBike) {
        await bikeAdminService.update(editingBike.id, { status, notes: notes || undefined });
      } else {
        await bikeAdminService.create(studioId, { number: num, status });
      }
      setModalVisible(false);
      await load();
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar a bicicleta.') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (bike: AdminBike) => {
    showAlert({
      title: 'Remover bicicleta',
      message: `Tem certeza que deseja remover a bicicleta #${bike.number}?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await bikeAdminService.remove(bike.id);
              setModalVisible(false);
              await load();
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: 'Não foi possível remover a bicicleta.' });
            }
          },
        },
      ],
    });
  };

  const renderItem = ({ item }: { item: AdminBike }) => {
    const cfg = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity style={styles.row} onPress={() => openEditModal(item)}>
        <View style={styles.bikeNumberCircle}>
          <Text style={styles.bikeNumberText}>#{item.number}</Text>
        </View>
        <View style={styles.rowInfo}>
          <View style={[styles.badge, { backgroundColor: cfg.color + '20', alignSelf: 'flex-start' }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.notes ? <Text style={styles.rowNotes} numberOfLines={1}>{item.notes}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

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
          <View>
            <Text style={styles.title}>Bicicletas</Text>
            {studioName ? <Text style={styles.subtitle}>{studioName}</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bikes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState icon="bicycle-outline" title="Nenhuma bicicleta cadastrada" subtitle="Toque em + para cadastrar a primeira" />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editingBike ? `Editar Bicicleta #${editingBike.number}` : 'Nova Bicicleta'}</Text>

            {!editingBike && (
              <FormInput label="Número" required value={number} onChangeText={setNumber} error={numberError} placeholder="1" keyboardType="numeric" />
            )}

            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>Status</Text>
            <View style={styles.statusOptionsRow}>
              {STATUS_OPTIONS.map(opt => {
                const cfg = STATUS_CONFIG[opt];
                const selected = status === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.statusOption, selected && { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}
                    onPress={() => setStatus(opt)}
                  >
                    <Text style={[styles.statusOptionText, selected && { color: cfg.color }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {editingBike && (
              <FormInput label="Observações" value={notes} onChangeText={setNotes} placeholder="Ex: Pedal danificado" />
            )}

            <Button title={editingBike ? 'Salvar' : 'Cadastrar'} onPress={handleSave} loading={saving} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              {editingBike && (
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => handleDelete(editingBike)}>
                  <Text style={[styles.modalCancelText, { color: colors.danger }]}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default BikeManagementScreen;
