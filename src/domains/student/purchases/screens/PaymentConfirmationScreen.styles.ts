import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  iconCircle: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  pixSection: { alignItems: 'center', marginBottom: 24 },
  qrCode: { width: 200, height: 200, marginBottom: 16 },
  pixCodeBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixCodeLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  pixCode: { color: colors.text, fontSize: 12, fontFamily: 'monospace' },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: { color: colors.textSecondary, fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  buttons: { gap: 8 },
});
