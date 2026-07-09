import { StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
    listContent: { paddingHorizontal: 16, flexGrow: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultCount: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },

    // Modal de adicionar/editar
    modalOverlay: { flex: 1, backgroundColor: 'rgba(10,5,25,0.90)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalCancelButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalCancelText: { fontSize: 14, fontWeight: '600', color: colors.text },
  });
