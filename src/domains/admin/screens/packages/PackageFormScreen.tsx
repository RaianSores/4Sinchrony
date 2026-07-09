import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { packageAdminService, AdminPackage, PackageFormData } from '../../services/packageAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './PackageFormScreen.styles';

interface FormErrors {
  name?: string;
  credits?: string;
  price?: string;
  validityDays?: string;
}

const PackageFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { packageId } = route.params || {};
  const isEdit = !!packageId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [price, setPrice] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    packageAdminService.getById(packageId).then((pkg?: AdminPackage) => {
      if (cancelled || !pkg) return;
      setName(pkg.name);
      setDescription(pkg.description || '');
      setCredits(String(pkg.credits));
      setPrice(String(pkg.price));
      setValidityDays(String(pkg.validityDays));
      setDisplayOrder(String(pkg.displayOrder));
      setPopular(pkg.popular);
      setActive(pkg.active);
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEdit, packageId]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    const cred = Number(credits);
    if (!credits || isNaN(cred) || cred <= 0) errs.credits = 'Deve ser maior que zero';
    const pr = Number(price);
    if (!price || isNaN(pr) || pr <= 0) errs.price = 'Deve ser maior que zero';
    const days = Number(validityDays);
    if (!validityDays || isNaN(days) || days <= 0) errs.validityDays = 'Deve ser maior que zero';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload: PackageFormData = {
        name: name.trim(),
        description: description.trim() || undefined,
        credits: Number(credits),
        price: Number(price),
        validityDays: Number(validityDays),
        popular,
        active: isEdit ? active : true,
        displayOrder: displayOrder ? Number(displayOrder) : 99,
      };
      if (isEdit) {
        await packageAdminService.update(packageId, payload);
      } else {
        await packageAdminService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(error, isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar o pacote.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setTogglingActive(true);
    try {
      const updated = await packageAdminService.toggle(packageId);
      setActive(updated.active);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível alterar o status do pacote.' });
    } finally {
      setTogglingActive(false);
    }
  };

  const pricePerCreditPreview = Number(price) > 0 && Number(credits) > 0
    ? (Number(price) / Number(credits)).toFixed(2)
    : null;

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
            <Text style={styles.title}>{isEdit ? 'Editar Pacote' : 'Novo Pacote'}</Text>
            <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar pacote no sistema'}</Text>
          </View>
        </View>
        {isEdit && (
          <TouchableOpacity style={styles.statusButton} onPress={handleToggleActive} disabled={togglingActive}>
            {togglingActive ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={styles.statusButtonText}>{active ? 'Desativar' : 'Ativar'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput label="Nome do pacote" required value={name} onChangeText={setName} error={errors.name} placeholder="Ex: 10 Aulas" />
        <FormInput label="Descrição (opcional)" value={description} onChangeText={setDescription} placeholder="Ex: Pacote 10 Aulas" />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Créditos" required value={credits} onChangeText={setCredits} error={errors.credits} placeholder="10" keyboardType="numeric" />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Preço (R$)" required value={price} onChangeText={setPrice} error={errors.price} placeholder="340.00" keyboardType="decimal-pad" />
          </View>
        </View>
        {pricePerCreditPreview ? (
          <Text style={styles.helperText}>R$ {pricePerCreditPreview} por aula (calculado automaticamente)</Text>
        ) : null}

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Validade (dias)" required value={validityDays} onChangeText={setValidityDays} error={errors.validityDays} placeholder="90" keyboardType="numeric" />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Ordem de exibição" value={displayOrder} onChangeText={setDisplayOrder} placeholder="99" keyboardType="numeric" />
          </View>
        </View>

        <FormToggle label="Popular" description="Mostra um destaque de 'mais popular' na loja de pacotes" value={popular} onValueChange={setPopular} />

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Pacote'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default PackageFormScreen;
