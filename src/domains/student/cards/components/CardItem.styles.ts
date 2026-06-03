import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardBrand: { fontSize: 17, fontWeight: '600', color: colors.text },
  cardDigits: { fontSize: 15, color: colors.text, fontWeight: '500', marginTop: 2, letterSpacing: 1 },
  cardDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  cardNickname: { fontSize: 12, color: colors.primary, fontStyle: 'italic', marginTop: 4 },
  defaultBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultText: { color: colors.success, fontSize: 11, fontWeight: '600' },
  cardActions: { gap: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { padding: 6 },
});
