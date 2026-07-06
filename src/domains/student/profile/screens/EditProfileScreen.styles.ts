import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  form: { padding: 20 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: colors.inputBg, borderRadius: borderRadius.md, padding: 16, color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4, marginLeft: 2 },
});
