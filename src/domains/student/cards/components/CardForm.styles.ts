import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
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
