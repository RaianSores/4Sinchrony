import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  emptyTitle: { color: colors.textSecondary, fontSize: 20, fontWeight: '700', marginTop: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, marginHorizontal: 16, marginVertical: 4, borderRadius: borderRadius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyClassName: { fontSize: 16, fontWeight: '600', color: colors.text },
  historyInstructor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  historyDate: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  historyStatus: { fontSize: 12, fontWeight: '600' },
});
