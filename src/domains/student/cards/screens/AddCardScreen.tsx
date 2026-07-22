import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardBrand } from '../../../../shared/types';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './AddCardScreen.styles';
import { useCardStore } from '../store/useCardStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import CardForm from '../components/CardForm';
import CardFlagIcon from '../components/CardFlagIcon';
import { detectBrand } from '../utils/cardUtils';
import { isValidCardNumber, isValidExpiry, isValidCVV, isValidHolderName } from '../validators/cardValidator';
import type { AddCardScreenProps } from '../../../../core/navigation/types/screenProps';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';


interface FormData {
  number: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  nickname: string;
}

interface FormErrors {
  number?: string;
  holderName?: string;
  expiryDate?: string;
  cvv?: string;
}

const AddCardScreen = ({ navigation }: AddCardScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { addCard } = useCardStore();
  const { user } = useAuthStore();
  const { showAlert } = useAppAlert();

  // O cartão exige o endereço do titular (a operadora/Asaas rejeita sem CEP). Se o aluno chega
  // aqui sem CEP, não deixamos ele preencher o cartão à toa — mandamos completar o endereço no
  // perfil com o campo de CEP já focado, e ele volta pra cá depois.
  useEffect(() => {
    if (!user?.cep) {
      showAlert({
        title: 'Complete seu endereço',
        message: 'Para adicionar um cartão precisamos do seu endereço. Vamos preencher seu CEP no perfil — é rápido e o restante é preenchido automaticamente.',
        buttons: [{ text: 'Preencher CEP', onPress: () => (navigation as any).navigate('EditProfile', { focusCep: true }) }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [brand, setBrand] = useState<CardBrand>('Unknown');
  const [formData, setFormData] = useState<FormData>({
    number: '',
    holderName: '',
    expiryDate: '',
    cvv: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const validateField = useCallback((data: FormData, detectedBrand: CardBrand) => {
    const newErrors: FormErrors = {};

    if (data.number.length > 0) {
      const detected = detectBrand(data.number);
      if (!isValidCardNumber(data.number.replace(/\s/g, ''), detected)) {
        newErrors.number = 'Número inválido';
      }
    }

    if (data.holderName.length > 0 && !isValidHolderName(data.holderName)) {
      newErrors.holderName = 'Mínimo de 2 caracteres';
    }

    if (data.expiryDate.length === 5 && !isValidExpiry(data.expiryDate)) {
      newErrors.expiryDate = 'Data inválida ou vencida';
    }

    if (data.cvv.length > 0 && !isValidCVV(data.cvv, detectedBrand)) {
      newErrors.cvv = `CVV deve ter ${detectedBrand === 'Amex' ? 4 : 3} dígitos`;
    }

    return newErrors;
  }, []);

  const handleFormChange = useCallback((data: FormData) => {
    setFormData(data);
    setErrors(validateField(data, brand));
  }, [brand, validateField]);

  const validateAll = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!isValidCardNumber(formData.number.replace(/\s/g, ''), brand)) {
      errs.number = 'Número de cartão inválido';
    }
    if (!isValidHolderName(formData.holderName)) {
      errs.holderName = 'Informe o nome do titular';
    }
    if (!isValidExpiry(formData.expiryDate)) {
      errs.expiryDate = 'Data inválida ou vencida';
    }
    if (!isValidCVV(formData.cvv, brand)) {
      errs.cvv = `CVV deve ter ${brand === 'Amex' ? 4 : 3} dígitos`;
    }

    return errs;
  }, [formData, brand]);

  const handleSave = async () => {
    if (!user?.cep) {
      showAlert({
        title: 'Complete seu endereço',
        message: 'Para adicionar um cartão precisamos do seu endereço. Vamos preencher seu CEP no perfil.',
        buttons: [{ text: 'Preencher CEP', onPress: () => (navigation as any).navigate('EditProfile', { focusCep: true }) }],
      });
      return;
    }
    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    // O cadastro de cartão pode falhar de verdade no backend (ex: 422 quando o Asaas rejeita
    // o holderInfo — falta de CEP/endereço do titular, ver DEMANDA_CARTAO_POST_500_BACKEND.md).
    // Sem try/catch, a promise rejeitada virava "Uncaught (in promise): AxiosError 422", o botão
    // ficava travado em "salvando" e o aluno não via mensagem nenhuma. Agora tratamos e exibimos
    // o erro real da API.
    try {
      const result = await addCard({
        number: formData.number.replace(/\s/g, ''),
        holderName: formData.holderName.trim(),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        nickname: formData.nickname || undefined,
      });

      if ('duplicate' in result) {
        showAlert({
          title: 'Cartão já cadastrado',
          message: `Este cartão ${result.existing.brand} final ${result.existing.lastDigits} já está na sua conta.`,
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      showAlert({
        title: 'Cartão salvo',
        message: `${result.brand} final ${result.lastDigits} adicionado com sucesso.`,
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Não foi possível salvar o cartão',
        message: getApiErrorMessage(error, 'Verifique os dados do cartão e se seu endereço está completo no perfil, depois tente novamente.'),
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormEmpty = !formData.number && !formData.holderName && !formData.expiryDate && !formData.cvv;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Adicionar Cartão" showBack onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {brand !== 'Unknown' && formData.number.length > 0 && (
            <View style={styles.brandRow}>
              <CardFlagIcon brand={brand} size={32} />
              <Text style={styles.brandText}>{brand}</Text>
            </View>
          )}

          <CardForm
            onChange={handleFormChange}
            onBrandChange={setBrand}
            errors={errors}
          />

          {saving && (
            <ActivityIndicator
              color={colors.primary}
              size="large"
              style={styles.savingIndicator}
            />
          )}

          <Button
            title="Salvar Cartão"
            onPress={handleSave}
            disabled={isFormEmpty || saving}
          />

          <Text style={styles.securityNote}>
            <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />{' '}
            Seus dados são protegidos. Número completo e CVV não são armazenados.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddCardScreen;

