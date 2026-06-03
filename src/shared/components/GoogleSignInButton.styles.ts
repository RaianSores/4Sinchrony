import { StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../theme';

export const mkStyles = (colors: any) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  icon: { marginRight: 10 },
  text: { fontSize: 16, fontWeight: '600', color: colors.text },
});
