import { StyleSheet } from 'react-native';
import { borderRadius, shadow } from '../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  classCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...shadow.sm },
  classHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  classTime: { fontSize: 16, fontWeight: '700', color: colors.text },
  className: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 10 },
  classDetails: { gap: 6, marginBottom: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: colors.textSecondary },
  classActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: borderRadius.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  actionBtnText: { fontSize: 14, fontWeight: '500' },
  });
