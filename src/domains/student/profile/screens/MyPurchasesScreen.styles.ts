import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 8, textAlign: 'center' },
  purchaseCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  purchaseHeader: { flexDirection: 'row', alignItems: 'center' },
  purchaseName: { fontSize: 17, fontWeight: '600', color: colors.text },
  purchaseDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  purchasePayment: { color: colors.textSecondary, fontSize: 14 },
  purchaseAmount: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
