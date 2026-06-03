import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 8, textAlign: 'center' },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  className: { fontSize: 16, fontWeight: '600', color: colors.text },
  instructor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  date: { color: colors.textSecondary, fontSize: 13 },
});
