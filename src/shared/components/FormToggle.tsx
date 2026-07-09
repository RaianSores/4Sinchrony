import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../theme';

interface FormToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const FormToggle: React.FC<FormToggleProps> = ({ label, description, value, onValueChange, disabled }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm }}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{label}</Text>
        {description ? (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default FormToggle;
