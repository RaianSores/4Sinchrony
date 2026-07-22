import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, required, secureTextEntry, ...inputProps }) => {
  const { colors } = useTheme();
  // Campos de senha ganham um olho pra alternar a visibilidade (dentro do input).
  const isPassword = !!secureTextEntry;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
        {label}{required ? ' *' : ''}
      </Text>
      {isPassword ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.inputBg,
            paddingHorizontal: spacing.sm,
          }}
        >
          <TextInput
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={hidden}
            style={{ flex: 1, height: 48, color: colors.text, fontSize: 15, paddingRight: spacing.sm }}
            {...inputProps}
          />
          <TouchableOpacity
            onPress={() => setHidden(h => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
};

export default FormInput;
