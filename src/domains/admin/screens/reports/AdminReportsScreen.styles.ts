import { StyleSheet } from 'react-native';
import { borderRadius, shadow } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 40 },

    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    filterChipTextActive: { color: colors.white },

    cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    metricCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow.sm,
    },
    metricValue: { fontSize: 24, fontWeight: '700', color: colors.text },
    metricLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    metricSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 12 },

    occupancyRow: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 8,
    },
    occupancyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    occupancyClassName: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
    occupancyBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full },
    occupancyBadgeText: { fontSize: 12, fontWeight: '700' },
    occupancyDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },

    chartEmptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartEmptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

    barChart: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    barColumn: { alignItems: 'center', gap: 4 },
    barValue: { fontSize: 12, fontWeight: '600', color: colors.text },
    barTrack: { height: 80, justifyContent: 'flex-end' },
    bar: { width: 24, backgroundColor: colors.primaryDark, borderRadius: 4 },
    barLabel: { fontSize: 10, color: colors.textSecondary },
  });
