import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { studioAdminService, AdminStudio } from '../../services/studioAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import { UnitSelect } from '../../components/UnitPicker';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { formatTime } from '../../../../shared/utils/formatTime';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './StudioFormScreen.styles';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  capacity?: string;
  openingTime?: string;
  closingTime?: string;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const StudioFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { studioId } = route.params || {};
  const isEdit = !!studioId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [unitId, setUnitId] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    studioAdminService.getById(studioId).then((studio?: AdminStudio) => {
      if (cancelled || !studio) return;
      setName(studio.name);
      setEmail(studio.email);
      setPhone(cleanPhone(studio.phone));
      setAddress(studio.address);
      setCapacity(String(studio.capacity));
      setUnitId(studio.unitId || '');
      setOpeningTime(studio.openingTime);
      setClosingTime(studio.closingTime);
      setActive(studio.active);
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEdit, studioId]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email inválido';
    if (!phone.trim()) errs.phone = 'Telefone é obrigatório';
    if (!address.trim()) errs.address = 'Endereço é obrigatório';
    const cap = Number(capacity);
    if (!capacity || isNaN(cap) || cap <= 0) errs.capacity = 'Capacidade deve ser maior que zero';
    if (!TIME_RE.test(openingTime)) errs.openingTime = 'Use o formato HH:MM';
    if (!TIME_RE.test(closingTime)) errs.closingTime = 'Use o formato HH:MM';
    if (TIME_RE.test(openingTime) && TIME_RE.test(closingTime) && openingTime >= closingTime) {
      errs.closingTime = 'Deve ser depois da abertura';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), phone, address, capacity: Number(capacity), openingTime, closingTime, unitId: unitId || undefined };
      if (isEdit) {
        await studioAdminService.update(studioId, payload);
      } else {
        await studioAdminService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(error, isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar o estúdio.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setTogglingActive(true);
    try {
      if (active) await studioAdminService.deactivate(studioId);
      else await studioAdminService.activate(studioId);
      setActive(!active);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível alterar o status do estúdio.' });
    } finally {
      setTogglingActive(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>{isEdit ? 'Editar Estúdio' : 'Novo Estúdio'}</Text>
            <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar unidade no sistema'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput label="Nome da unidade" required value={name} onChangeText={setName} error={errors.name} placeholder="Ex: Unidade Centro" />
        <FormInput label="Email" required value={email} onChangeText={setEmail} error={errors.email} placeholder="unidade@studio.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          label="Telefone"
          required
          value={formatPhone(phone)}
          onChangeText={(v) => setPhone(cleanPhone(v))}
          error={errors.phone}
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
        <FormInput label="Endereço" required value={address} onChangeText={setAddress} error={errors.address} placeholder="Rua, número, bairro" />
        <FormInput label="Capacidade" required value={capacity} onChangeText={setCapacity} error={errors.capacity} placeholder="20" keyboardType="numeric" />
        <UnitSelect value={unitId} onChange={setUnitId} label="Unidade (prédio)" />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Abertura" required value={openingTime} onChangeText={(v) => setOpeningTime(formatTime(v))} error={errors.openingTime} placeholder="06:00" keyboardType="numeric" maxLength={5} />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Fechamento" required value={closingTime} onChangeText={(v) => setClosingTime(formatTime(v))} error={errors.closingTime} placeholder="22:00" keyboardType="numeric" maxLength={5} />
          </View>
        </View>

        {isEdit && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('BikeManagement', { studioId, studioName: name })}>
            <Ionicons name="bicycle-outline" size={16} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Gerenciar Bicicletas</Text>
          </TouchableOpacity>
        )}

        <FormToggle
          label={active ? 'Studio ativo' : 'Studio inativo'}
          description="Studios inativos não aparecem para agendamento de novas aulas"
          value={active}
          onValueChange={setActive}
          disabled={togglingActive}
        />

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Estúdio'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default StudioFormScreen;
