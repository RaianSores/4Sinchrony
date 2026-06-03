import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
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
