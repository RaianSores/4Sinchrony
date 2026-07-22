import { StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../../../../shared/theme';

export const mkStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingTop: 8, flexGrow: 1 },
    intro: { fontSize: 13, lineHeight: 18, color: colors.textSecondary, marginBottom: 12 },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(10,5,25,0.90)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.md,
      paddingBottom: spacing.xl,
      maxHeight: '88%',
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
    removeButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239,68,68,0.10)',
    },
    removeText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  });
