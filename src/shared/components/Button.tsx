import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', style, disabled, loading, size = 'lg',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 'md' && styles.medium,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'dark' && styles.dark,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primaryDark : theme.colors.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            size === 'md' && styles.textMedium,
            variant === 'outline' && styles.textOutline,
            variant === 'secondary' && styles.textSecondary,
            variant === 'dark' && styles.textDark,
            disabled && styles.textDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  medium: {
    height: 48,
  },
  primary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: theme.colors.primaryDark,
    backgroundColor: 'transparent',
  },
  dark: {
    backgroundColor: theme.colors.primaryDark,
    ...theme.shadow.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  textMedium: {
    fontSize: 15,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  textOutline: {
    color: theme.colors.primaryDark,
  },
  textDark: {
    color: theme.colors.white,
  },
  textDisabled: {
    color: theme.colors.gray,
  },
});

export default Button;
