import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CardBrand } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';
import { detectBrand, formatCardNumber, formatExpiry, formatCVV } from '../utils/cardUtils';

interface CardFormData {
  number: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  nickname: string;
}

interface CardFormErrors {
  number?: string;
  holderName?: string;
  expiryDate?: string;
  cvv?: string;
}

interface CardFormProps {
  onChange: (data: CardFormData) => void;
  onBrandChange: (brand: CardBrand) => void;
  errors: CardFormErrors;
}

const CardForm: React.FC<CardFormProps> = ({ onChange, onBrandChange, errors }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const [form, setForm] = useState<CardFormData>({
    number: '',
    holderName: '',
    expiryDate: '',
    cvv: '',
    nickname: '',
  });

  const updateField = useCallback(
    (field: keyof CardFormData, value: string) => {
      let processed = value;

      switch (field) {
        case 'number': {
          processed = formatCardNumber(value);
          const brand = detectBrand(processed);
          onBrandChange(brand);
          break;
        }
        case 'expiryDate':
          processed = formatExpiry(value);
          break;
        case 'cvv': {
          const brand = detectBrand(form.number);
          processed = formatCVV(value, brand);
          break;
        }
        case 'nickname':
        case 'holderName':
          processed = value;
          break;
      }

      const updated = { ...form, [field]: processed };
      setForm(updated);
      onChange(updated);
    },
    [form, onChange, onBrandChange],
  );

  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Número do cartão</Text>
        <TextInput
          style={[styles.input, errors.number && styles.inputError]}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={form.number}
          onChangeText={v => updateField('number', v)}
          maxLength={19}
        />
        {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome do titular</Text>
        <TextInput
          style={[styles.input, errors.holderName && styles.inputError]}
          placeholder="Como no cartão"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
          value={form.holderName}
          onChangeText={v => updateField('holderName', v)}
        />
        {errors.holderName && <Text style={styles.errorText}>{errors.holderName}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>Validade</Text>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputError]}
            placeholder="MM/AA"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={form.expiryDate}
            onChangeText={v => updateField('expiryDate', v)}
            maxLength={5}
          />
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv && styles.inputError]}
            placeholder="123"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            secureTextEntry
            value={form.cvv}
            onChangeText={v => updateField('cvv', v)}
            maxLength={4}
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Apelido (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Meu Visa, Cartão do trabalho"
          placeholderTextColor={colors.textSecondary}
          value={form.nickname}
          onChangeText={v => updateField('nickname', v)}
        />
      </View>
    </View>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 2 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginLeft: 2 },
  row: { flexDirection: 'row', gap: 12 },
});

export default CardForm;
