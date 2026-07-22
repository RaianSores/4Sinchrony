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
import { formatCPF, cleanCPF, validateCPF } from '../../../../shared/utils/validateCPF';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { mkStyles } from './MyDependentsScreen.styles';

const PHONE_REGEX = /^\d{10,11}$/;

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [canBook, setCanBook] = useState(true);
  const [canCancel, setCanCancel] = useState(true);
  const [canViewHistory, setCanViewHistory] = useState(true);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [phoneError, setPhoneError] = useState('');

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

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setCpf(''); setPhone('');
    setCanBook(true); setCanCancel(true); setCanViewHistory(true);
    setNameError(''); setEmailError(''); setPasswordError(''); setCpfError(''); setPhoneError('');
  };

  const openAddModal = () => {
    setEditing(null); resetForm(); setModalVisible(true);
  };

  const openEditModal = (d: Dependent) => {
    setEditing(d); resetForm();
    setName(d.name); setEmail(d.email ?? ''); setCpf(d.cpf ?? ''); setPhone(cleanPhone(d.phone ?? ''));
    setCanBook(d.canBook); setCanCancel(d.canCancel); setCanViewHistory(d.canViewHistory);
    setModalVisible(true);
  };

  const handleSave = async () => {
    let hasError = false;
    if (!name.trim()) { setNameError('Nome é obrigatório'); hasError = true; } else setNameError('');
    if (!email.trim()) { setEmailError('Email é obrigatório'); hasError = true; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Email inválido'); hasError = true; }
    else setEmailError('');
    // Senha obrigatória só na criação (o dependente loga somente-leitura). Na edição fica opcional
    // — só troca a senha se algo for digitado.
    if (!editing && password.length < 6) { setPasswordError('Mínimo de 6 caracteres'); hasError = true; }
    else if (editing && password.length > 0 && password.length < 6) { setPasswordError('Mínimo de 6 caracteres'); hasError = true; }
    else setPasswordError('');
    // CPF e telefone são obrigatórios no dependente (mesmo padrão do cadastro do aluno).
    const cpfClean = cleanCPF(cpf);
    if (!cpfClean) { setCpfError('CPF é obrigatório'); hasError = true; }
    else if (!validateCPF(cpfClean)) { setCpfError('CPF inválido'); hasError = true; }
    else setCpfError('');
    const phoneClean = cleanPhone(phone);
    if (!phoneClean) { setPhoneError('Telefone é obrigatório'); hasError = true; }
    else if (!PHONE_REGEX.test(phoneClean)) { setPhoneError('Telefone inválido (DDD + número)'); hasError = true; }
    else setPhoneError('');
    if (hasError) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
        cpf: cpfClean || undefined,
        phone: phoneClean || undefined,
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
      subtitle={item.email || permsSummary(item)}
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
              Dependentes são pessoas do seu pacote família (ex: filhos). Cada um tem a{' '}
              <Text style={styles.introStrong}>própria cota</Text> de créditos dentro do seu pacote — quem reserva é
              você. O dependente entra no app com o próprio login, mas apenas para visualizar as aulas.
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
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing ? 'Editar Dependente' : 'Novo Dependente'}</Text>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <FormInput label="Nome" required value={name} onChangeText={setName} error={nameError} placeholder="Nome do dependente" />
                <FormInput label="Email" required value={email} onChangeText={setEmail} error={emailError} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
                <FormInput
                  label={editing ? 'Nova senha (opcional)' : 'Senha'}
                  required={!editing}
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  placeholder={editing ? 'Deixe em branco para manter' : 'Mínimo de 6 caracteres'}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text style={styles.loginHint}>O dependente usa esse login apenas para visualizar aulas e histórico. Quem reserva é você.</Text>
                <FormInput label="CPF" required value={formatCPF(cpf)} onChangeText={(v) => setCpf(cleanCPF(v).slice(0, 11))} error={cpfError} placeholder="000.000.000-00" keyboardType="numeric" maxLength={14} />
                <FormInput label="Telefone" required value={formatPhone(phone)} onChangeText={(v) => setPhone(cleanPhone(v).slice(0, 11))} error={phoneError} placeholder="(63) 99999-9999" keyboardType="phone-pad" maxLength={15} />
                <Text style={styles.loginHint}>O endereço do dependente é herdado do seu cadastro (responsável) automaticamente.</Text>

                <Text style={styles.permsLabel}>O que você pode fazer por ele(a):</Text>
                <FormToggle label="Reservar aulas por ele(a)" value={canBook} onValueChange={setCanBook} />
                <FormToggle label="Cancelar reservas dele(a)" value={canCancel} onValueChange={setCanCancel} />
                <FormToggle label="Ver o histórico dele(a)" value={canViewHistory} onValueChange={setCanViewHistory} />
              </ScrollView>

              <View style={styles.modalFooter}>
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
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default MyDependentsScreen;
