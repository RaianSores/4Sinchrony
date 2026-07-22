import { StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16, paddingTop: 20 },

    emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
    emptyButton: { marginTop: 24, alignSelf: 'stretch' },

    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(18,135,175,0.20)',
      padding: spacing.md,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    planTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    planTagText: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    statusText: { fontSize: 12, fontWeight: '700' },

    pkgName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 },

    creditsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    creditsValue: { fontSize: 34, fontWeight: '800', color: colors.primary },
    creditsLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },

    divider: { height: 1, backgroundColor: 'rgba(18,135,175,0.15)', marginVertical: 16 },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    metaText: { fontSize: 14, color: colors.textSecondary },

    benefitsCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(18,135,175,0.20)',
      padding: spacing.md,
      marginTop: 16,
    },
    benefitsTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    benefitIcon: { fontSize: 16 },
    benefitName: { fontSize: 14, color: colors.text, flex: 1 },

    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(18,135,175,0.20)',
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginTop: 16,
    },
    linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  });
