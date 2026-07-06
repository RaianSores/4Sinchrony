import React from 'react';
import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

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
  const { colors } = useTheme();

  const height = size === 'md' ? 48 : 56;
  const fontSize = size === 'md' ? 15 : 17;

  const bgColor = {
    primary:   colors.primary,
    secondary: 'transparent',
    outline:   'transparent',
    dark:      colors.navy,
  }[variant];

  const textColor = {
    primary:   colors.black,       // #0A0519 sobre laranja — identidade da marca
    secondary: colors.textSecondary,
    outline:   colors.primary,
    dark:      colors.white,
  }[variant];

  const borderStyle = variant === 'outline'
    ? { borderWidth: 1.5, borderColor: colors.primary }
    : variant === 'secondary'
    ? { borderWidth: 1, borderColor: colors.border }
    : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          height,
          borderRadius: borderRadius.lg,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: spacing.xs,
          paddingHorizontal: spacing.xl,
          backgroundColor: bgColor,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        borderStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={8}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      android_disableSound
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} size="small" />
      ) : (
        <Text style={{ fontSize, fontWeight: '600', color: textColor }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
