import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, required, ...inputProps }) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
        {label}{required ? ' *' : ''}
      </Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={{
          height: 48,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.inputBg,
          paddingHorizontal: spacing.sm,
          color: colors.text,
          fontSize: 15,
        }}
        {...inputProps}
      />
      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
};

export default FormInput;
