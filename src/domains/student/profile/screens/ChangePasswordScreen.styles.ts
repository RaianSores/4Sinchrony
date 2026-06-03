import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  form: { padding: 20 },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFlex: {
    flex: 1,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
  eyeBtn: { paddingHorizontal: 14 },
  buttonRow: { marginTop: 28 },
});
