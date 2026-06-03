import { StyleSheet } from 'react-native';
import { borderRadius } from '../../../../shared/theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1, marginRight: 12 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  description: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
