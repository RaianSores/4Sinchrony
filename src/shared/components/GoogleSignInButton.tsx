import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress, loading, label = 'Continuar com Google',
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.textSecondary} size="small" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color={colors.text} style={styles.icon} />
          <Text style={styles.text}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
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

export default GoogleSignInButton;
