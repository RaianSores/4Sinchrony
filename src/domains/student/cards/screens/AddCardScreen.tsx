import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardBrand } from '../../../../shared/types';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';
import { useCardStore } from '../store/useCardStore';
import CardForm from '../components/CardForm';
import CardFlagIcon from '../components/CardFlagIcon';
import { detectBrand } from '../utils/cardUtils';
import { isValidCardNumber, isValidExpiry, isValidCVV, isValidHolderName } from '../validators/cardValidator';

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

const AddCardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { addCard } = useCardStore();
  const { showAlert } = useAppAlert();
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
    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    const result = await addCard({
      number: formData.number.replace(/\s/g, ''),
      holderName: formData.holderName.trim(),
      expiryDate: formData.expiryDate,
      cvv: formData.cvv,
      nickname: formData.nickname || undefined,
    });

    setSaving(false);

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
  };

  const isFormEmpty = !formData.number && !formData.holderName && !formData.expiryDate && !formData.cvv;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Adicionar Cartão" showBack onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 24 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandText: { fontSize: 16, fontWeight: '600', color: colors.text },
  savingIndicator: { paddingVertical: 8 },
  securityNote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});

export default AddCardScreen;
