import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../shared/theme';

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
    title: { fontSize: 18, fontWeight: '700', color: colors.text },
    legend: { paddingHorizontal: 16, paddingBottom: 12 },
    legendText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, color: colors.textSecondary },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: borderRadius.md,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: '600', color: colors.text },
    email: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
    badgeText: { fontSize: 11, fontWeight: '600' },
    toggleArea: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  });
