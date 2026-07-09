import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

export interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string | null;
  options: FormSelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Picker próprio via Modal — sem depender de nenhuma lib de picker nativo, reaproveita
// o mesmo padrão de Modal já usado em AlertModal.tsx.
const FormSelect: React.FC<FormSelectProps> = ({
  label, value, options, onSelect, placeholder = 'Selecione...', error, required, disabled,
}) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>
        {label}{required ? ' *' : ''}
      </Text>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          height: 48,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.inputBg,
          paddingHorizontal: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{ fontSize: 15, color: selected ? colors.text : colors.textSecondary }} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(10,5,25,0.90)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: borderRadius.xl,
            borderTopRightRadius: borderRadius.xl,
            maxHeight: '70%',
            paddingBottom: spacing.lg,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, padding: spacing.md }}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.lg }}>
                  Nenhuma opção disponível
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => { onSelect(item.value); setOpen(false); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      paddingHorizontal: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <Text style={{ fontSize: 15, color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '400' }}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default FormSelect;
